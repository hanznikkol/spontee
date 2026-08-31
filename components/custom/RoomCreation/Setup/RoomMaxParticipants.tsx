"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UsersRound, Plus, Minus } from "lucide-react"

interface RoomMaxParticipantsProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

function RoomMaxParticipants({
  value,
  onChange,
  min = 2,
  max = 25,
}: RoomMaxParticipantsProps) {
  const handleIncrement = () => {
    onChange(Math.min(value + 1, max))
  }

  const handleDecrement = () => {
    onChange(Math.max(value - 1, min))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (Number.isNaN(newValue)) return
    onChange(newValue)
  }

  const handleBlur = () => {
    onChange(Math.min(Math.max(value, min), max))
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-background/50 p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="max-participants" className="text-sm font-semibold flex items-center gap-1.5">
            <UsersRound className="h-4 w-4 text-pink-500" />
            Max Participants
          </Label>
          <p className="text-xs text-muted-foreground">
            How many people can join the room?
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-bold text-pink-600 dark:text-pink-400">
          {value} {value === 1 ? "person" : "people"}
        </span>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-10 w-10 rounded-xl border-border/80 hover:bg-muted/80 disabled:opacity-40 transition-colors"
          aria-label="Decrease participants"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          id="max-participants"
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className="h-10 w-20 text-center font-mono text-base font-semibold rounded-xl"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-10 w-10 rounded-xl border-border/80 hover:bg-muted/80 disabled:opacity-40 transition-colors"
          aria-label="Increase participants"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="flex-1 text-right text-xs text-muted-foreground">
          Limit: {min} – {max}
        </div>
      </div>
    </div>
  )
}

export default RoomMaxParticipants