import { ArrowRight, Clock3, DoorOpen, Loader2, } from 'lucide-react'

import { Button } from '@/components/ui/button'

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

export default function LobbyActions({ isHost, isLobby, isActive, participantCount, canOpenRoom, loading, onOpenRoom, onStartVoting, }: LobbyActionsProps) {
  if (isHost && isLobby) {
    return (
      <>
        <Button
          size="lg"
          className="rounded-2xl gap-2"
          onClick={onOpenRoom}
          disabled={!canOpenRoom || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Opening...
            </>
          ) : participantCount < 2 ? (
            <>
              <Clock3 className="w-4 h-4" />
              Waiting for Others...
            </>
          ) : (
            <>
              
              Open Room
              <DoorOpen className="w-4 h-4" />
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You can start anytime
        </p>
      </>
    )
  }

  if (isHost && isActive) {
    return (
      <Button
        size="lg"
        className="rounded-2xl gap-2"
        onClick={onStartVoting}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            Start Voting
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    )
  }

  if (!isHost && isLobby) {
    return (
      <Button
        size="lg"
        disabled
        className="rounded-2xl"
      >
        <Clock3 className="w-4 h-4" />
        Waiting for Host...
      </Button>
    )
  }

  if (!isHost && isActive) {
    return (
      <Button
        size="lg"
        className="rounded-2xl gap-2"
        onClick={onStartVoting}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            Start Voting
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    )
  }

  return null
}