"use server"

import { createClient } from "@/lib/supabase/server"

export interface LeaveRoomPayload {
  roomId: string
  participantId: string
}

export interface LeaveRoomResult {
  success: boolean
  isHost: boolean
  roomClosed: boolean
}

export async function leaveRoomAction(
  payload: LeaveRoomPayload
): Promise<LeaveRoomResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized. Please ensure you have an active session.")
  }

  if (!payload.participantId) {
    throw new Error("Participant ID is required to leave room.")
  }

  const { data, error } = await supabase.rpc("leave_room", {
    p_participant_id: payload.participantId,
  })

  if (error) {
    console.error("LEAVE ROOM ACTION ERROR:", error)
    throw new Error(error.message || "Failed to leave room.")
  }

  return {
    success: true,
    isHost: Boolean(data?.is_host),
    roomClosed: Boolean(data?.room_closed),
  }
}

export interface KickParticipantPayload {
  roomId: string
  targetParticipantId: string
}

export interface KickParticipantResult {
  success: boolean
  kickedParticipantId: string
}

export async function kickParticipantAction(
  payload: KickParticipantPayload
): Promise<KickParticipantResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized. Please ensure you have an active session.")
  }

  if (!payload.targetParticipantId) {
    throw new Error("Target participant ID is required.")
  }

  const { data, error } = await supabase.rpc("kick_participant", {
    p_target_participant_id: payload.targetParticipantId,
  })

  if (error) {
    console.error("KICK PARTICIPANT ACTION ERROR:", error)
    throw new Error(error.message || "Failed to kick participant.")
  }

  return {
    success: true,
    kickedParticipantId: data?.kicked_participant_id || payload.targetParticipantId,
  }
}
