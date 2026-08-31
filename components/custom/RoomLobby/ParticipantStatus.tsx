import { Check, Clock3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  ParticipantStatus as Status,
} from "@/lib/room/lobby/types/participants-types"
import { SwipeIndicator } from "./SwipeIndicator"

interface ParticipantStatusProps {
  status: Status
}

const statusConfig = {
  waiting: {
    label: "Waiting",
    icon: Clock3,
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  finished: {
    label: "Ready",
    icon: Check,
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
} as const

export function ParticipantStatus({ status }: ParticipantStatusProps) {
  if (status === "voting") {
    return (
      <Badge
        variant="outline"
        className="rounded-full gap-1.5 px-2.5 py-0.5 text-[11px] font-medium border-pink-500/25 bg-pink-500/10 text-pink-600 dark:text-pink-400"
      >
        <SwipeIndicator />
        <span>Voting</span>
      </Badge>
    )
  }

  const config = statusConfig[status] ?? statusConfig.waiting
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`
        rounded-full gap-1 px-2.5 py-0.5
        text-[11px] font-medium
        ${config.className}
      `}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  )
}