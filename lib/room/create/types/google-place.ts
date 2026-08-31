import { GooglePriceLevel } from "./budget";
export type { GooglePriceLevel };

export type BusinessStatus =
  | "OPERATIONAL"
  | "CLOSED_TEMPORARILY"
  | "CLOSED_PERMANENTLY"
  | string;

// API Reponse
export interface GooglePlaceResponse {
    id: string;
    displayName: { text: string; };
    formattedAddress?: string;
    location: { latitude: number; longitude: number; };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: GooglePriceLevel;
    businessStatus?: BusinessStatus;
    photos?: { name: string }[];
}

// Normalized
export interface GooglePlace {
    id: string;
    name: string;
    rating?: number;
    userRatingCount?: number;
    address?: string;
    latitude: number;
    longitude: number;
    priceLevel?: GooglePriceLevel;
    businessStatus?: BusinessStatus;
    imageUrls?: string[];
}

