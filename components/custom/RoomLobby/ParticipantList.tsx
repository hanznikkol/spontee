import React from "react"
import { Users, Crown, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Participants } from "@/lib/room/lobby/types/participants-types"
import { ParticipantStatus } from "./ParticipantStatus"

interface ParticipantListProps {
  participants: Participants[]
  currentParticipant: Participants | null
  participantCount: number
  maxParticipants: number
  isRoomFull: boolean
}

export default function ParticipantList({
  participants,
  currentParticipant,
  participantCount,
  maxParticipants,
  isRoomFull,
}: ParticipantListProps) {
  return (
    <Card className="w-full rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xl overflow-hidden transition-all">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Users className="h-4 w-4 text-purple-500" />
              Participants
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {isRoomFull && (
              <Badge
                variant="outline"
                className="rounded-full px-2 py-0.5 text-[10px] font-bold border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              >
                Room Full
              </Badge>
            )}

            <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
              {participantCount} / {maxParticipants}
            </span>
          </div>
        </div>

        {/* PARTICIPANTS LIST */}
        <ul className="space-y-2" role="list">
          {participants.map((participant) => {
            const isMe =
              currentParticipant?.participant_id === participant.participant_id
            const initial =
              participant.display_name?.trim()?.[0]?.toUpperCase() || "?"

            return (
              <li
                key={participant.participant_id}
                className={`flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl border transition-all ${
                  isMe
                    ? "border-pink-500/40 bg-pink-500/5 ring-1 ring-pink-500/20"
                    : "border-border/60 bg-background/50 hover:bg-background/80"
                }`}
              >
                {/* AVATAR & NAME */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-pink-500/15 via-purple-500/15 to-blue-500/15 text-pink-600 dark:text-pink-400 font-bold text-xs flex items-center justify-center ring-1 ring-pink-500/20 shadow-xs select-none">
                    {initial}
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate max-w-[130px] xs:max-w-[170px] sm:max-w-[220px]">
                      {participant.display_name}
                    </span>

                    {isMe && (
                      <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.2 rounded-md shrink-0">
                        You
                      </span>
                    )}
                  </div>
                </div>

                {/* STATUS & HOST BADGES */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {participant.is_host && (
                    <Badge
                      variant="outline"
                      className="rounded-full gap-1 px-2 py-0.5 text-[10px] font-bold border-pink-500/30 bg-pink-500/10 text-pink-600 dark:text-pink-400"
                    >
                      <Crown className="h-3 w-3" />
                      <span>Host</span>
                    </Badge>
                  )}

                  <ParticipantStatus status={participant.status} />
                </div>
              </li>
            )
          })}
        </ul>

        {/* EMPTY/WAITING STATE HELPER */}
        {participantCount === 1 && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-pink-500 shrink-0" />
            <p>
              Waiting for other participants to join with the room code.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}