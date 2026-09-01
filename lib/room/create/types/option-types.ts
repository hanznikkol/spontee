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
  imageUrls?: string[]

  priceLevel?: number
  distanceMeters?: number
  isOpen?: boolean
}

export interface RoomOptionCandidate {
  id: string;
  name: string;
  address: string;
  rating: number;
  latitude: number;
  longitude: number;
  priceLevel?: number;
  imageUrls?: string[];
  distanceMeters?: number;
}