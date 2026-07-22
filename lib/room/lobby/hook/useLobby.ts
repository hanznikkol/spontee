"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RealtimeChannel } from "@supabase/supabase-js"
import { getRoom, getParticipants, getCurrentUser, subscribeParticipants, } from "../service/lobby.service"
import { getCurrentParticipant, updateParticipants, } from "../helper/participant.helper"
import { Participants } from "@/lib/user/type/participants"
import { supabase } from "@/lib/supabase/client"

export function useLobby() {
  const params = useParams()
  const router = useRouter()

  const code = typeof params.code === "string" ? params.code   : ""
  const channelRef = useRef<RealtimeChannel | null>(null)

  const [roomName, setRoomName] = useState("")
  const [participants, setParticipants] = useState<Participants[]>([])
  const [currentParticipant, setCurrentParticipant] = useState<Participants | null>(null)

  useEffect(() => {
    if (!code) return

    let cancelled = false

    async function load() {
      const { data: room } =
        await getRoom(code.toUpperCase())

      if (!room || cancelled) return

      setRoomName(room.room_name)

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

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      const channel =
        subscribeParticipants(
          room.room_id,
          payload => {
            setParticipants(prev =>
              updateParticipants(prev, payload)
            )
          }
        )

      channel.subscribe()

      channelRef.current = channel
    }

    load()

    return () => {
      cancelled = true

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [code])

  function handleStart() {
    localStorage.setItem(
      `room:${code}:status`,
      "active"
    )

    router.push(`/room/${code}/lobby`)
  }

  return { 
    roomName,   
    participants, 
    currentParticipant, 
    shareCode: code, 
    shareUrl: typeof window !== "undefined" ? `${window.location.origin}/join?room=${code}` : "",
    handleStart,
  }
}