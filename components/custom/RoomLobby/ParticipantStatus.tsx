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
    label: "Finished",
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
        className="rounded-full gap-1.5 px-2.5 py-1 text-[11px] font-medium border-primary/20 bg-primary/10 text-primary"
      >
        <SwipeIndicator />
        Voting
      </Badge>
    )
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`
        rounded-full gap-1.5 px-2.5 py-1
        text-[11px] font-medium
        ${config.className}
      `}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}