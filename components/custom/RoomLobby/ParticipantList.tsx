import { Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import { Participants } from '@/lib/room/lobby/types/participants-types'
import { ParticipantStatus } from './ParticipantStatus'

interface ParticipantListProps {
  participants: Participants[]
  currentParticipant: Participants | null
  participantCount: number
  maxParticipants: number
  isRoomFull: boolean
}

export default function ParticipantList({ participants, currentParticipant, participantCount, maxParticipants, isRoomFull }: ParticipantListProps) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">

        {/* Header */}
        <div className="flex justify-between">
          <p className="text-xs uppercase text-muted-foreground">
            Participants
          </p>

          <div className="flex items-center gap-2">
            {isRoomFull && (
              <span className="text-xs text-muted-foreground">
                Full
              </span>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {participantCount} / {maxParticipants}
            </div>
          </div>
        </div>

        {/* Participants */}
        <ul className="space-y-2">
          {participants.map((participant) => {
            const isMe = currentParticipant?.participant_id === participant.participant_id

            return (
              <li
                key={participant.participant_id}
                className={`
                  flex items-center gap-3
                  px-3 py-2 rounded-xl border
                  ${
                    isMe
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50'
                  }
                `}
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {participant.display_name?.[0]}
                </div>

                {/* Name */}
                <span className="text-sm font-medium">
                  {participant.display_name}
                </span>

                {/* Right side */}
                <div className="ml-auto flex items-center gap-2">
                  {participant.is_host && (
                    <span className="text-xs text-muted-foreground">
                      Host
                    </span>
                  )}

                  <ParticipantStatus
                    status={participant.status}
                  />
                </div>
              </li>
            )
          })}
        </ul>

      </CardContent>
    </Card>
  )
}