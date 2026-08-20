import { PreferenceBudget } from "../types/budget";
import { LocationStatus } from "../types/location";

export interface CreateRoomPayload {
  userId: string;
  hostName: string;
  roomName: string;
  maxParticipants: number;
  selectedCategoriesbyNames: string[];
  budget?: PreferenceBudget;
  locationStatus: LocationStatus;
  placeId?: string;
  placeName?: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
}