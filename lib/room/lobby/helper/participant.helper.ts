import { Participants } from "@/lib/user/type/participants"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export function getCurrentParticipant( participants: Participants[], userId?: string ): Participants | null {
  return (
    participants.find(
      participant => participant.user_id === userId
    ) ?? null
  )
}

export function updateParticipants( participants: Participants[], payload: RealtimePostgresChangesPayload<Participants> ): Participants[] {
  const newRow = payload.new as Participants
  const oldRow = payload.old as Participants

  switch (payload.eventType) {
    case "INSERT":
      if (
        participants.some(
          participant =>
            participant.participant_id === newRow.participant_id
        )
      ) {
        return participants
      }

      return [...participants, newRow]

    case "DELETE":
      return participants.filter(
        participant =>
          participant.participant_id !== oldRow.participant_id
      )

    case "UPDATE":
      return participants.map(participant =>
        participant.participant_id === newRow.participant_id
          ? newRow
          : participant
      )

    default:
      return participants
  }
}