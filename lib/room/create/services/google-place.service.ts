import axios from "axios";
import { CATEGORY_PLACE_TYPES } from "../types/constants/category-const";
import { GooglePlace, GooglePlaceResponse } from "../types/google-place";

interface SearchNearbyParams {
    placeTypes: readonly string[] | string[];
    latitude: number;
    longitude: number;
    radius: number;
}

/**
 * Validates that all requested Google Place Types are non-empty strings.
 * Prevents invalid or malformed place types from silently reaching the API.
 */
export function validateGooglePlaceTypes(placeTypes: readonly string[] | string[]): void {
    if (!placeTypes || placeTypes.length === 0) {
        throw new Error("Google Places search requires at least one place type.");
    }

    for (const type of placeTypes) {
        if (!type || typeof type !== "string" || type.trim().length === 0) {
            throw new Error(`Invalid Google Places API place type: "${type}"`);
        }
    }
}

// Google Maps API
export async function searchNearby({ placeTypes, latitude, longitude, radius }: SearchNearbyParams): Promise<GooglePlace[]> {
    validateGooglePlaceTypes(placeTypes);

    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is missing.");

        const response = await axios.post(
            "https://places.googleapis.com/v1/places:searchNearby",
            {
                includedTypes: placeTypes,
                maxResultCount: 20,
                locationRestriction: {
                    circle: { center: { latitude, longitude }, radius }
                }
            },
            {
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": [
                        "places.id",
                        "places.displayName",
                        "places.formattedAddress",
                        "places.location",
                        "places.rating",
                        "places.userRatingCount",
                        "places.priceLevel",
                        "places.businessStatus",
                        "places.currentOpeningHours",
                        "places.photos",
                        "places.types",
                        "places.primaryType",
                        "places.editorialSummary"
                    ].join(",")
                },
            }
        );

        const places: GooglePlaceResponse[] = response.data.places ?? [];

        // Return up to 5 photos per place
        return places.map((place) => {
            const photoNames = (place.photos ?? [])
                .slice(0, 5)
                .map((photo) => photo.name)
                .filter((name): name is string => Boolean(name));

            const imageUrls = photoNames.map((name) => `/api/place-photo/${name}`);

            return {
                id: place.id,
                name: place.displayName?.text ?? "",
                rating: place.rating,
                userRatingCount: place.userRatingCount,
                address: place.formattedAddress,
                latitude: place.location?.latitude ?? 0,
                longitude: place.location?.longitude ?? 0,
                priceLevel: place.priceLevel,
                businessStatus: place.businessStatus,
                currentOpeningHours: place.currentOpeningHours,
                openNow: place.currentOpeningHours?.openNow,
                imageUrls,
                types: place.types,
                primaryType: place.primaryType,
                description: place.description ?? place.editorialSummary?.text,
            };
        });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Google Places API Error:",
                JSON.stringify(error.response?.data ?? error.message, null, 2)
            );
        } else {
            console.error("Google Places API Error:", error);
        }
        throw error;
    }
}

export function getPlaceTypes(categoryName: string) { 
    return CATEGORY_PLACE_TYPES[categoryName as keyof typeof CATEGORY_PLACE_TYPES] ?? [];
}