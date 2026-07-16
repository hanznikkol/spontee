import { GenerateOptionsPayload } from "../payload/option.dto";
import { GooglePlace } from "../types/google-place";
import { PlaceOption } from "../types/option-types";
import * as googlePlaceService from "./google-place.service";

// GENERATE SERVICE
export async function generate( payload: GenerateOptionsPayload ) {
    const places = await searchPlaces(payload);
    const uniquePlaces = removeDuplicateOptions(places);
    // const budgetPlaces = filterByBudget(uniquePlaces, payload.budget);
    // const distancePlaces = sortByDistance( budgetPlaces, payload.latitude, payload.longitude );
    // const ratingPlaces = sortByRating(distancePlaces);

    return convertGooglePlaceToOption(uniquePlaces);
}

// HELPERS
async function searchPlaces(payload: GenerateOptionsPayload) {
    const placeTypes = payload.categoryNames.flatMap( category => googlePlaceService.getPlaceTypes(category));
    const groups = await Promise.all(
        placeTypes.map((placeType) =>
            googlePlaceService.searchNearby({
                placeType,
                latitude: payload.latitude,
                longitude: payload.longitude,
                radius: payload.radius,
            })
        )
    );

    return groups.flat();
}

function convertGooglePlaceToOption(places: GooglePlace[]): PlaceOption[] {
    return places.map((place)=>({
        id: place.id,
        name: place.name,
        address: place.address ?? "",
        rating: place.rating ?? 0,
        latitude: place.latitude,
        longitude: place.longitude,
        priceLevel: place.priceLevel
    }));
}

function removeDuplicateOptions( places:GooglePlace[] ):GooglePlace[] {
    const map = new Map<string, GooglePlace>();

    places.forEach(place=>{
        map.set(place.id, place);
    });

    return Array.from(map.values());
}

// function sortByDistance() {}

// function filterByBudget() {}

// function sortByRating() {}