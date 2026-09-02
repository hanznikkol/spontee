import { useEffect, useMemo, useState } from "react"
import { useRoomSessionStore } from "../../main/stores/room-session-store.store"
import { useParams, useRouter } from "next/navigation"
import { Room } from "../../create/types/room-types"
import { updateRoom } from "../../create/helpers/room-helper"
import { Participants } from "../../lobby/types/participants-types"
import { getRoom, subscribeRoom, updateRoomStatus } from "../../lobby/service/lobby.service"
import { getParticipants, subscribeParticipants } from "../../lobby/service/participant.service"
import { updateParticipants } from "../../lobby/helper/participant.helper"
import { supabase } from "@/lib/supabase/client"

export function useWaiting() {
  const params = useParams()
  const router = useRouter()
  const code = typeof params?.code === 'string' ? params.code.toUpperCase() : ''
  const participantId = useRoomSessionStore((state) => state.participantId)
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participants[]>([])

  useEffect(() => {
    let cancelled = false
    let participantChannel: ReturnType<typeof subscribeParticipants> | null = null
    let roomChannel: ReturnType<typeof subscribeRoom> | null = null

    async function loadWaitingData() {
      if (!code) return

      try {
        const { data: fetchedRoom } = await getRoom(code)

        if (cancelled) return

        if (fetchedRoom) {
          setRoom(fetchedRoom)

          const { data: fetchedParticipants } = await getParticipants(fetchedRoom.room_id)

          if (cancelled) return

          if (fetchedParticipants) {
            setParticipants(fetchedParticipants)
          }

          participantChannel = subscribeParticipants(
            fetchedRoom.room_id,
            (payload) => {
              if (cancelled) return

              setParticipants((current) =>
                updateParticipants(current, payload)
              )
            }
          )
          participantChannel.subscribe()

          roomChannel = subscribeRoom(
            fetchedRoom.room_id,
            (payload) => {
              if (cancelled) return
              setRoom(updateRoom(payload))
            }
          )
          roomChannel.subscribe()
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading waiting room data:', error)
        }
      }
    }

    loadWaitingData()

    return () => {
      cancelled = true
      if (participantChannel) {
        supabase.removeChannel(participantChannel)
      }
      if (roomChannel) {
        supabase.removeChannel(roomChannel)
      }
    }
  }, [code])

  // Computed state from participants
  const currentParticipant = useMemo(() => {
    if (!participants.length) return null

    return (
      participants.find(
        (p) => p.participant_id === participantId
      ) || participants[0]
    )
  }, [participants, participantId])

  const totalParticipants = participants.length

  const finishedCount = participants.filter(
    (p) => p.status === 'finished'
  ).length

  const progressPercent = totalParticipants > 0 ? (finishedCount / totalParticipants) * 100 : 0

  const isAllFinished = totalParticipants > 0 && finishedCount === totalParticipants

  // Best-effort attempt to update room status to "result" when all participants finish
  useEffect(() => {
    if (!isAllFinished || !room || room.status !== 'active') return

    const targetRoomId = room.room_id

    async function transitionToResult() {
      try {
        await updateRoomStatus(targetRoomId, 'result')
      } catch {
        // Safe to ignore if non-host or already transitioned
      }
    }

    transitionToResult()
  }, [isAllFinished, room])

  // Automatically navigate all participants (host and guests) to result page when all finished
  useEffect(() => {
    if ((isAllFinished || room?.status === 'result') && code) {
      router.replace(`/room/${code}/result`)
    }
  }, [isAllFinished, room?.status, code, router])

  return {
    code,
    room,
    participants,
    currentParticipant,
    finishedCount,
    totalParticipants,
    progressPercent,
    isAllFinished,
  }
}