import { PreferenceBudget } from "../types/budget";
import { LocationStatus } from "../types/location";
import { RoomVisibilityTypes } from "../types/room-types";

export interface CreateRoomPayload {
  hostName: string;
  roomName: string;
  roomVisibility: RoomVisibilityTypes;
  roomPassword: string;
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