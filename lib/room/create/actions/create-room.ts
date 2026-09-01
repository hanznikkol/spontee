"use server"

import { CreateRoomPayload } from "../payload/create-room.dto";
import { MAX_SELECTED_CATEGORIES } from "../types/categories";
import * as roomService from "@/lib/room/create/services/room.service";

export async function createRoomAction(payload: CreateRoomPayload) {
  try {
    if (payload.latitude === undefined || payload.longitude === undefined) {
      throw new Error("Location is required.");
    }

    if (
      payload.selectedCategoriesbyNames &&
      payload.selectedCategoriesbyNames.length > MAX_SELECTED_CATEGORIES
    ) {
      throw new Error(`Maximum of ${MAX_SELECTED_CATEGORIES} categories allowed.`);
    }

    return await roomService.create(payload);

  } catch (error) {
    console.error("CREATE ROOM ACTION:", error);
    throw error;
  }
} 