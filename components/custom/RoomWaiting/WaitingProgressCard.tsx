import { Sparkles, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { ParticipantStatus } from '@/components/custom/RoomLobby/ParticipantStatus'
import { Participants } from '@/lib/room/lobby/types/participants-types'

interface WaitingProgressCardProps {
  participants: Participants[]
  currentParticipant: Participants | null
  finishedCount: number
  totalParticipants: number
  progressPercent: number
  isAllFinished: boolean
}

export default function WaitingProgressCard({
  participants,
  currentParticipant,
  finishedCount,
  totalParticipants,
  progressPercent,
  isAllFinished,
}: WaitingProgressCardProps) {
  const remainingCount = Math.max(0, totalParticipants - finishedCount)

  return (
    <Card className="rounded-2xl flex-1 flex flex-col border shadow-sm">
      <CardContent className="p-5 md:p-6 space-y-5 flex-1 flex flex-col justify-between">

        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
              Group Progress
            </p>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>
                {finishedCount} / {totalParticipants} Finished
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <ProgressBar
              value={progressPercent}
              leftLabel={
                <span className="text-xs font-medium text-muted-foreground">
                  {finishedCount} of {totalParticipants} completed
                </span>
              }
              rightLabel={
                <span className="text-xs font-semibold text-foreground">
                  {Math.round(progressPercent)}%
                </span>
              }
            />
          </div>

          {/* Participants List */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Participants
            </p>

            <ul className="space-y-2 max-h-52 sm:max-h-60 overflow-y-auto overscroll-contain pr-1">
              {participants.map((participant) => {
                const isMe = currentParticipant?.participant_id === participant.participant_id

                return (
                  <li
                    key={participant.participant_id}
                    className={`
                      flex items-center gap-3
                      px-3.5 py-2.5 rounded-xl border transition-colors
                      ${
                        isMe
                          ? 'border-primary/40 bg-primary/5 shadow-xs'
                          : 'border-transparent bg-muted/40'
                      }
                    `}
                  >
                    {/* Avatar */}
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                        ${
                          isMe
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted-foreground/15 text-foreground'
                        }
                      `}
                    >
                      {participant.display_name?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Name & tags */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {participant.display_name}
                      </span>

                      {isMe && (
                        <span className="text-[10px] font-medium bg-primary/15 text-primary px-1.5 py-0.5 rounded-md shrink-0">
                          You
                        </span>
                      )}

                      {participant.is_host && (
                        <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                          Host
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="ml-auto flex items-center shrink-0">
                      <ParticipantStatus status={participant.status} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Dynamic Status / Reassurance Banner */}
        <div className="pt-2">
          {isAllFinished ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-2.5 text-xs text-primary font-medium">
              <Sparkles className="w-4 h-4 shrink-0 text-primary" />
              <span>Everyone has finished voting! Spontee is ready to reveal your recommendation.</span>
            </div>
          ) : (
            <div className="rounded-xl border bg-muted/30 p-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {remainingCount === 1
                  ? 'Waiting for 1 more person to submit their votes...'
                  : `Waiting for ${remainingCount} more people to submit their votes...`}
              </span>
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
