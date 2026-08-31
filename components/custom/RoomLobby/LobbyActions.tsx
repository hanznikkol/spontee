import React from "react"
import { ArrowRight, Clock3, DoorOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LobbyActionsProps {
  isHost?: boolean
  isLobby: boolean
  isActive: boolean
  participantCount: number
  canOpenRoom: boolean
  loading: boolean
  onOpenRoom: () => void
  onStartVoting: () => void
}

export default function LobbyActions({
  isHost,
  isLobby,
  isActive,
  participantCount,
  canOpenRoom,
  loading,
  onOpenRoom,
  onStartVoting,
}: LobbyActionsProps) {
  // STATE 1: HOST & LOBBY
  if (isHost && isLobby) {
    const isWaitingForOthers = participantCount < 2

    return (
      <div className="w-full space-y-2.5">
        <Button
          size="lg"
          onClick={onOpenRoom}
          disabled={!canOpenRoom || loading}
          className={`w-full h-12 sm:h-13 rounded-2xl font-semibold text-sm sm:text-base gap-2 transition-all ${
            canOpenRoom && !loading
              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99]"
              : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Opening room...</span>
            </>
          ) : isWaitingForOthers ? (
            <>
              <Clock3 className="h-4 w-4" />
              <span>Waiting for at least 1 more person...</span>
            </>
          ) : (
            <>
              <DoorOpen className="h-4 w-4" />
              <span>Open Room for Voting</span>
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {isWaitingForOthers
            ? "Invite at least 1 more friend to open the room."
            : "Opening the room allows everyone to begin swipe voting."}
        </p>
      </div>
    )
  }

  // STATE 2: HOST & ACTIVE
  if (isHost && isActive) {
    return (
      <div className="w-full space-y-2.5">
        <Button
          size="lg"
          onClick={onStartVoting}
          disabled={loading}
          className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Entering voting...</span>
            </>
          ) : (
            <>
              <span>Start Voting</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Room is live! Tap to begin swipe voting on options.
        </p>
      </div>
    )
  }

  // STATE 3: PARTICIPANT (NON-HOST) & LOBBY
  if (!isHost && isLobby) {
    return (
      <div className="w-full space-y-2.5">
        <Button
          size="lg"
          disabled
          className="w-full h-12 sm:h-13 rounded-2xl font-semibold text-sm sm:text-base gap-2 opacity-80"
        >
          <Clock3 className="h-4 w-4" />
          <span>Waiting for Host to Open Room...</span>
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Hang tight! The host will open the room when everyone is ready.
        </p>
      </div>
    )
  }

  // STATE 4: PARTICIPANT (NON-HOST) & ACTIVE
  if (!isHost && isActive) {
    return (
      <div className="w-full space-y-2.5">
        <Button
          size="lg"
          onClick={onStartVoting}
          disabled={loading}
          className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Entering voting...</span>
            </>
          ) : (
            <>
              <span>Start Voting</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          The host opened the room! Tap above to start voting.
        </p>
      </div>
    )
  }

  return null
}