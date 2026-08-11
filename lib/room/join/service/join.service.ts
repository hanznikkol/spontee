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
    .select("room_id, room_code, status, max_participants")
    .eq("room_code", roomCode)
    .single()


  if (roomError || !room) {
    throw new Error(
      "We couldn’t find that room. Check the invite link."
    )
  }

  // Room Status
  if( room.status === "closed" || room.status === "result" ){
    throw new Error(
      "This room is already closed"
    )
  }

    // Check if this user is already inside the room
  const { data: existingParticipant, error: existingParticipantError } = await supabase
    .from("participants")
    .select("participant_id")
    .eq("room_id", room.room_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingParticipantError) {
    throw existingParticipantError
  }

  // Only check capacity for a NEW participant
  if (!existingParticipant) {
    const { count, error: countError } = await supabase
      .from("participants")
      .select("participant_id", {
        count: "exact",
        head: true,
      })
      .eq("room_id", room.room_id)

    if (countError) {
      throw countError
    }

    if ((count ?? 0) >= room.max_participants) {
      throw new Error(
        "This room is already full. You can't join this room."
      )
    }
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

  if (participantError){
    throw participantError
  }
  
  return {
    room,
    participant,
  }
}