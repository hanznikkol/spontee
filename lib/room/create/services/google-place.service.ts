import axios from "axios";
import { CATEGORY_PLACE_TYPES } from "../types/constants/category-const";
import { GooglePlace, GooglePlaceResponse } from "../types/google-place";

interface SearchNearbyParams {
    placeType:string;
    latitude:number;
    longitude:number;
    radius:number;
}

// Search Nearby Google Maps API
export async function searchNearby({ placeType, latitude, longitude, radius }: SearchNearbyParams ): Promise<GooglePlace[]> {
    const response = await axios.post( "https://places.googleapis.com/v1/places:searchNearby",
        {
            includedTypes: [placeType],
            maxResultCount: 15,
            locationRestriction: {
                circle: { center: {latitude, longitude}, radius}
            }
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": process.env.GOOGLE_API_KEY,
                "X-Goog-FieldMask": [ "places.id", "places.displayName", "places.formattedAddress", "places.location", "places.rating", "places.priceLevel" ].join(",")
            }
        }
    );


    const places: GooglePlaceResponse[] = response.data.places ?? [];
    console.log(response.data.places)

    return places.map((place) => ({
        id: place.id,
        name: place.displayName.text,
        rating: place.rating,
        address: place.formattedAddress,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        priceLevel: place.priceLevel
    }));

}

export function getPlaceTypes(categoryName: string) { 
    return CATEGORY_PLACE_TYPES[ categoryName as keyof typeof CATEGORY_PLACE_TYPES ] ?? [];
}
// getPlaceDetails()

// getPlacePhoto()