import { GenerateOptionsPayload } from "../payload/option.dto";
import { PreferenceBudget } from "../types/budget";
import { GooglePlace } from "../types/google-place";
import { PlaceOption } from "../types/option-types";
import { mapGooglePriceLevel } from "../utils/price-level";
import * as googlePlaceService from "./google-place.service";

// GENERATE SERVICE
export async function generate( payload: GenerateOptionsPayload ) {
    const places = await searchPlaces(payload);
    const uniquePlaces = removeDuplicateOptions(places);

    const filteredPlaces = filterCandidates(uniquePlaces);
    const budgetFilteredPlaces = filterByBudget(filteredPlaces, payload.budget);
    const rankedPlaces = rankCandidates(budgetFilteredPlaces, payload.budget);
    const limitedPlaces = limitOptions(rankedPlaces, payload.maxOptions);

    return convertGooglePlaceToOption(limitedPlaces);
}

// HELPERS
async function searchPlaces(payload: GenerateOptionsPayload) {
    const placeTypes = [
        ...new Set(
            payload.categoryNames.flatMap(category =>
                googlePlaceService.getPlaceTypes(category)
            )
        )
    ];

    return googlePlaceService.searchNearby({
        placeTypes,
        latitude: payload.latitude,
        longitude: payload.longitude,
        radius: payload.radius,
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

function rankCandidates(places: GooglePlace[], budget?: PreferenceBudget): GooglePlace[] {
    return [...places].sort((a, b) => {
        // 1. Budget tier priority (Exact = 0, Adjacent = 1, Unknown = 2)
        const budgetTierA = getBudgetTier(a, budget);
        const budgetTierB = getBudgetTier(b, budget);

        if (budgetTierA !== budgetTierB) {
            return budgetTierA - budgetTierB;
        }

        // 2. Within the same budget tier, sort by quality score descending
        return calculateQualityScore(b) - calculateQualityScore(a);
    });
}

function convertGooglePlaceToOption(places: GooglePlace[]): PlaceOption[] {
    return places.map((place)=>({
        id: place.id,
        name: place.name,
        address: place.address ?? "",
        rating: place.rating ?? 0,
        latitude: place.latitude,
        longitude: place.longitude,
        priceLevel: mapGooglePriceLevel(place.priceLevel),
        imageUrls: place.imageUrls,
    }));
}

function removeDuplicateOptions( places:GooglePlace[] ):GooglePlace[] {
    const map = new Map<string, GooglePlace>();

    places.forEach(place=>{
        map.set(place.id, place);
    });

    return Array.from(map.values());
}

function limitOptions( places: GooglePlace[], limit: number ): GooglePlace[] {
    return places.slice(0, limit);
}
