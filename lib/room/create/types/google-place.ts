import { GooglePriceLevel } from "./budget";
export type { GooglePriceLevel };

export type BusinessStatus =
  | "OPERATIONAL"
  | "CLOSED_TEMPORARILY"
  | "CLOSED_PERMANENTLY"
  | string;

export interface GoogleOpeningHours {
    openNow?: boolean;
    periods?: unknown[];
    weekdayDescriptions?: string[];
}

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
    currentOpeningHours?: GoogleOpeningHours;
    photos?: { name: string }[];
    types?: string[];
    primaryType?: string;
    description?: string;
    editorialSummary?: { text: string };
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
    currentOpeningHours?: GoogleOpeningHours;
    openNow?: boolean;
    imageUrls?: string[];
    types?: string[];
    primaryType?: string;
    distanceMeters?: number;
    searchedCategories?: string[];
    description?: string;
}

