"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { RoomMode } from "@/lib/room/create/room-types"

type ModeOption = {
  id: RoomMode
  emoji: string
  label: string
  desc: string
}

type RoomModeSelectorProps = {
  value: RoomMode | null
  onChange: (value: RoomMode) => void
  options: ModeOption[]
}

export function RoomModeSelector({
  value,
  onChange,
  options,
}: RoomModeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Who&apos;s deciding</Label>

      <div className="grid grid-cols-2 gap-2">
        {options.map((m) => {
          const isActive = value === m.id

          return (
            <Button
              key={m.id}
              type="button"
              variant="outline"
              onClick={() => onChange(m.id)}
              className={cn(
                "relative h-auto flex flex-col items-start text-left p-4 rounded-2xl transition-all",
                isActive
                  ? "border-primary bg-primary/5 shadow-sm hover:bg-primary/5"
                  : "border-border hover:bg-muted/40"
              )}
            >
              {/* selected dot */}
              {isActive && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              )}

              {/* icon */}
              <div className="text-lg">{m.emoji}</div>

              {/* title */}
              <div className="mt-2 font-semibold text-sm">
                {m.label}
              </div>

              {/* description */}
              <div className="text-xs text-muted-foreground text-wrap md:text-nowrap">
                {m.desc}
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}