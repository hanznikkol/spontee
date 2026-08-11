import { supabase } from "@/lib/supabase/client"
import { ensureAnonUser } from "@/lib/user/services/auth.service"

interface JoinRoomPayload {
  roomCode: string
  displayName: string
}

export async function joinRoom({ roomCode, displayName, }: JoinRoomPayload) {
  const user = await ensureAnonUser()

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("room_id, room_code, status")
    .eq("room_code", roomCode)
    .single()


  if (roomError || !room) {
    throw new Error(
      "We couldn’t find that room. Check the invite link."
    )
  }


  if(
    room.status === "closed" ||
    room.status === "result"
  ){
    throw new Error(
      "This room is already closed"
    )
  }


  const {data : participant, error: participantError } = await supabase
    .from("participants")
    .upsert({
      room_id: room.room_id,
      user_id: user.id,
      display_name: displayName,
      is_host: false,
      status: "waiting"
    })
    .select()
    .single()

  if(participantError){
    throw participantError
  }
  
  return {
    room,
    participant,
  }
}