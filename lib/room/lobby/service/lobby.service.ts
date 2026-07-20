import { supabase } from "@/lib/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"

export async function getRoom(code: string) {
  return supabase
    .from("rooms")
    .select("*")
    .eq("room_code", code)
    .single()
}

export async function getParticipants(roomId: string) {
  return supabase
    .from("participants")
    .select("*")
    .eq("room_id", roomId)
}

export async function getCurrentUser() {
  return supabase.auth.getUser()
}

export async function startRoom(roomId: string) {
  return supabase
    .from("rooms")
    .update({
      status: "swiping",
    })
    .eq("room_id", roomId)
}

export async function renameParticipant( participantId: string, displayName: string ) {
  return supabase
    .from("participants")
    .update({
      display_name: displayName,
    })
    .eq("participant_id", participantId)
}

export async function kickParticipant( participantId: string ) {
  return supabase
    .from("participants")
    .delete()
    .eq("participant_id", participantId)
}

export async function leaveRoom( participantId: string ) {
  return supabase
    .from("participants")
    .delete()
    .eq("participant_id", participantId)
}

export function subscribeParticipants( roomId: string, callback: Parameters<RealtimeChannel["on"]>[2] ) {
  return supabase
    .channel(`participants-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "participants",
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
}