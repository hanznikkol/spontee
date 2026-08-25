/*
  IMPORTANT NOTE:
  User = who the user is.
  Participant = who the user is inside a specific room.
*/
"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RealtimeChannel } from "@supabase/supabase-js"
import { getRoom, getParticipants, subscribeParticipants, subscribeRoom, openRoom, updateParticipantStatus, } from "../service/lobby.service"
import { updateParticipants } from "../helper/participant.helper"
import { supabase } from "@/lib/supabase/client"
import { Room } from "../../create/types/room-types"
import { updateRoom } from "../../create/helpers/room-helper"
import { PARTICIPANT_STATUS, Participants } from "../types/participants-types"
import { useRoomSessionStore } from "../../main/stores/room-session-store.store"

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

  return { 
    room,   
    participants, 
    loading,
    currentParticipant, 
    shareCode: code, 
    shareUrl: typeof window !== "undefined" ? `${window.location.origin}/join?room=${code}` : "",
    handleOpenRoom,
    handleStartVoting,
  }
}