import { supabase } from "@/lib/supabase/client";
import { CreateRoomPayload } from "../payload/create-room.dto";
import { generateRoomCode } from "../utils/room-code.utils";
import { ensureAnonUser } from "@/lib/user/services/auth.service";
import { generate } from "./option.service";
import { PlaceOption } from "../types/option-types";

// CREATE ROOM SERVICE
export async function create(data: CreateRoomPayload) {
  
  const user = await ensureAnonUser()

  const room = await createRoomRecord(data);

  //  Create host participant
  await createParticipant(room.room_id, data.hostName, user.id);

  //  Save preferences
  await createPreferences(room.room_id, data);

  //  Attach categories
  await createCategories(room.room_id, data.selectedCategoriesbyNames);
  console.log("Selected Categories:", data.selectedCategoriesbyNames);

  // Generate nearby places
  const options = await generate({
      categoryNames: data.selectedCategoriesbyNames,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
      budget: data.budget
  });

  // 6. Save options
  await createOptions(room.room_id, options);
  
  return room;

}

// JOIN (SOON)

// LEAVE (SOON)

// CREATE ROOM HELPER
async function createRoomRecord(data: CreateRoomPayload) {
    const {data: room, error} = await supabase
    .from("rooms")
    .insert({
        room_name: data.roomName,
        room_visibility: data.roomVisibility,
        room_password: data.roomPassword || null,
        max_participants: data.maxParticipants,
        room_code: generateRoomCode()
    })
    .select()
    .single()

    if (error) throw error;

    return room
}

async function createParticipant( roomId: string, hostName: string, userId: string ) {
    const {error} = await supabase
    .from("participants")
    .insert({
        room_id: roomId,
        display_name: hostName,
        user_id: userId,
        is_host: true 
    })

    if (error) throw error
}

async function createPreferences( roomId: string, data: CreateRoomPayload ) {
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

async function createCategories( roomId: string, categoryNames: string[]) {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("category_id, name")
    .in("name", categoryNames);

  if (error) throw error

  const roomCategories = categories.map((category) => ({
    room_id: roomId,
    category_id: category.category_id,
  }));

  const {error: insertError} = await supabase
  .from("room_categories")
  .insert(roomCategories)

  if (insertError) throw insertError;
}

async function createOptions(roomId: string, options: PlaceOption[]) {
    const records = options.map(option => ({
        room_id: roomId,
        title: option.name,
        google_place_id: option.id,
        address: option.address,
        latitude: option.latitude,
        longitude: option.longitude,
        rating: option.rating,
        price_level: option.priceLevel ?? 1
    }));

    const { error } = await supabase
        .from("options")
        .insert(records);

    if (error) throw error;
}