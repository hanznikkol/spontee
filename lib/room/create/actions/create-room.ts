// const room = await createRoom();

// await createPreferences();

// await createCategories();

// const options = await generateNearbyOptions();

// await saveOptions(options);

// return room;

import { CreateRoomPayload } from "../payload/create-room.dto";
import { useCreateRoomStore } from "../stores/create-room-store";
import * as roomService from "@/lib/room/create/services/room.service";

export async function createRoomAction() {
    const data = useCreateRoomStore.getState()

    const payload: CreateRoomPayload = {
        hostName: data.hostName,
        roomName: data.roomName,
        roomVisibility: data.roomVisibility,
        roomPassword: data.roomPassword,
        maxParticipants: data.maxParticipants,
        selectedCategoriesbyNames: data.selectedCategoriesbyNames,
        budget: data.budget,
        locationStatus: data.locationStatus,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
    }

    const room = await roomService.create(payload)
    
    return room
}