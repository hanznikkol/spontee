// GOOGLE API RESPONSE ON PRICE LEVEL

import { GooglePriceLevel } from "./budget";
export type { GooglePriceLevel };


// API Reponse
export interface GooglePlaceResponse {
    id:string;
    displayName:{text:string;};
    formattedAddress?:string;
    location:{ latitude:number; longitude:number;};
    rating?:number;
    priceLevel?: GooglePlace["priceLevel"];
    photos?: { name: string }[]
}

// Normalized
export interface GooglePlace {
    id: string;
    name: string;
    rating?: number;
    address?: string;
    latitude: number;
    longitude: number;
    priceLevel?: GooglePriceLevel;
    imageUrls?: string[];
}

