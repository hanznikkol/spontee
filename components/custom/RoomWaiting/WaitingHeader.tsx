import { Badge } from '@/components/ui/badge'

interface WaitingHeaderProps {
  roomName?: string
  roomCode?: string
  isAllFinished?: boolean
}

export default function WaitingHeader({
  roomName,
  roomCode,
  isAllFinished,
}: WaitingHeaderProps) {
  return (
    <div className="text-center space-y-1.5">
      <h1 className="text-2xl font-bold tracking-tight">
        {roomName || 'Voting Session'}
      </h1>

      {roomCode && (
        <p className="text-xs text-muted-foreground">
          Room{' '}
          <span className="font-mono font-medium tracking-wider">
            {roomCode}
          </span>
        </p>
      )}

      <Badge
        variant={isAllFinished ? 'default' : 'secondary'}
        className="rounded-full px-3 py-0.5 text-xs font-medium gap-1.5 inline-flex items-center"
      >
        {isAllFinished ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All Votes In
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Waiting for Others
          </>
        )}
      </Badge>

      <p className="text-sm text-muted-foreground">
        {isAllFinished
          ? 'Finalizing your group’s recommendation'
          : 'Hang tight while the rest of the group finishes voting'}
      </p>
    </div>
  )
}