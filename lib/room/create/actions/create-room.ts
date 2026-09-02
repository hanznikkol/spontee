"use server"

import { CreateRoomPayload } from "../payload/create-room.dto";
import { MAX_SELECTED_CATEGORIES } from "../types/categories";
import * as roomService from "@/lib/room/create/services/room.service";
import { createClient } from "@/lib/supabase/server";

export async function createRoomAction(payload: CreateRoomPayload) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized. Please ensure you have an active session.");
    }

    if (payload.latitude === undefined || payload.longitude === undefined) {
      throw new Error("Location is required.");
    }

    if (
      payload.selectedCategoriesbyNames &&
      payload.selectedCategoriesbyNames.length > MAX_SELECTED_CATEGORIES
    ) {
      throw new Error(`Maximum of ${MAX_SELECTED_CATEGORIES} categories allowed.`);
    }

    return await roomService.create(payload, supabase);

  } catch (error) {
    console.error("CREATE ROOM ACTION:", error);
    throw error;
  }
} 