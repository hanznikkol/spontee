import { SupabaseClient } from "@supabase/supabase-js";
import { CreateRoomPayload } from "../payload/create-room.dto";
import { generateRoomCode } from "../utils/room-code.utils";
import { generate } from "./option.service";
import { RoomOptionCandidate } from "../types/option-types";
import { Participants } from "../../lobby/types/participants-types";
import { Room } from "../types/room-types";

export async function create(data: CreateRoomPayload, supabase: SupabaseClient) {
  const { data: created, error: createError } = await supabase
    .rpc("create_room_with_host", {
      p_room_name: data.roomName.trim(),
      p_max_participants: data.maxParticipants,
      p_max_options: data.maxOptions,
      p_room_code: generateRoomCode(),
      p_host_name: data.hostName.trim(),
    });

  if (createError || !created) {
    throw new Error(createError?.message || "Failed to create room and host participant.");
  }

  const room = (created as { room: Room; participant: Participants }).room;
  const participant = (created as { room: Room; participant: Participants }).participant;

  // Save preferences
  await createPreferences(supabase, room.room_id, data);
  // Attach categories
  await createCategories(supabase, room.room_id, data.selectedCategoriesbyNames);
  // Generate nearby places
  const options = await generate({
      categoryNames: data.selectedCategoriesbyNames,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
      budget: data.budget,
      maxOptions: data.maxOptions
  });

  // Save options
  await createOptions(supabase, room.room_id, options);
  return { room, participant };
}

async function createPreferences(supabase: SupabaseClient, roomId: string, data: CreateRoomPayload) {
    const { error } = await supabase
    .from("room_preferences")
    .insert({
        room_id: roomId,
        budget: data.budget,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
    });

  if (error) throw error;
}

async function createCategories(supabase: SupabaseClient, roomId: string, categoryNames: string[]) {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("category_id, name")
    .in("name", categoryNames);

  if (error) throw error;

  const roomCategories = (categories ?? []).map((category) => ({
    room_id: roomId,
    category_id: category.category_id,
  }));

  const { error: insertError } = await supabase
  .from("room_categories")
  .insert(roomCategories);

  if (insertError) throw insertError;
}

async function createOptions(supabase: SupabaseClient, roomId: string, options: RoomOptionCandidate[]) {
    const records = options.map(option => ({
        room_id: roomId,
        title: option.name,
        google_place_id: option.id,
        address: option.address,
        latitude: option.latitude,
        longitude: option.longitude,
        rating: option.rating,
        price_level: option.priceLevel ?? 1,
        image_urls: option.imageUrls?.length ? option.imageUrls : null,
        distance_meters: option.distanceMeters ?? null,
        description: option.description ?? null,
        total_reviews: option.totalReviews ?? null,
    }));

    const { error } = await supabase
        .from("options")
        .insert(records);

    if (error) throw error;
}