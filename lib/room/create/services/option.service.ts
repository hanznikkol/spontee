import { GenerateOptionsPayload } from "../payload/option.dto";
import { PreferenceBudget } from "../types/budget";
import { GooglePlace } from "../types/google-place";
import { RoomOptionCandidate } from "../types/option-types";
import { mapGooglePriceLevel } from "../utils/price-level";
import { calculateHaversineDistance, calculateDistanceFactor } from "../utils/geo.utils";
import * as googlePlaceService from "./google-place.service";

interface CategorySearchResult {
    category: string;
    places: GooglePlace[];
}

/**
 * Calculates the internal candidate collection target based on requested maxOptions.
 * - maxOptions = 5  -> 20 candidates
 * - maxOptions = 10 -> 20 candidates
 * - maxOptions = 15 -> 30 candidates
 * - maxOptions = 20 -> 40 candidates
 */
export function getCandidateTarget(maxOptions: number): number {
    return Math.max(20, maxOptions * 2);
}

// GENERATE SERVICE
export async function generate(payload: GenerateOptionsPayload) {
    const candidateTarget = getCandidateTarget(payload.maxOptions);
    const searchResults = await collectCandidates(payload, candidateTarget);
    const uniquePlaces = deduplicateAndMergePlaces(searchResults);
    const placesWithDistance = attachDistance(uniquePlaces, payload.latitude, payload.longitude);

    const filteredPlaces = filterCandidates(placesWithDistance);
    const budgetFilteredPlaces = filterByBudget(filteredPlaces, payload.budget);
    const rankedPlaces = rankCandidates(
        budgetFilteredPlaces,
        payload.budget,
        payload.categoryNames,
        payload.radius
    );
    const diversePlaces = selectDiverseOptions(rankedPlaces, payload.categoryNames, payload.maxOptions);

    if (process.env.NODE_ENV === "development") {
        console.log("[Option Engine] Pipeline Diagnostics:", {
            requestedMaxOptions: payload.maxOptions,
            candidateTarget,
            rawCandidatesCollected: searchResults.reduce((acc, c) => acc + c.places.length, 0),
            uniquePlacesAfterDedupe: uniquePlaces.length,
            afterQualityFilter: filteredPlaces.length,
            afterBudgetFilter: budgetFilteredPlaces.length,
            finalOptions: diversePlaces.length,
        });
    }

    return convertGooglePlaceToOption(diversePlaces);
}

// HELPERS
async function searchCategory(
    categoryName: string,
    placeTypes: readonly string[] | string[],
    latitude: number,
    longitude: number,
    radius: number
): Promise<GooglePlace[]> {
    if (!placeTypes.length) return [];
    try {
        return await googlePlaceService.searchNearby({
            placeTypes,
            latitude,
            longitude,
            radius,
        });
    } catch (error) {
        console.warn(`Places search failed for category "${categoryName}":`, error);
        return [];
    }
}

/**
 * Collects a sufficiently large candidate pool before filtering and ranking.
 * Uses an adaptive multi-pass strategy:
 * - Pass 1: Primary search across selected categories at user's selected radius.
 * - Pass 2: If candidates < candidateTarget, expands via secondary sub-type partitions.
 * - Pass 3: If still < candidateTarget, expands radius by 1.5x (up to 10km).
 * - Stops immediately when candidateTarget is reached or all sweet spots are exhausted.
 */
export async function collectCandidates(
    payload: GenerateOptionsPayload,
    candidateTarget: number
): Promise<CategorySearchResult[]> {
    if (!payload.categoryNames?.length) {
        return [];
    }

    const searchResults: CategorySearchResult[] = [];

    // Pass 1: Primary search per category
    const initialPromises = payload.categoryNames.map(async (categoryName) => {
        const placeTypes = googlePlaceService.getPlaceTypes(categoryName);
        const places = await searchCategory(
            categoryName,
            placeTypes,
            payload.latitude,
            payload.longitude,
            payload.radius
        );
        return { category: categoryName, places };
    });

    const pass1Results = await Promise.allSettled(initialPromises);
    for (const res of pass1Results) {
        if (res.status === "fulfilled") {
            searchResults.push(res.value);
        }
    }

    // Check candidate sufficiency
    let uniqueCount = deduplicateAndMergePlaces(searchResults).length;
    if (uniqueCount >= candidateTarget) {
        return searchResults;
    }

    // Pass 2: Adaptive Expansion (Secondary sub-type batches if category has >= 10 types)
    const expansionPromises: Promise<CategorySearchResult>[] = [];

    for (const categoryName of payload.categoryNames) {
        const placeTypes = googlePlaceService.getPlaceTypes(categoryName);
        if (placeTypes.length >= 10) {
            // Query the second half of place types for diverse sub-genres
            const secondaryTypes = placeTypes.slice(Math.floor(placeTypes.length / 2));
            expansionPromises.push(
                searchCategory(
                    categoryName,
                    secondaryTypes,
                    payload.latitude,
                    payload.longitude,
                    payload.radius
                ).then((places) => ({ category: categoryName, places }))
            );
        }
    }

    if (expansionPromises.length > 0) {
        const pass2Results = await Promise.allSettled(expansionPromises);
        for (const res of pass2Results) {
            if (res.status === "fulfilled") {
                searchResults.push(res.value);
            }
        }
        uniqueCount = deduplicateAndMergePlaces(searchResults).length;
        if (uniqueCount >= candidateTarget) {
            return searchResults;
        }
    }

    // Pass 3: Radius Step Expansion (1.5x radius up to 10km) if still below target
    const expandedRadius = Math.min(10000, Math.round(payload.radius * 1.5));
    if (expandedRadius > payload.radius) {
        const radiusPromises = payload.categoryNames.map(async (categoryName) => {
            const placeTypes = googlePlaceService.getPlaceTypes(categoryName);
            const places = await searchCategory(
                categoryName,
                placeTypes,
                payload.latitude,
                payload.longitude,
                expandedRadius
            );
            return { category: categoryName, places };
        });

        const pass3Results = await Promise.allSettled(radiusPromises);
        for (const res of pass3Results) {
            if (res.status === "fulfilled") {
                searchResults.push(res.value);
            }
        }
    }

    return searchResults;
}

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

function filterCandidates(places: GooglePlace[]): GooglePlace[] {
    return places.filter((place) => {
        // 1. Business status check: exclude closed places
        if (place.businessStatus === "CLOSED_PERMANENTLY" ||place.businessStatus === "CLOSED_TEMPORARILY") {
            return false;
        }

        // 2. Review confidence check: minimum 20 user ratings
        if ((place.userRatingCount ?? 0) < 20) {
            return false;
        }

        return true;
    });
}

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

function calculateQualityScore(place: GooglePlace): number {
    const rating = place.rating ?? 0;
    const userRatingCount = place.userRatingCount ?? 0;
    if (rating <= 0 || userRatingCount <= 0) return 0;
    return rating * Math.log10(userRatingCount);
}

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

/**
 * Calculates a composite score blending:
 * 1. Base place quality: rating * log10(userRatingCount)
 * 2. Multi-category match relevance: 1.0x (1 match), 1.15x (2 matches), 1.30x (3 matches)
 * 3. Distance attenuation factor: 0.85 to 1.00 (proximity tie-breaker relative to radius)
 */
export function calculateCompositeScore(
    place: GooglePlace,
    selectedCategoryNames: string[] = [],
    searchRadiusMeters: number = 0
): number {
    const qualityScore = calculateQualityScore(place);
    if (!selectedCategoryNames.length) return qualityScore;

    const matchedCategories = getMatchedCategories(place, selectedCategoryNames);
    const matchCount = matchedCategories.length;

    const categoryMultiplier = 1 + (matchCount - 1) * 0.15;
    const distanceFactor = calculateDistanceFactor(place.distanceMeters ?? 0, searchRadiusMeters);

    return qualityScore * Math.max(1, categoryMultiplier) * distanceFactor;
}

function rankCandidates(
    places: GooglePlace[],
    budget?: PreferenceBudget,
    selectedCategoryNames: string[] = [],
    searchRadiusMeters: number = 0
): GooglePlace[] {
    return [...places].sort((a, b) => {
        // 1. Budget tier priority (Exact = 0, Adjacent = 1, Unknown = 2)
        const budgetTierA = getBudgetTier(a, budget);
        const budgetTierB = getBudgetTier(b, budget);

        if (budgetTierA !== budgetTierB) {
            return budgetTierA - budgetTierB;
        }

        // 2. Within the same budget tier, sort by composite score descending
        return (
            calculateCompositeScore(b, selectedCategoryNames, searchRadiusMeters) -
            calculateCompositeScore(a, selectedCategoryNames, searchRadiusMeters)
        );
    });
}

/**
 * Selects a diverse subset of candidates up to maxOptions:
 * Pass 1: Balanced multi-category round-robin (fair representation across selected categories).
 * Pass 2: Google primaryType saturation cap (prevents duplicate sub-types from crowding out the deck).
 * Pass 3: Graceful backfill from top ranked candidates (guarantees full maxOptions deck without starvation).
 */
export function selectDiverseOptions(
    rankedCandidates: GooglePlace[],
    selectedCategories: string[],
    maxOptions: number
): GooglePlace[] {
    if (rankedCandidates.length <= maxOptions) {
        return rankedCandidates;
    }

    const selected: GooglePlace[] = [];
    const selectedIds = new Set<string>();
    const typeCount = new Map<string, number>();
    const maxPerType = Math.max(2, Math.ceil(maxOptions / 4)); // e.g. Max 2-3 of same exact primaryType

    // Pass 1: Multi-Category Balanced Round-Robin
    if (selectedCategories.length > 1) {
        const categoryQueues = new Map<string, GooglePlace[]>();
        for (const cat of selectedCategories) {
            categoryQueues.set(
                cat,
                rankedCandidates.filter((p) => getMatchedCategories(p, selectedCategories).includes(cat))
            );
        }

        let addedInRound = true;
        while (selected.length < maxOptions && addedInRound) {
            addedInRound = false;
            for (const cat of selectedCategories) {
                if (selected.length >= maxOptions) break;
                const queue = categoryQueues.get(cat) ?? [];
                while (queue.length > 0) {
                    const candidate = queue.shift()!;
                    if (selectedIds.has(candidate.id)) continue;

                    const pType = candidate.primaryType ?? "general";
                    const currentTypeCount = typeCount.get(pType) ?? 0;
                    if (currentTypeCount < maxPerType) {
                        selected.push(candidate);
                        selectedIds.add(candidate.id);
                        typeCount.set(pType, currentTypeCount + 1);
                        addedInRound = true;
                        break;
                    }
                }
            }
        }
    }

    // Pass 2: Type-Capped Top Candidate Selection
    for (const candidate of rankedCandidates) {
        if (selected.length >= maxOptions) break;
        if (selectedIds.has(candidate.id)) continue;

        const pType = candidate.primaryType ?? "general";
        const currentTypeCount = typeCount.get(pType) ?? 0;
        if (currentTypeCount < maxPerType) {
            selected.push(candidate);
            selectedIds.add(candidate.id);
            typeCount.set(pType, currentTypeCount + 1);
        }
    }

    // Pass 3: Graceful Backfill (ensures deck always reaches maxOptions)
    for (const candidate of rankedCandidates) {
        if (selected.length >= maxOptions) break;
        if (!selectedIds.has(candidate.id)) {
            selected.push(candidate);
            selectedIds.add(candidate.id);
        }
    }

    return selected;
}

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
