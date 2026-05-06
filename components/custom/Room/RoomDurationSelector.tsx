"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TimePreset } from "@/lib/room/time-limits"
import { cn } from "@/lib/utils"
import { PRESET_UI } from "@/lib/room/time-limits"
import { RoomMode } from "@/lib/room/room-types"

type Props = {
  mode: RoomMode
  value: TimePreset | null
  onChange: (value: TimePreset) => void
}

export function RoomDurationSelector({
  mode,
  value,
  onChange,
}: Props) {
  const options = PRESET_UI[mode]

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Room Duration</Label>
        <p className="text-xs text-muted-foreground">
          Choose how long the room will stay active
        </p>
      </div>

      <RadioGroup
        value={value ?? ""}
        onValueChange={(val) => onChange(val as TimePreset)}
        className="grid grid-cols-2 gap-2"
      >
        {options.map((t) => {
          const isSelected = value === t.key

          return (
            <div key={t.key}>
              <RadioGroupItem
                id={t.key}
                value={t.key}
                className="sr-only"
              />

              <Label
                htmlFor={t.key}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all",
                  "hover:shadow-sm hover:border-primary/40",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border text-muted-foreground"
                )}
              >
                <span className="text-sm font-semibold">
                  {t.label}
                </span>
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}