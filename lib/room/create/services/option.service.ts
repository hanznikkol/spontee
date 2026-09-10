import { GenerateOptionsPayload } from "../payload/option.dto";
import { PreferenceBudget } from "../types/budget";
import { GooglePlace } from "../types/google-place";
import { RoomOptionCandidate } from "../types/option-types";
import { mapGooglePriceLevel } from "../utils/price-level";
import { calculateHaversineDistance, calculateDistanceFactor } from "../utils/geo.utils";
import { normalizeBrand, getBrandPenalty } from "../utils/brand.utils";
import * as googlePlaceService from "./google-place.service";

interface CategorySearchResult {
    category: string;
    places: GooglePlace[];
}

// ---------------------------------------------------------------------------
// Radius Constants & Classification
// ---------------------------------------------------------------------------

/** Hard maximum retrieval radius (meters). No candidate beyond this is ever used. */
export const MAX_RETRIEVAL_RADIUS = 10000;

/**
 * Whether a candidate falls inside the user's preferred radius, inside the
 * expanded fallback radius, or completely outside the allowed range.
 */
export type RadiusScope = "preferred" | "fallback" | "outside";

/**
 * Classifies a candidate's actual geographic distance against the preferred
 * and fallback radii. Based on Haversine distance — not on which retrieval pass
 * returned the place (a Pass 3 result may still be inside the preferred radius).
 */
export function getRadiusScope(
    distanceMeters: number,
    preferredRadius: number,
    fallbackRadius: number
): RadiusScope {
    if (distanceMeters <= preferredRadius) return "preferred";
    if (distanceMeters <= fallbackRadius) return "fallback";
    return "outside";
}

/**
 * Converts radius scope into a ranking multiplier.
 *
 * - Inside preferred radius: 1.00 (no penalty)
 * - Just outside preferred radius: ~0.85
 * - At the edge of fallback radius: ~0.65
 * - Beyond fallback radius: 0 (effectively excluded from scoring)
 *
 * The gradient ensures a substantially better venue outside the preferred
 * radius can still outrank a weak venue inside it, while making clear that
 * the user's selected radius is the true preference.
 */
export function calculateRadiusScopeFactor(
    distanceMeters: number,
    preferredRadius: number,
    fallbackRadius: number
): number {
    if (distanceMeters <= preferredRadius) return 1.0;
    if (distanceMeters > fallbackRadius) return 0;

    const fallbackSpan = fallbackRadius - preferredRadius;
    if (fallbackSpan <= 0) return 0;

    // Linear gradient from 0.85 (just outside preferred) to 0.65 (edge of fallback)
    const fallbackProgress = (distanceMeters - preferredRadius) / fallbackSpan;
    return 0.85 - fallbackProgress * 0.20;
}

// ---------------------------------------------------------------------------
// Candidate Collection Target
// ---------------------------------------------------------------------------

/**
 * Returns the desired usable candidate pool size — the number of quality
 * candidates we want BEFORE final diversity selection.
 *
 * This is a soft target: the engine will try to reach it across multiple
 * retrieval passes, stopping early when the pool is healthy enough.
 *
 * Using 1.5× maxOptions gives a small, practical buffer without
 * triggering excessive API calls:
 *   5  → 8
 *   10 → 15
 *   15 → 23
 *   20 → 30
 */
export function getCandidateTarget(maxOptions: number): number {
    return Math.ceil(maxOptions * 1.5);
}

// ---------------------------------------------------------------------------
// GENERATE SERVICE (main entry point)
// ---------------------------------------------------------------------------
export async function generate(payload: GenerateOptionsPayload) {
    const candidateTarget = getCandidateTarget(payload.maxOptions);

    // The user's selected radius is the preferred scope.
    // The engine may expand beyond it only as a controlled fallback.
    const preferredRadius = payload.radius;
    const fallbackRadius = Math.min(MAX_RETRIEVAL_RADIUS, Math.round(preferredRadius * 1.5));

    // --- Retrieval ---
    const { searchResults, passStats } = await collectCandidates(payload, candidateTarget, preferredRadius, fallbackRadius);
    const uniquePlaces = deduplicateAndMergePlaces(searchResults);

    // --- Retry exclusion ---
    let eligiblePlaces = uniquePlaces;
    const retryExcludeSet = payload.excludePlaceIds?.length
        ? new Set(payload.excludePlaceIds)
        : null;
    if (retryExcludeSet) {
        eligiblePlaces = eligiblePlaces.filter((p) => !retryExcludeSet.has(p.id));
    }

    // --- Attach distance (Haversine from search origin) ---
    const placesWithDistance = attachDistance(eligiblePlaces, payload.latitude, payload.longitude);

    // --- Hard radius cap: remove any candidate beyond the maximum allowed radius ---
    // Candidates that somehow slip through beyond the fallback radius are never selected.
    // Classification is based on actual Haversine distance, not which retrieval pass returned the place.
    const radiusScopedPlaces = placesWithDistance.filter(
        (p) => (p.distanceMeters ?? Infinity) <= fallbackRadius
    );

    // --- Filter (hard gates only — permanently/temporarily closed) ---
    const preFilterCount = radiusScopedPlaces.length;
    const filteredPlaces = filterCandidates(radiusScopedPlaces);
    const removedByClosedStatus = preFilterCount - filteredPlaces.length;

    // --- Budget filter ---
    const budgetFilteredPlaces = filterByBudget(filteredPlaces, payload.budget);
    const removedByBudget = filteredPlaces.length - budgetFilteredPlaces.length;

    // --- Rank (quality + confidence + open + distance + radius scope + budget + category) ---
    const rankedPlaces = rankCandidates(
        budgetFilteredPlaces,
        payload.budget,
        payload.categoryNames,
        preferredRadius,
        fallbackRadius
    );

    // --- Brand-aware diversity selection ---
    const diversePlaces = selectDiverseOptions(rankedPlaces, payload.categoryNames, payload.maxOptions, preferredRadius, fallbackRadius);

    // --- Diagnostics (development only) ---
    if (process.env.NODE_ENV === "development") {
        const rawCount = searchResults.reduce((acc, c) => acc + c.places.length, 0);
        const lowReviewCandidates = filteredPlaces.filter((p) => (p.userRatingCount ?? 0) < 20).length;
        const noRatingCandidates = filteredPlaces.filter((p) => !p.rating && !p.userRatingCount).length;
        const uniqueBrands = new Set(diversePlaces.map((p) => p.normalizedBrand ?? normalizeBrand(p.name)));
        const uniquePrimaryTypes = new Set(diversePlaces.map((p) => p.primaryType ?? "unknown"));
        const allUniqueBrandsInPool = new Set(rankedPlaces.map((p) => normalizeBrand(p.name)));

        // Radius-scope breakdown of the final deck
        const finalPreferredCount = diversePlaces.filter(
            (p) => (p.distanceMeters ?? Infinity) <= preferredRadius
        ).length;
        const finalFallbackCount = diversePlaces.filter(
            (p) => {
                const d = p.distanceMeters ?? Infinity;
                return d > preferredRadius && d <= fallbackRadius;
            }
        ).length;

        // Radius-scope breakdown of the candidate pool (after budget filter)
        const poolPreferredCount = budgetFilteredPlaces.filter(
            (p) => (p.distanceMeters ?? Infinity) <= preferredRadius
        ).length;
        const poolFallbackCount = budgetFilteredPlaces.filter(
            (p) => {
                const d = p.distanceMeters ?? Infinity;
                return d > preferredRadius && d <= fallbackRadius;
            }
        ).length;

        console.log("[Option Engine Diagnostics]", {
            requestedMaxOptions: payload.maxOptions,
            desiredCandidatePool: candidateTarget,

            // Retrieval
            rawCandidatesCollected: rawCount,
            uniquePlacesAfterDedupe: uniquePlaces.length,
            afterRetryExclusion: eligiblePlaces.length,
            removedBeyondMaxRadius: placesWithDistance.length - radiusScopedPlaces.length,
            ...passStats,

            // Filtering
            removedByClosedStatus,
            candidatesWithNoRatings: noRatingCandidates,
            lowReviewCandidates,
            removedByBudget,

            // After filtering
            afterQualityFilter: filteredPlaces.length,
            afterBudgetFilter: budgetFilteredPlaces.length,

            // Radius scope of candidate pool
            poolPreferredRadiusCandidates: poolPreferredCount,
            poolFallbackRadiusCandidates: poolFallbackCount,

            // Pool diversity
            uniqueBrandsInPool: allUniqueBrandsInPool.size,
            uniquePrimaryTypesInPool: new Set(rankedPlaces.map((p) => p.primaryType ?? "unknown")).size,

            // Final deck
            finalOptions: diversePlaces.length,
            uniqueBrands: uniqueBrands.size,
            uniquePrimaryTypes: uniquePrimaryTypes.size,
            finalBrands: [...uniqueBrands].sort(),
            finalPrimaryTypes: [...uniquePrimaryTypes].sort(),
        });

        // Radius-specific diagnostics (separate log for clarity)
        console.log("[Option Engine] Radius Diagnostics", {
            preferredRadius,
            fallbackRadius,
            candidatesWithinPreferredRadius: poolPreferredCount,
            candidatesWithinFallbackRadius: poolFallbackCount,
            candidatesOutsideAllowedRadius: placesWithDistance.length - radiusScopedPlaces.length,
            finalPreferredRadiusOptions: finalPreferredCount,
            finalFallbackRadiusOptions: finalFallbackCount,
        });
    }

    return convertGooglePlaceToOption(diversePlaces);
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function searchCategory(
    categoryName: string,
    placeTypes: readonly string[] | string[],
    latitude: number,
    longitude: number,
    radius: number,
    maxResultCount?: number
): Promise<GooglePlace[]> {
    if (!placeTypes.length) return [];
    try {
        return await googlePlaceService.searchNearby({
            placeTypes,
            latitude,
            longitude,
            radius,
            maxResultCount,
        });
    } catch (error) {
        console.warn(`Places search failed for category "${categoryName}":`, error);
        return [];
    }
}

// ---------------------------------------------------------------------------
// Adaptive Candidate Collection
// ---------------------------------------------------------------------------

/**
 * Determines whether the current candidate pool is healthy enough to stop
 * retrieval. Checks both quantity and brand diversity.
 *
 * "Healthy" means:
 *   - Enough candidates for the final deck + small buffer.
 *   - Enough unique brands so diversity selection can produce varied results.
 *
 * The brand diversity check uses a 60% rule: we want at least 0.6 × maxOptions
 * unique brands in the eligible pool so the selector has real choices to work with.
 */
export function hasHealthyCandidatePool(
    candidates: GooglePlace[],
    maxOptions: number,
    excludeSet?: Set<string> | null
): boolean {
    const eligible = excludeSet
        ? candidates.filter((p) => !excludeSet.has(p.id))
        : candidates;

    const desiredPool = getCandidateTarget(maxOptions);
    if (eligible.length < desiredPool) return false;

    const uniqueBrands = new Set(eligible.map((p) => normalizeBrand(p.name)));
    const minimumUniqueBrands = Math.ceil(maxOptions * 0.6);

    return uniqueBrands.size >= minimumUniqueBrands;
}

/**
 * Collects a sufficiently large candidate pool before filtering and ranking.
 *
 * Strategy:
 * - Pass 1: Primary search across selected categories at the user's preferred radius.
 * - Pass 2: If still below healthy threshold, re-query with the second half of
 *           place types (still at preferred radius). Diagnostics measure new candidates.
 * - Pass 3: ONLY if the preferred-radius pool is genuinely insufficient.
 *           Expand to fallbackRadius (1.5×, up to MAX_RETRIEVAL_RADIUS).
 *
 * Health check for Pass 3 trigger uses ONLY preferred-radius candidates.
 * Fallback-radius candidates do not count toward the preferred pool being "healthy".
 */
export async function collectCandidates(
    payload: GenerateOptionsPayload,
    candidateTarget: number,
    preferredRadius: number,
    fallbackRadius: number
): Promise<{ searchResults: CategorySearchResult[]; passStats: Record<string, number> }> {
    if (!payload.categoryNames?.length) {
        return { searchResults: [], passStats: {} };
    }

    const excludeSet = payload.excludePlaceIds?.length
        ? new Set(payload.excludePlaceIds)
        : null;

    const searchResults: CategorySearchResult[] = [];
    const passStats: Record<string, number> = {
        pass1Unique: 0,
        pass2NewUnique: 0,
        pass3NewUnique: 0,
    };

    // Helper: compute inline Haversine distance so we can classify candidates
    // by radius scope inside collectCandidates, before the main attachDistance() call.
    const inlineDistance = (place: GooglePlace) =>
        calculateHaversineDistance(payload.latitude, payload.longitude, place.latitude, place.longitude);

    // Helper: count non-excluded, preferred-radius-only candidates for health check.
    // Fallback-radius candidates must NOT count toward the preferred pool being healthy.
    const countPreferredHealthy = (places: GooglePlace[]): number => {
        return places.filter((p) => {
            if (excludeSet?.has(p.id)) return false;
            return inlineDistance(p) <= preferredRadius;
        }).length;
    };

    // ----- Pass 1: Primary search at preferredRadius -----
    const pass1Promises = payload.categoryNames.map(async (categoryName) => {
        const placeTypes = googlePlaceService.getPlaceTypes(categoryName);
        const places = await searchCategory(
            categoryName,
            placeTypes,
            payload.latitude,
            payload.longitude,
            preferredRadius
        );
        return { category: categoryName, places };
    });

    const pass1Results = await Promise.allSettled(pass1Promises);
    const pass1Groups: CategorySearchResult[] = [];
    for (const res of pass1Results) {
        if (res.status === "fulfilled") {
            pass1Groups.push(res.value);
            searchResults.push(res.value);
        }
    }

    const pass1Unique = deduplicateAndMergePlaces(pass1Groups);
    passStats.pass1Unique = pass1Unique.length;

    // Early-exit check: only count preferred-radius candidates
    if (hasHealthyCandidatePool(pass1Unique, payload.maxOptions, excludeSet)) {
        return { searchResults, passStats };
    }

    // ----- Pass 2: Secondary sub-type batches (still at preferredRadius) -----
    // Re-queries the second half of place types for categories with >= 6 types.
    // Diagnostics measure how many genuinely new candidates this adds.
    const pass2Groups: CategorySearchResult[] = [];
    const pass2Promises: Promise<CategorySearchResult>[] = [];

    for (const categoryName of payload.categoryNames) {
        const placeTypes = googlePlaceService.getPlaceTypes(categoryName);
        if (placeTypes.length >= 6) {
            const secondaryTypes = placeTypes.slice(Math.floor(placeTypes.length / 2));
            pass2Promises.push(
                searchCategory(
                    categoryName,
                    secondaryTypes,
                    payload.latitude,
                    payload.longitude,
                    preferredRadius   // still at preferred radius — no expansion yet
                ).then((places) => ({ category: categoryName, places }))
            );
        }
    }

    if (pass2Promises.length > 0) {
        const pass2Results = await Promise.allSettled(pass2Promises);
        for (const res of pass2Results) {
            if (res.status === "fulfilled") {
                pass2Groups.push(res.value);
            }
        }

        // Measure new candidates contributed by Pass 2 (dev diagnostics)
        const pass1Ids = new Set(pass1Unique.map((p) => p.id));
        const afterPass2Unique = deduplicateAndMergePlaces([...pass1Groups, ...pass2Groups]);
        const newFromPass2 = afterPass2Unique.filter((p) => !pass1Ids.has(p.id));
        passStats.pass2NewUnique = newFromPass2.length;

        if (process.env.NODE_ENV === "development") {
            console.log("[Option Engine] Pass 2 diagnostics", {
                pass1Unique: pass1Unique.length,
                afterPass2Unique: afterPass2Unique.length,
                newFromPass2: newFromPass2.length,
                verdict: newFromPass2.length >= 3 ? "Pass 2 contributing value" : "Pass 2 near-no-op",
            });
        }

        for (const group of pass2Groups) {
            searchResults.push(group);
        }

        // Check health using only preferred-radius candidates from the combined pool
        const allAfterPass2 = deduplicateAndMergePlaces(searchResults);
        const preferredHealthyAfterPass2 = countPreferredHealthy(allAfterPass2);
        const desiredPool = getCandidateTarget(payload.maxOptions);

        if (preferredHealthyAfterPass2 >= desiredPool) {
            return { searchResults, passStats };
        }
    }

    // ----- Pass 3: Radius expansion to fallbackRadius -----
    // Only triggered when the preferred-radius pool is genuinely insufficient.
    // fallbackRadius is always > preferredRadius (guaranteed by caller).
    if (fallbackRadius > preferredRadius) {
        const beforePass3Ids = new Set(deduplicateAndMergePlaces(searchResults).map((p) => p.id));

        const radiusPromises = payload.categoryNames.map(async (categoryName) => {
            const placeTypes = googlePlaceService.getPlaceTypes(categoryName);
            const places = await searchCategory(
                categoryName,
                placeTypes,
                payload.latitude,
                payload.longitude,
                fallbackRadius  // explicitly the fallback — not overwriting preferredRadius
            );
            return { category: categoryName, places };
        });

        const pass3Results = await Promise.allSettled(radiusPromises);
        const pass3Groups: CategorySearchResult[] = [];
        for (const res of pass3Results) {
            if (res.status === "fulfilled") {
                pass3Groups.push(res.value);
                searchResults.push(res.value);
            }
        }

        const afterPass3Unique = deduplicateAndMergePlaces(searchResults);
        const newFromPass3 = afterPass3Unique.filter((p) => !beforePass3Ids.has(p.id));
        passStats.pass3NewUnique = newFromPass3.length;

        if (process.env.NODE_ENV === "development") {
            console.log("[Option Engine] Pass 3 (radius expansion) diagnostics", {
                preferredRadius,
                fallbackRadius,
                newFromPass3: newFromPass3.length,
                totalAfterPass3: afterPass3Unique.length,
            });
        }
    }

    return { searchResults, passStats };
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

/**
 * Deduplicates candidates by canonical Google Place ID while preserving and merging
 * search provenance (searchedCategories), Google place types, and the richest metadata.
 */
export function deduplicateAndMergePlaces(searchResults: CategorySearchResult[]): GooglePlace[] {
    const map = new Map<string, GooglePlace>();

    for (const group of searchResults) {
        for (const place of group.places) {
            const existing = map.get(place.id);
            if (!existing) {
                map.set(place.id, {
                    ...place,
                    searchedCategories: [group.category],
                    types: place.types ? [...place.types] : []
                });
            } else {
                // Merge searched categories
                if (!existing.searchedCategories?.includes(group.category)) {
                    existing.searchedCategories = [...(existing.searchedCategories ?? []), group.category];
                }
                // Merge Google types
                const mergedTypes = new Set([...(existing.types ?? []), ...(place.types ?? [])]);
                existing.types = Array.from(mergedTypes);

                // Preserve richest fields
                if (!existing.primaryType && place.primaryType) {
                    existing.primaryType = place.primaryType;
                }
                if ((!existing.imageUrls || existing.imageUrls.length === 0) && place.imageUrls?.length) {
                    existing.imageUrls = place.imageUrls;
                }
                if (!existing.address && place.address) {
                    existing.address = place.address;
                }
                if (existing.rating === undefined && place.rating !== undefined) {
                    existing.rating = place.rating;
                }
                if (existing.userRatingCount === undefined && place.userRatingCount !== undefined) {
                    existing.userRatingCount = place.userRatingCount;
                }
                if (existing.priceLevel === undefined && place.priceLevel !== undefined) {
                    existing.priceLevel = place.priceLevel;
                }
                if (!existing.description && place.description) {
                    existing.description = place.description;
                }
            }
        }
    }

    return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Distance
// ---------------------------------------------------------------------------

/**
 * Attaches geographic distance (in meters) from search origin to each candidate.
 */
export function attachDistance(places: GooglePlace[], originLat: number, originLon: number): GooglePlace[] {
    return places.map((place) => {
        const distanceMeters = calculateHaversineDistance(
            originLat,
            originLon,
            place.latitude,
            place.longitude
        );
        return {
            ...place,
            distanceMeters,
        };
    });
}

// ---------------------------------------------------------------------------
// Filtering — hard gates only
// ---------------------------------------------------------------------------

/**
 * Hard-excludes only genuinely invalid venues:
 * - Permanently closed businesses
 * - Temporarily closed businesses (not expected to reopen)
 *
 * openNow === false: NOT excluded here. A place closed at 2pm may still be
 * an excellent dinner recommendation. Handled as a soft ranking penalty instead.
 *
 * Low review count: NOT excluded here. Legitimate local businesses in smaller
 * cities may have fewer reviews. Handled as a review-confidence factor in ranking.
 */
export function filterCandidates(places: GooglePlace[]): GooglePlace[] {
    return places.filter((place) => {
        return (
            place.businessStatus !== "CLOSED_PERMANENTLY" &&
            place.businessStatus !== "CLOSED_TEMPORARILY"
        );
    });
}

// ---------------------------------------------------------------------------
// Budget
// ---------------------------------------------------------------------------

/**
 * Calculates the tier distance between a numeric price level (0-4) and the user's budget preference.
 * - Distance 0: Exact match (preferred)
 * - Distance 1: Adjacent match (fallback)
 * - Distance >= 2: Large mismatch (excluded)
 */
export function calculateBudgetDistance(numericPrice: number, budget: PreferenceBudget): number {
    switch (budget) {
        case "low":
            // Free (0) and Inexpensive (1) are exact matches for low budget
            if (numericPrice <= 1) return 0;
            return numericPrice - 1;

        case "medium":
            // Moderate (2) is exact match; Free (0) is distance 2 (excluded)
            if (numericPrice === 0) return 2;
            return Math.abs(numericPrice - 2);

        case "high":
            // Expensive (3) is exact match; Moderate (2) & Very Expensive (4) are adjacent
            if (numericPrice === 0) return 3;
            return Math.abs(numericPrice - 3);

        case "very_high":
            // Very Expensive (4) is exact match; Expensive (3) is adjacent
            if (numericPrice === 0) return 4;
            return Math.abs(numericPrice - 4);

        case "any":
        default:
            return 0;
    }
}

/**
 * Filters out places that severely mismatch the selected budget tier (distance >= 2).
 * Places with unknown price levels (undefined) are preserved as graceful fallbacks.
 */
export function filterByBudget(places: GooglePlace[], budget?: PreferenceBudget): GooglePlace[] {
    if (!budget || budget === "any") {
        return places;
    }

    return places.filter((place) => {
        const numericPrice = mapGooglePriceLevel(place.priceLevel);
        // Unknown price levels are kept to prevent candidate starvation
        if (numericPrice === undefined) {
            return true;
        }

        const distance = calculateBudgetDistance(numericPrice, budget);
        // Exclude large mismatches (distance >= 2)
        return distance <= 1;
    });
}

function getBudgetTier(place: GooglePlace, budget?: PreferenceBudget): number {
    if (!budget || budget === "any") return 0;

    const numericPrice = mapGooglePriceLevel(place.priceLevel);
    if (numericPrice === undefined) {
        // Unknown price level: placed after exact (0) and adjacent (1)
        return 2;
    }

    return calculateBudgetDistance(numericPrice, budget);
}

// ---------------------------------------------------------------------------
// Quality Scoring
// ---------------------------------------------------------------------------

/**
 * Converts a Google rating (0–5) to a normalized score (0–1).
 */
function calculateRatingScore(rating = 0): number {
    return rating / 5;
}

/**
 * Review confidence factor: reflects how trustworthy the rating is based on
 * the number of ratings.
 *
 * Uses a logarithmic curve anchored at 100 reviews = full confidence.
 *   0  reviews → 0.25  (unknown — possible but low confidence)
 *   1  review  → ~0.29
 *   5  reviews → ~0.44
 *   20 reviews → ~0.67
 *   50 reviews → ~0.83
 *  100 reviews → 1.00  (full confidence)
 *
 * A place with 0 reviews is NOT banned. It remains eligible but ranks lower.
 */
export function calculateReviewConfidence(count = 0): number {
    if (count <= 0) return 0.25;
    return Math.min(1, Math.log1p(count) / Math.log1p(100));
}

/**
 * Open status factor: a positive signal when open now, a soft penalty when
 * currently closed, neutral when the status is unknown.
 *
 * Does NOT exclude closed places — a venue closed at 2pm can be an excellent
 * dinner recommendation.
 */
export function calculateOpenStatusFactor(openNow?: boolean): number {
    if (openNow === true) return 1.0;
    if (openNow === false) return 0.85;
    return 0.95; // Unknown — slightly below confirmed-open
}

/**
 * Composite quality score incorporating:
 * - Rating signal (0–1 scale)
 * - Review confidence (logarithmic; low count → lower trust, not zero)
 *
 * A place with a 4.8 rating and 8 reviews still scores well but below an
 * established 4.5-star place with 200 reviews.
 */
export function calculateQualityScore(place: GooglePlace): number {
    const ratingScore = calculateRatingScore(place.rating);
    const confidence = calculateReviewConfidence(place.userRatingCount);
    // Rating is the primary signal; confidence scales it rather than dominating
    return ratingScore * (0.6 + 0.4 * confidence);
}

// ---------------------------------------------------------------------------
// Category Matching
// ---------------------------------------------------------------------------

/**
 * Determines which of the user's selected categories a place matches,
 * inspecting search provenance (searchedCategories) and Google types/primaryType.
 */
export function getMatchedCategories(place: GooglePlace, selectedCategoryNames: string[] = []): string[] {
    if (!selectedCategoryNames.length) return [];

    const placeTypes = new Set<string>([
        ...(place.types ?? []),
        ...(place.primaryType ? [place.primaryType] : [])
    ]);

    const matched = new Set<string>();

    // 1. Check if place was discovered via a specific category search
    for (const searchedCat of place.searchedCategories ?? []) {
        if (selectedCategoryNames.includes(searchedCat)) {
            matched.add(searchedCat);
        }
    }

    // 2. Check place types against category definitions
    for (const categoryName of selectedCategoryNames) {
        const categoryGoogleTypes = googlePlaceService.getPlaceTypes(categoryName);
        const hasMatch = categoryGoogleTypes.some((type) => placeTypes.has(type));
        if (hasMatch) {
            matched.add(categoryName);
        }
    }

    const matchedArray = Array.from(matched);
    return matchedArray.length > 0 ? matchedArray : selectedCategoryNames.slice(0, 1);
}

// ---------------------------------------------------------------------------
// Composite Scoring for Ranking
// ---------------------------------------------------------------------------

/**
 * Calculates a composite score blending:
 * 1. Quality score (rating × review confidence)
 * 2. Category match relevance: ×1.0 (1 match), ×1.15 (2 matches), ×1.30 (3 matches)
 * 3. Distance attenuation factor: 0.85–1.00 (proximity tie-breaker within preferred radius)
 * 4. Open status factor: 1.0 (open), 0.95 (unknown), 0.85 (currently closed)
 * 5. Radius scope factor: 1.0 (inside preferred radius), 0.85→0.65 (fallback zone)
 *
 * distanceFactor and radiusScopeFactor serve different purposes:
 *   distanceFactor  → smooth proximity preference within the preferred radius
 *   radiusScopeFactor → whether the place is inside the user's actual preferred scope
 *
 * The quality score already incorporates review confidence so review count
 * cannot drop a place to zero; it only attenuates confidence in the rating.
 */
export function calculateCompositeScore(
    place: GooglePlace,
    selectedCategoryNames: string[] = [],
    preferredRadius: number = 0,
    fallbackRadius: number = 0
): number {
    const qualityScore = calculateQualityScore(place);
    const openFactor = calculateOpenStatusFactor(place.openNow);
    const radiusScopeFactor = calculateRadiusScopeFactor(
        place.distanceMeters ?? 0,
        preferredRadius,
        fallbackRadius > 0 ? fallbackRadius : preferredRadius
    );

    if (!selectedCategoryNames.length) {
        return qualityScore * openFactor * radiusScopeFactor;
    }

    const matchedCategories = getMatchedCategories(place, selectedCategoryNames);
    const matchCount = matchedCategories.length;

    const categoryMultiplier = 1 + (matchCount - 1) * 0.15;
    const distanceFactor = calculateDistanceFactor(place.distanceMeters ?? 0, preferredRadius);

    return qualityScore * Math.max(1, categoryMultiplier) * distanceFactor * openFactor * radiusScopeFactor;
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

/**
 * Attaches a normalized brand key to each place, then sorts by:
 * 1. Budget tier (exact > adjacent > unknown)
 * 2. Composite score (quality × relevance × distance × radius scope × open status)
 */
function rankCandidates(
    places: GooglePlace[],
    budget?: PreferenceBudget,
    selectedCategoryNames: string[] = [],
    preferredRadius: number = 0,
    fallbackRadius: number = 0
): GooglePlace[] {
    // Attach normalizedBrand during ranking phase
    const withBrand = places.map((p) => ({
        ...p,
        normalizedBrand: normalizeBrand(p.name),
    }));

    return [...withBrand].sort((a, b) => {
        // 1. Budget tier priority (Exact = 0, Adjacent = 1, Unknown = 2)
        const budgetTierA = getBudgetTier(a, budget);
        const budgetTierB = getBudgetTier(b, budget);

        if (budgetTierA !== budgetTierB) {
            return budgetTierA - budgetTierB;
        }

        // 2. Within the same budget tier, sort by composite score descending
        return (
            calculateCompositeScore(b, selectedCategoryNames, preferredRadius, fallbackRadius) -
            calculateCompositeScore(a, selectedCategoryNames, preferredRadius, fallbackRadius)
        );
    });
}

// ---------------------------------------------------------------------------
// Brand-Aware Diversity Selection
// ---------------------------------------------------------------------------

/**
 * Selects a diverse final deck up to maxOptions.
 *
 * The selector runs in three passes, each with brand-awareness applied as a
 * soft penalty — not a hard ban. Brand penalty shapes ordering; it never
 * makes a candidate completely ineligible.
 *
 * Pass 1: Multi-category balanced round-robin (when > 1 category selected).
 *         Prioritizes candidates where brand count === 0 (first occurrence).
 *
 * Pass 2: Score-weighted top-candidate selection.
 *         Brand penalty multiplies the composite score to deprioritize repeat brands.
 *         Type cap (maxPerType) prevents any single Google type from dominating.
 *
 * Pass 3: Graceful backfill — any remaining candidates in ranked order.
 *         Ensures the deck reaches maxOptions even in sparse locations.
 *
 * Priority: quality > category relevance > diversity
 * Diversity shapes good candidates; it does not replace them.
 */
export function selectDiverseOptions(
    rankedCandidates: GooglePlace[],
    selectedCategories: string[],
    maxOptions: number,
    preferredRadius: number = 0,
    fallbackRadius: number = 0
): GooglePlace[] {
    if (rankedCandidates.length <= maxOptions) {
        return rankedCandidates;
    }

    const selected: GooglePlace[] = [];
    const selectedIds = new Set<string>();

    // Per-type cap: prevents any single Google primaryType from dominating
    const typeCount = new Map<string, number>();
    const maxPerType = Math.max(2, Math.ceil(maxOptions / 4));

    // Per-brand tracking (soft penalty, not hard cap)
    const brandCount = new Map<string, number>();

    const getBrand = (p: GooglePlace) => p.normalizedBrand ?? normalizeBrand(p.name);

    /**
     * Attempts to add a candidate. Returns true if added.
     * Applies type cap strictly but brand penalty as a scoring weight, not a gate.
     */
    const tryAdd = (candidate: GooglePlace, ignoreBrandPenalty = false): boolean => {
        if (selectedIds.has(candidate.id)) return false;

        const pType = candidate.primaryType ?? "general";
        const currentTypeCount = typeCount.get(pType) ?? 0;
        if (currentTypeCount >= maxPerType) return false;

        const brand = getBrand(candidate);
        const currentBrandCount = brandCount.get(brand) ?? 0;

        // In backfill mode (Pass 3), ignore brand penalty — accept anything
        if (!ignoreBrandPenalty) {
            // During normal selection, skip if brand saturation is very high
            // (count >= 2) and we have not yet used half the deck.
            // This ensures the top of the deck is brand-diverse; backfill handles rest.
            if (currentBrandCount >= 2 && selected.length < Math.ceil(maxOptions * 0.6)) {
                return false;
            }
        }

        selected.push(candidate);
        selectedIds.add(candidate.id);
        typeCount.set(pType, currentTypeCount + 1);
        brandCount.set(brand, currentBrandCount + 1);
        return true;
    };

    // ----- Pass 1: Multi-Category Balanced Round-Robin -----
    if (selectedCategories.length > 1) {
        // Build per-category queues of brand-score-weighted candidates
        const categoryQueues = new Map<string, GooglePlace[]>();
        for (const cat of selectedCategories) {
            const queue = rankedCandidates
                .filter((p) => getMatchedCategories(p, selectedCategories).includes(cat))
                .sort((a, b) => {
                    // Sort within category queue: prefer first-occurrence brands
                    const brandA = getBrand(a);
                    const brandB = getBrand(b);
                    const penaltyA = getBrandPenalty(brandCount.get(brandA) ?? 0);
                    const penaltyB = getBrandPenalty(brandCount.get(brandB) ?? 0);
                    const scoreA = calculateCompositeScore(a, selectedCategories, preferredRadius, fallbackRadius) * penaltyA;
                    const scoreB = calculateCompositeScore(b, selectedCategories, preferredRadius, fallbackRadius) * penaltyB;
                    return scoreB - scoreA;
                });
            categoryQueues.set(cat, queue);
        }

        let addedInRound = true;
        while (selected.length < maxOptions && addedInRound) {
            addedInRound = false;
            for (const cat of selectedCategories) {
                if (selected.length >= maxOptions) break;
                const queue = categoryQueues.get(cat) ?? [];
                while (queue.length > 0) {
                    const candidate = queue.shift()!;
                    if (tryAdd(candidate)) {
                        addedInRound = true;
                        break;
                    }
                }
            }
        }
    }

    // ----- Pass 2: Brand-Penalized Score-Weighted Selection -----
    // Score all remaining candidates using composite × brand penalty,
    // then pick greedily in that order.
    const remainingAfterPass1 = rankedCandidates.filter((p) => !selectedIds.has(p.id));
    const scoredRemaining = remainingAfterPass1
        .map((p) => {
            const brand = getBrand(p);
            const penalty = getBrandPenalty(brandCount.get(brand) ?? 0);
            const score = calculateCompositeScore(p, selectedCategories, preferredRadius, fallbackRadius) * penalty;
            return { place: p, score };
        })
        .sort((a, b) => b.score - a.score);

    for (const { place } of scoredRemaining) {
        if (selected.length >= maxOptions) break;
        tryAdd(place);
    }

    // ----- Pass 3: Graceful Backfill -----
    // Fill any remaining slots without type or brand restrictions.
    for (const candidate of rankedCandidates) {
        if (selected.length >= maxOptions) break;
        if (!selectedIds.has(candidate.id)) {
            selected.push(candidate);
            selectedIds.add(candidate.id);
        }
    }

    return selected;
}

// ---------------------------------------------------------------------------
// Output Conversion
// ---------------------------------------------------------------------------

function convertGooglePlaceToOption(places: GooglePlace[]): RoomOptionCandidate[] {
    return places.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address ?? "",
        rating: place.rating ?? 0,
        latitude: place.latitude,
        longitude: place.longitude,
        priceLevel: mapGooglePriceLevel(place.priceLevel),
        imageUrls: place.imageUrls,
        distanceMeters: place.distanceMeters,
        description: place.description,
        totalReviews: place.userRatingCount,
    }));
}
