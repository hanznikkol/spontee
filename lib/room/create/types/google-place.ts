export interface GooglePlace {
    id: string;
    name: string;
    rating?: number;
    address?: string;
    latitude: number;
    longitude: number;
    priceLevel?: number;
    photo?: string;
}

export interface GooglePlaceResponse {
    id:string;
    displayName:{text:string;};
    formattedAddress?:string;
    location:{ latitude:number; longitude:number;};
    rating?:number;
    priceLevel?:number;
}