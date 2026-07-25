import { PreferenceCategory } from "./categories"

export type RoomOption = {
  option_id: string
  title: string
  description?: string
  category?: PreferenceCategory
  // Google Place Data
  googlePlaceId?: string
  address?: string
  latitude?: number
  longitude?: number
  rating?: number
  totalReviews?: number
  imageUrl?: string
}

export interface PlaceOption {
    id:string;
    name:string;
    address:string;
    rating:number;
    latitude:number;
    longitude:number;
    priceLevel?:number;
}