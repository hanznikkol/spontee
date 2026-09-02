import { PreferenceBudget } from "../types/budget";
import { LocationStatus } from "../types/location";

export interface CreateRoomPayload {
  hostName: string;
  roomName: string;
  maxParticipants: number;
  maxOptions: number;
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