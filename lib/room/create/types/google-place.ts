export type GooglePriceLevel = 
  | "PRICE_LEVEL_FREE"
  | "PRICE_LEVEL_INEXPENSIVE"
  | "PRICE_LEVEL_MODERATE"
  | "PRICE_LEVEL_EXPENSIVE"
  | "PRICE_LEVEL_VERY_EXPENSIVE"


export interface GooglePlace {
    id: string;
    name: string;
    rating?: number;
    address?: string;
    latitude: number;
    longitude: number;
    priceLevel?: GooglePriceLevel;
    photo?: string;
}

export interface GooglePlaceResponse {
    id:string;
    displayName:{text:string;};
    formattedAddress?:string;
    location:{ latitude:number; longitude:number;};
    rating?:number;
    priceLevel?: GooglePlace["priceLevel"];

}