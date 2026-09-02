/*
  IMPORTANT NOTE:
  User = who the user is.
  Participant = who the user is inside a specific room.
*/
"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RealtimeChannel } from "@supabase/supabase-js"
import { getRoom, subscribeRoom, openRoom } from "../service/lobby.service"
import { updateParticipants } from "../helper/participant.helper"
import { supabase } from "@/lib/supabase/client"
import { Room } from "../../create/types/room-types"
import { updateRoom } from "../../create/helpers/room-helper"
import { PARTICIPANT_STATUS, Participants } from "../types/participants-types"
import { useRoomSessionStore } from "../../main/stores/room-session-store.store"
import { getParticipants, subscribeParticipants, updateParticipantStatus, renameParticipant } from "../service/participant.service"

export function useLobby() {
  const params = useParams()
  const router = useRouter()

  const code = typeof params.code === "string" ? params.code   : ""
  const participantChannelRef = useRef<RealtimeChannel | null>(null)
  const roomChannelRef = useRef<RealtimeChannel | null>(null)

  const [room, setRoom] = useState<Room | null>(null)
  const participantId = useRoomSessionStore(state => state.participantId)
  const [participants, setParticipants] = useState<Participants[]>([])
  
  const [loading, setLoading] = useState(false)
  
  const currentParticipant = participants.find(
    participant =>
      participant.participant_id === participantId
  ) ?? null

  // Participants Realtime
  useEffect(() => {
    if (!code) return

    let cancelled = false

    async function load() {
      
      const { data: room } = await getRoom(code.toUpperCase())
      if (!room || cancelled) return
      setRoom(room)

      const { data: initialParticipants } = await getParticipants(room.room_id)
      if (initialParticipants) {
        setParticipants(initialParticipants)
      }

      if (participantChannelRef.current) {
        supabase.removeChannel(participantChannelRef.current)
      }

      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current)
      }

      // Participant Channel
      const participantChannel = subscribeParticipants(
          room.room_id,
          payload => {
            setParticipants(prev =>
              updateParticipants(prev, payload)
            )
          }
      )
      participantChannel.subscribe()

      const roomChannel = subscribeRoom(
          room.room_id,
          payload => {
            setRoom(updateRoom(payload))
          }
      )
      roomChannel.subscribe()

      participantChannelRef.current = participantChannel
      roomChannelRef.current = roomChannel
    }

    load()

    return () => {
      cancelled = true

      if (participantChannelRef.current) {
        supabase.removeChannel(participantChannelRef.current)
      }

      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current)
      }
    }
  }, [code])

  // Opening the Room
  async function handleOpenRoom() {
    if (!room) return

    const { error } = await openRoom(room.room_id)

    if (error) {
      console.error(error)
    }
  }

  // Start Voting
  const handleStartVoting = async () => {
    if (!room || !participantId) return

    setLoading(true)

    try {
      const { error } = await updateParticipantStatus(
        participantId,
        PARTICIPANT_STATUS.VOTING
      )

      if (error) throw error

      router.push(`/room/${room.room_code}`)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  // Rename Participant
  const handleRenameParticipant = async (displayName: string) => {
    if (!currentParticipant) {
      throw new Error("No active participant found")
    }

    const trimmed = displayName.trim()
    if (!trimmed) {
      throw new Error("Display name cannot be empty")
    }

    if (trimmed.length < 2) {
      throw new Error("Display name must be at least 2 characters")
    }

    if (trimmed.length > 20) {
      throw new Error("Display name cannot exceed 20 characters")
    }

    if (trimmed === currentParticipant.display_name) {
      return
    }

    const { error } = await renameParticipant(
      currentParticipant.participant_id,
      trimmed
    )

    if (error) {
      throw error
    }

    // Optimistically update local participant state
    setParticipants(prev =>
      prev.map(p =>
        p.participant_id === currentParticipant.participant_id
          ? { ...p, display_name: trimmed }
          : p
      )
    )
  }

  return { 
    room,   
    participants, 
    loading,
    currentParticipant, 
    shareCode: code, 
    shareUrl: typeof window !== "undefined" ? `${window.location.origin}/join?room=${code}` : "",
    handleOpenRoom,
    handleStartVoting,
    handleRenameParticipant,
  }
}