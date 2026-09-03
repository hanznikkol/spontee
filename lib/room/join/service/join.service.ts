import { supabase } from "@/lib/supabase/client"
import { ensureAnonUser } from "@/lib/user/services/auth.service"
import { Room } from "../../create/types/room-types"
import { Participants } from "../../lobby/types/participants-types"

interface JoinRoomPayload {
  roomCode: string
  displayName: string
}

export async function joinRoom({ roomCode, displayName }: JoinRoomPayload) {
  await ensureAnonUser()

  const normalizedCode = roomCode.trim().toUpperCase()

  const { data: participant, error: joinError } = await supabase
    .rpc("join_room", {
      p_room_code: normalizedCode,
      p_display_name: displayName.trim(),
    })

  if (joinError || !participant) {
    throw new Error(joinError?.message || "Failed to join room.")
  }

  // Fetch room details for frontend state
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("room_id, room_code, status, max_participants")
    .eq("room_id", participant.room_id)
    .single()

  if (roomError || !room) {
    throw new Error("Joined room, but failed to retrieve room details.")
  }

  return {
    room: room as Room,
    participant: participant as unknown as Participants,
  }
}