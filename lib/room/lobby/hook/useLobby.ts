"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RealtimeChannel } from "@supabase/supabase-js"
import { getRoom, getParticipants, getCurrentUser, subscribeParticipants, subscribeRoom, openRoom, } from "../service/lobby.service"
import { getCurrentParticipant, updateParticipants, } from "../helper/participant.helper"
import { Participants } from "@/lib/user/type/participants"
import { supabase } from "@/lib/supabase/client"
import { Room } from "../../create/types/room-types"
import { updateRoom } from "../../create/helpers/room-helper"

export function useLobby() {
  const params = useParams()
  const router = useRouter()

  const code = typeof params.code === "string" ? params.code   : ""
  const participantChannelRef = useRef<RealtimeChannel | null>(null)
  const roomChannelRef = useRef<RealtimeChannel | null>(null)

  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participants[]>([])
  const [currentParticipant, setCurrentParticipant] = useState<Participants | null>(null)

  useEffect(() => {
    if (!code) return

    let cancelled = false

    async function load() {
      const { data: room } = await getRoom(code.toUpperCase())
      if (!room || cancelled) return
      
      setRoom(room)

      const { data: { user } } = await getCurrentUser()
      const { data: initialParticipants, } = await getParticipants(room.room_id)

      if (initialParticipants) {
        setParticipants(initialParticipants)

        setCurrentParticipant(
          getCurrentParticipant(
            initialParticipants,
            user?.id
          )
        )
      }

      if (participantChannelRef.current) {
        supabase.removeChannel(participantChannelRef.current)
      }

      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current)
      }

      // Participant Channel
      const participantChannel  = subscribeParticipants(
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

  async function handleOpenRoom() {
    if (!room) return

    const { error } = await openRoom(room.room_id)

    if (error) {
      console.error(error)
    }
  }

  return { 
    room,   
    participants, 
    currentParticipant, 
    shareCode: code, 
    shareUrl: typeof window !== "undefined" ? `${window.location.origin}/join?room=${code}` : "",
    handleOpenRoom,
  }
}