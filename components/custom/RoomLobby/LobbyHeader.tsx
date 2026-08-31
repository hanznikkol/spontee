import { Badge } from "@/components/ui/badge"

interface LobbyHeaderProps {
  roomName?: string
  isActive: boolean
}

export default function LobbyHeader({ roomName, isActive }: LobbyHeaderProps) {
  return (
    <div className="space-y-2 text-center md:text-left">
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground wrap-break-word">
          {roomName || "Spontee Decision Room"}
        </h1>

        <Badge
          variant="outline"
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isActive
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          <span
            className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
              isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          {isActive ? "Room Open" : "Lobby · Waiting"}
        </Badge>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {isActive
          ? "The room is live! When everyone is ready, start voting on places."
          : "Share the code or QR below so your group can join before voting starts."}
      </p>
    </div>
  )
}