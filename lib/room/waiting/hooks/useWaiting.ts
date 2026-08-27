import { useEffect, useMemo, useState } from "react"
import { useRoomSessionStore } from "../../main/stores/room-session-store.store"
import { useParams } from "next/navigation"
import { Room } from "../../create/types/room-types"
import { Participants } from "../../lobby/types/participants-types"
import { getRoom } from "../../lobby/service/lobby.service"
import { getParticipants } from "../../lobby/service/participant.service"

export function useWaiting() {
  const params = useParams()

  const code = typeof params?.code === 'string' ? params.code.toUpperCase() : ''

  const participantId = useRoomSessionStore(
    (state) => state.participantId
  )

  const [room, setRoom] = useState<Room | null>(null)

  const [participants, setParticipants] = useState<Participants[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadWaitingData() {
      if (!code) return

      try {
        const { data: fetchedRoom } = await getRoom(code)

        if (cancelled) return

        if (fetchedRoom) {
          setRoom(fetchedRoom)

          const { data: fetchedParticipants } =
            await getParticipants(fetchedRoom.room_id)

          if (cancelled) return

          if (fetchedParticipants && fetchedParticipants.length > 0) {
            // Ensure the current participant is marked as finished on this screen
            const mapped = fetchedParticipants.map((p) =>
              p.participant_id === participantId
                ? { ...p, status: 'finished' as const }
                : p
            )

            setParticipants(mapped)
            return
          }
        }
      } catch (error) {
        console.error('Error loading waiting room data:', error)
      }

      if (!cancelled) {
        // Fallback demo data matching the Participants model when previewed directly
        setParticipants([
          {
            participant_id: participantId || 'demo-user-me',
            user_id: 'demo-user-me',
            display_name: 'You',
            session_id: 'sess-1',
            is_host: true,
            status: 'finished',
            joined_at: new Date().toISOString(),
          },
          {
            participant_id: 'demo-user-2',
            user_id: 'demo-user-2',
            display_name: 'Sarah',
            session_id: 'sess-2',
            is_host: false,
            status: 'voting',
            joined_at: new Date().toISOString(),
          },
          {
            participant_id: 'demo-user-3',
            user_id: 'demo-user-3',
            display_name: 'Alex',
            session_id: 'sess-3',
            is_host: false,
            status: 'finished',
            joined_at: new Date().toISOString(),
          },
        ])
      }
    }

    loadWaitingData()

    return () => {
      cancelled = true
    }
  }, [code, participantId])

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

  const progressPercent =
    totalParticipants > 0
      ? (finishedCount / totalParticipants) * 100
      : 0

  const isAllFinished =
    totalParticipants > 0 &&
    finishedCount === totalParticipants

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