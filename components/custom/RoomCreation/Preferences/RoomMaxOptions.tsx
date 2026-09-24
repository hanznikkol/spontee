"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Layers } from "lucide-react"
import { MAX_OPTIONS_VALUES } from "@/lib/room/create/types/constants/max-options-const"
import { cn } from "@/lib/utils"

interface RoomMaxOptionsProps {
  maxOptions: number
  onChange: (maxOptions: number) => void
}

export function RoomMaxOptions({ maxOptions, onChange }: RoomMaxOptionsProps) {
  // Ensure value is strictly one of the supported values in MAX_OPTIONS_VALUES
  const safeMaxOptions = (MAX_OPTIONS_VALUES as readonly number[]).includes(maxOptions)
    ? maxOptions
    : (MAX_OPTIONS_VALUES.find((val) => val >= maxOptions) ?? 10)

  return (
    <div className="space-y-3.5 rounded-2xl border border-border/70 bg-background/50 p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-purple-500" />
            Places to Swipe
          </Label>
          <p className="text-xs text-muted-foreground">
            How many options should we discover?
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
          {safeMaxOptions} places
        </span>
      </div>

      {/* QUICK PRESET BUTTONS */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {MAX_OPTIONS_VALUES.map((val) => {
          const isSelected = val === safeMaxOptions
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl py-2 px-1 text-xs font-semibold transition-all cursor-pointer",
                isSelected
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm shadow-pink-500/25"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
              )}
            >
              <span className="text-sm font-bold">{val}</span>
              <span className="text-[10px] opacity-80">spots</span>
            </button>
          )
        })}
      </div>

      {/* HELPER SUBTEXT */}
      <p className="text-center text-[11px] text-muted-foreground pt-1">
        We&apos;ll show up to this many options to swipe on, depending on what&apos;s available near your location.
      </p>
    </div>
  )
}