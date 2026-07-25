"use server"

import { CreateRoomPayload } from "../payload/create-room.dto";
import * as roomService from "@/lib/room/create/services/room.service";

export async function createRoomAction(payload: CreateRoomPayload) {
  try {
    if (payload.latitude === undefined || payload.longitude === undefined) {
      throw new Error("Location is required.");
    }

    return await roomService.create(payload);

  } catch (error) {
    console.error("CREATE ROOM ACTION:", error);
    throw error;
  }
} 