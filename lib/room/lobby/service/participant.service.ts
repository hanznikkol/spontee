import { supabase } from "@/lib/supabase/client";
import { ParticipantStatus } from "../types/participants-types";
import { RealtimeChannel } from "@supabase/supabase-js";
import { leaveRoomAction, kickParticipantAction } from "../actions/participant-actions";

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

export async function kickParticipant(roomId: string, targetParticipantId: string) {
  return kickParticipantAction({ roomId, targetParticipantId })
}

export async function leaveRoom(roomId: string, participantId: string) {
  return leaveRoomAction({ roomId, participantId })
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

export function subscribeParticipants(
  roomId: string,
  callback: Parameters<RealtimeChannel["on"]>[2],
  channelInstanceId?: string
) {
  const topic = channelInstanceId
    ? `participants-${roomId}-${channelInstanceId}`
    : `participants-${roomId}`

  return supabase
    .channel(topic)
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