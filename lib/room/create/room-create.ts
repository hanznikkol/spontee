import { ensureAnonUser } from "@/lib/user/ensure-user"
import { RoomMode, RoomVisibilityTypes } from "./room-types"
import { PRESET_TIME, TimePreset } from "./time-limits"
import { supabase } from "@/lib/supabase/client"
import { generateRoomCode } from "./room-code"

interface CreateRoomParams {
  roomName: string
  roomVisibility: RoomVisibilityTypes
  roomPassword?: string
  mode: RoomMode
  timePreset: TimePreset
  hostName: string

  options: {
    title: string
    description?: string
    category?: string
    source: string
  }[]
}

export const createRoom = async ({roomName, roomVisibility, roomPassword, mode, timePreset, hostName} : CreateRoomParams) => {
    const user = await ensureAnonUser()
    const roomCode = generateRoomCode().toUpperCase()

    const {data: roomData, error: roomError} = await supabase
      .from("rooms")
      .upsert({
         room_name: roomName.trim(),
         room_code: roomCode,
         mode,
         status: "lobby",
         duration_seconds: PRESET_TIME[mode][timePreset],
         ends_at: null,
         room_visibility: roomVisibility,
         room_password: roomVisibility === "private" ? roomPassword : null,
      })
      .select()
      .single()

    if (roomError || !roomData) {
      throw roomError
    }

    const { error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: roomData.room_id,
      user_id: user.id,
      display_name: hostName,
      is_host: true,
    })

    if (participantError) {
      throw participantError
    }

    return roomData
    
}