import { useEffect, useMemo, useState } from "react"
import { useRoomSessionStore } from "../../main/stores/room-session-store.store"
import { useParams } from "next/navigation"
import { Room } from "../../create/types/room-types"
import { Participants } from "../../lobby/types/participants-types"
import { getRoom } from "../../lobby/service/lobby.service"
import { getParticipants, subscribeParticipants } from "../../lobby/service/participant.service"
import { updateParticipants } from "../../lobby/helper/participant.helper"

export function useWaiting() {
  const params = useParams()
  const code = typeof params?.code === 'string' ? params.code.toUpperCase() : ''
  const participantId = useRoomSessionStore((state) => state.participantId)
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participants[]>([])

  useEffect(() => {
    let cancelled = false
    let channel: ReturnType<typeof subscribeParticipants> | null = null

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

          // Component may have unmounted while fetching participants
          if (cancelled) return

          channel = subscribeParticipants(
            fetchedRoom.room_id,
            (payload) => {
                if (cancelled) return

                setParticipants((current) =>
                updateParticipants(current, payload)
                )
            }
          )

          channel.subscribe()

          return

        }
      } catch (error) {
        if(!cancelled) {
            console.error('Error loading waiting room data:', error)
        } 
      }
    }

    loadWaitingData()

    return () => {
      cancelled = true
      channel?.unsubscribe()
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

  const progressPercent = totalParticipants > 0? (finishedCount / totalParticipants) * 100 : 0

  const isAllFinished = totalParticipants > 0 && finishedCount === totalParticipants

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