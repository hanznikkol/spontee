"use client"

import React from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Compass } from "lucide-react"
import { RADIUS_VALUES } from "@/lib/room/create/types/location"
import { cn } from "@/lib/utils"

export function LocationRadius({
  radius,
  onChange,
}: {
  radius: number
  onChange: (radius: number) => void
}) {
  const selectedIndex = RADIUS_VALUES.indexOf(radius)

  function formatRadius(r: number) {
    if (r < 1000) return `${r} m`
    return `${r / 1000} km`
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-background/50 p-3.5 sm:p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-blue-500" />
            Search Radius
          </Label>
          <p className="text-xs text-muted-foreground">
            How far from the pin to search?
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
          {formatRadius(radius)} radius
        </span>
      </div>

      {/* QUICK PRESET CHIPS */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 pt-0.5">
        {RADIUS_VALUES.map((val) => {
          const isSelected = val === radius
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={cn(
                "rounded-xl py-1.5 px-0.5 sm:px-1 text-[10px] sm:text-xs font-semibold transition-all cursor-pointer text-center",
                isSelected
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
              )}
            >
              {formatRadius(val)}
            </button>
          )
        })}
      </div>

      {/* SLIDER */}
      <div className="pt-0.5 space-y-1.5">
        <Slider
          value={[selectedIndex === -1 ? 1 : selectedIndex]}
          min={0}
          max={RADIUS_VALUES.length - 1}
          step={1}
          onValueChange={([nextIndex]) =>
            onChange(RADIUS_VALUES[nextIndex] ?? radius)
          }
          aria-label="Search radius"
          className="cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Walking distance (500m)</span>
          <span>Drive (10km)</span>
        </div>
      </div>
    </div>
  )
}