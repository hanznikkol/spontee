import axios from "axios";
import { CATEGORY_PLACE_TYPES } from "../types/constants/category-const";
import { GooglePlace, GooglePlaceResponse } from "../types/google-place";

interface SearchNearbyParams {
    placeTypes:string[];
    latitude:number;
    longitude:number;
    radius:number;
}

// Google Maps API
export async function searchNearby({ placeTypes, latitude, longitude, radius }: SearchNearbyParams ): Promise<GooglePlace[]> {
    try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) throw new Error("GOOGLE_API_KEY is missing.");
        
    const response = await axios.post("https://places.googleapis.com/v1/places:searchNearby",
        {
            includedTypes: placeTypes,
            maxResultCount: 15,
            locationRestriction: {
                circle: { center: {latitude, longitude}, radius}
            }
        },
        {
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": [ "places.id", "places.displayName", "places.formattedAddress", "places.location", "places.rating", "places.priceLevel", "places.photos" ].join(",")
            },
            
        },
            
    );

    const places: GooglePlaceResponse[] = response.data.places ?? [];
    console.log(response.data.places)

    //Return 5 photos
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
            address: place.formattedAddress,
            latitude: place.location?.latitude ?? 0,
            longitude: place.location?.longitude ?? 0,
            priceLevel: place.priceLevel,
            imageUrls,
        }
    });

    } catch (error) {
        console.error("Google Places API Error:", error);
        throw error;
    }
}

export function getPlaceTypes(categoryName: string) { 
    return CATEGORY_PLACE_TYPES[ categoryName as keyof typeof CATEGORY_PLACE_TYPES ] ?? [];
}