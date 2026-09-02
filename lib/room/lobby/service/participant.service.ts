import { supabase } from "@/lib/supabase/client";
import { ParticipantStatus } from "../types/participants-types";
import { RealtimeChannel } from "@supabase/supabase-js";

export async function getParticipants(roomId: string) {
  return supabase
    .from("participants")
    .select("*")
    .eq("room_id", roomId)
}

export async function getCurrentUser() {
  return supabase.auth.getUser()
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

export async function startVoting(participantId: string) {
  return supabase.rpc("start_voting", {
    p_participant_id: participantId,
  });
}

export async function updateParticipantStatus(participantId: string, status: ParticipantStatus) {
  if (status === "voting") {
    return startVoting(participantId);
  }

  return supabase
    .from("participants")
    .update({ status })
    .eq("participant_id", participantId);
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