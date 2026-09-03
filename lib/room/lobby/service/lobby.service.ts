import { supabase } from "@/lib/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"
import { RoomStatus } from "../../create/types/room-types"

export function subscribeRoom(
  roomId: string,
  callback: Parameters<RealtimeChannel["on"]>[2],
  channelInstanceId?: string
) {
  const topic = channelInstanceId
    ? `room-${roomId}-${channelInstanceId}`
    : `room-${roomId}`

  return supabase
    .channel(topic)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
}

export async function getRoom(code: string) {
  return supabase
    .from("rooms")
    .select("*")
    .eq("room_code", code)
    .single()
}

export async function openRoom(roomId: string) {
  return supabase
    .from("rooms")
    .update({ status: "active" })
    .eq("room_id", roomId)
}

export async function updateRoomStatus(roomId: string, status: RoomStatus) {
  return supabase
    .from("rooms")
    .update({ status })
    .eq("room_id", roomId)
}