import { GenerateOptionsPayload } from "../payload/option.dto";
import { GooglePlace } from "../types/google-place";
import { PlaceOption } from "../types/option-types";
import { mapGooglePriceLevel } from "../utils/price-level";
import * as googlePlaceService from "./google-place.service";

// GENERATE SERVICE
export async function generate( payload: GenerateOptionsPayload ) {
    const places = await searchPlaces(payload);
    const uniquePlaces = removeDuplicateOptions(places);

    const filteredPlaces = filterCandidates(uniquePlaces);
    const rankedPlaces = rankCandidates(filteredPlaces);
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

function calculateQualityScore(place: GooglePlace): number {
    const rating = place.rating ?? 0;
    const userRatingCount = place.userRatingCount ?? 0;
    if (rating <= 0 || userRatingCount <= 0) return 0;
    return rating * Math.log10(userRatingCount);
}

function rankCandidates(places: GooglePlace[]): GooglePlace[] {
    return [...places].sort((a, b) => calculateQualityScore(b) - calculateQualityScore(a));
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
