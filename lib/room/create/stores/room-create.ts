import { ensureAnonUser } from "@/lib/user/ensure-user"
import { RoomVisibilityTypes } from "../room-types"
import { supabase } from "@/lib/supabase/client"
import { generateRoomCode } from "../room-code"
import { DefaultCategory } from "../preference/option-types"

interface CreateRoomParams {
  roomName: string
  roomVisibility: RoomVisibilityTypes
  roomPassword?: string
  hostName: string

  selectedCategories: DefaultCategory[]

  options: {
    title: string
    description?: string
    category?: string
    source: string
  }[]
}

export const createRoom = async ({
  roomName,
  roomVisibility,
  roomPassword,
  hostName,
  selectedCategories,
  options,
}: CreateRoomParams) => {
  const user = await ensureAnonUser()
  const roomCode = generateRoomCode().toUpperCase()

  // CREATE ROOM
  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .upsert({
      room_name: roomName.trim(),
      room_code: roomCode,
  
      status: "lobby",
      ends_at: null,
      room_visibility: roomVisibility,
      room_password: roomVisibility === "private" ? roomPassword : null,
    })
    .select()
    .single()

  if (roomError || !roomData) throw roomError

  // PARTICIPANT
  const { error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: roomData.room_id,
      user_id: user.id,
      display_name: hostName,
      is_host: true,
    })

  if (participantError) throw participantError

  // OPTIONS
  if (options?.length) {
    const { error } = await supabase
      .from("options")
      .insert(
        options.map((opt) => ({
          room_id: roomData.room_id,
          title: opt.title,
          description: opt.description ?? null,
          source: opt.source,
        }))
      )

    if (error) throw error
  }

  // CATEGORIES
  const { error: catError } = await supabase
    .from("categories")
    .insert(
      selectedCategories.map((category_id) => ({
        room_id: roomData.room_id,
        category_id,
      }))
    )

  if (catError) throw catError


  return roomData
}