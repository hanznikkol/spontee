import { Badge } from '@/components/ui/badge'

interface LobbyHeaderProps {
  roomName?: string
  isActive: boolean
}

export default function LobbyHeader({ roomName, isActive }: LobbyHeaderProps) {
  return (
    <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
        {roomName}
        </h1>

        <Badge variant={isActive ? 'default' : 'secondary'} className="rounded-full px-3">
            {isActive
                ? '🟢 Room Open'
                : '🟡 Waiting for Host to Start'}
        </Badge>

        <p className="text-sm text-muted-foreground">
            Share the link so everyone can join
        </p>
    </div>
  )
}