/*
  IMPORTANT NOTE:
  User = who the user is.
  Participant = who the user is inside a specific room.
*/
"use client"

import { useEffect, useRef, useState, useId } from "react"
import { useParams, useRouter } from "next/navigation"
import { RealtimeChannel } from "@supabase/supabase-js"
import { getRoom, subscribeRoom, openRoom } from "../service/lobby.service"
import { updateParticipants } from "../helper/participant.helper"
import { supabase } from "@/lib/supabase/client"
import { Room } from "../../create/types/room-types"
import { updateRoom } from "../../create/helpers/room-helper"
import { PARTICIPANT_STATUS, Participants } from "../types/participants-types"
import { useRoomSessionStore } from "../../main/stores/room-session-store.store"
import { getParticipants, subscribeParticipants, updateParticipantStatus, renameParticipant, leaveRoom, kickParticipant } from "../service/participant.service"
import { getRoomPreferences } from "../../result/service/result.service"
import { RoomPreferenceContext } from "../../result/result.types"

export function useLobby() {
  const params = useParams()
  const router = useRouter()
  const hookId = useId()

  const code = typeof params.code === "string" ? params.code : ""
  const instanceIdRef = useRef(hookId.replace(/[^a-zA-Z0-9]/g, ""))
  const participantChannelRef = useRef<RealtimeChannel | null>(null)
  const roomChannelRef = useRef<RealtimeChannel | null>(null)
  const hasLoadedParticipantsRef = useRef(false)

  const [room, setRoom] = useState<Room | null>(null)
  const [preferences, setPreferences] = useState<RoomPreferenceContext | null>(null)
  const participantId = useRoomSessionStore(state => state.participantId)
  const [participants, setParticipants] = useState<Participants[]>([])
  
  const [loading, setLoading] = useState(false)
  
  const currentParticipant = participants.find(
    participant =>
      participant.participant_id === participantId
  ) ?? null

  // Check if current participant was kicked or if room closed
  useEffect(() => {
    if (!hasLoadedParticipantsRef.current || !participantId) return

    if (room?.status === "closed") {
      useRoomSessionStore.getState().clearSession()
      router.replace("/?notice=room_closed")
      return
    }

    if (participants.length > 0 && !participants.some(p => p.participant_id === participantId)) {
      useRoomSessionStore.getState().clearSession()
      router.replace("/?notice=kicked")
    }
  }, [participants, participantId, room?.status, router])

  // Participants & Room Realtime
  useEffect(() => {
    if (!code) return

    let cancelled = false
    const instanceId = instanceIdRef.current

    async function load() {
      const { data: fetchedRoom } = await getRoom(code.toUpperCase())
      if (!fetchedRoom || cancelled) return
      setRoom(fetchedRoom)

      const [initialParticipants, initialPreferences] = await Promise.all([
        getParticipants(fetchedRoom.room_id).then(r => r.data),
        getRoomPreferences(fetchedRoom.room_id),
      ])

      if (cancelled) return
      if (initialParticipants) {
        setParticipants(initialParticipants)
        hasLoadedParticipantsRef.current = true
      }
      if (initialPreferences) {
        setPreferences(initialPreferences)
      }

      if (participantChannelRef.current) {
        supabase.removeChannel(participantChannelRef.current)
      }

      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current)
      }

      // Participant Channel with unique instance topic to prevent Phoenix teardown race conditions
      const participantChannel = subscribeParticipants(
        fetchedRoom.room_id,
        payload => {
          if (cancelled) return
          setParticipants(prev => updateParticipants(prev, payload))
        },
        instanceId
      )

      participantChannel.subscribe((status, err) => {
        if (err || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(`[Realtime] Participant channel (${instanceId}) status:`, status, err)
        }
      })

      // Room Channel
      const roomChannel = subscribeRoom(
        fetchedRoom.room_id,
        payload => {
          if (cancelled) return
          const updated = updateRoom(payload)
          setRoom(updated)
          if (updated.status === "closed") {
            useRoomSessionStore.getState().clearSession()
            router.replace("/?notice=room_closed")
          }
        },
        instanceId
      )

      roomChannel.subscribe((status, err) => {
        if (err || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(`[Realtime] Room channel (${instanceId}) status:`, status, err)
        }
      })

      participantChannelRef.current = participantChannel
      roomChannelRef.current = roomChannel
    }

    load()

    return () => {
      cancelled = true

      if (participantChannelRef.current) {
        supabase.removeChannel(participantChannelRef.current)
        participantChannelRef.current = null
      }

      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current)
        roomChannelRef.current = null
      }
    }
  }, [code, router])

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

  // Leave Room
  const handleLeaveRoom = async () => {
    if (!room || !currentParticipant) return

    setLoading(true)
    try {
      await leaveRoom(room.room_id, currentParticipant.participant_id)
      useRoomSessionStore.getState().clearSession()
      router.replace("/")
    } catch (err) {
      console.error("Failed to leave room:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Kick Participant (Host Only)
  const handleKickParticipant = async (targetParticipantId: string) => {
    if (!room || !currentParticipant?.is_host) {
      throw new Error("Only the host can kick participants.")
    }

    if (targetParticipantId === currentParticipant.participant_id) {
      throw new Error("Cannot kick yourself as host.")
    }

    // Optimistic local state update
    setParticipants(prev => prev.filter(p => p.participant_id !== targetParticipantId))

    try {
      await kickParticipant(room.room_id, targetParticipantId)
    } catch (err) {
      console.error("Failed to kick participant:", err)
      // Rollback on failure
      const { data: rollbackParticipants } = await getParticipants(room.room_id)
      if (rollbackParticipants) {
        setParticipants(rollbackParticipants)
      }
      throw err
    }
  }

  // Full synchronization after preference update
  const reloadPreferences = async () => {
    if (!room) return
    try {
      const [prefData, { data: updatedRoom }, { data: updatedParticipants }] = await Promise.all([
        getRoomPreferences(room.room_id),
        getRoom(code.toUpperCase()),
        getParticipants(room.room_id),
      ])
      if (prefData) setPreferences(prefData)
      if (updatedRoom) setRoom(updatedRoom)
      if (updatedParticipants) setParticipants(updatedParticipants)
    } catch (err) {
      console.error("Failed to reload lobby preferences:", err)
    }
  }

  return { 
    room,   
    participants, 
    preferences,
    loading,
    currentParticipant, 
    shareCode: code, 
    shareUrl: typeof window !== "undefined" ? `${window.location.origin}/join?room=${code}` : "",
    handleOpenRoom,
    handleStartVoting,
    handleRenameParticipant,
    handleLeaveRoom,
    handleKickParticipant,
    reloadPreferences,
  }
}