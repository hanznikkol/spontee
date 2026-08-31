"use client"

import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SetupProgressProps {
  step: number
  total?: number
}

const STEP_METADATA = [
  { step: 1, title: "Host Name", short: "Host" },
  { step: 2, title: "Room Setup", short: "Setup" },
  { step: 3, title: "Preferences", short: "Prefs" },
]

export function SetupProgress({ step, total = 3 }: SetupProgressProps) {
  const percentage = Math.round((step / total) * 100)

  return (
    <div className="w-full min-w-0 space-y-2.5">
      {/* STEP NAVIGATION MILESTONES */}
      <div className="flex items-center justify-between gap-1 text-xs">
        {STEP_METADATA.map((item) => {
          const isCompleted = step > item.step
          const isCurrent = step === item.step

          return (
            <div
              key={item.step}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 transition-colors",
                isCurrent && "font-semibold text-foreground",
                isCompleted && "text-muted-foreground",
                !isCurrent && !isCompleted && "text-muted-foreground/40"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                  isCompleted && "bg-emerald-500 text-white shadow-xs",
                  isCurrent &&
                    "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs shadow-pink-500/30 ring-2 ring-pink-500/20",
                  !isCurrent &&
                    !isCompleted &&
                    "bg-muted text-muted-foreground border border-border/60"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : item.step}
              </div>
              <span className="hidden sm:inline text-xs">{item.title}</span>
              <span className="inline sm:hidden text-[11px]">{item.short}</span>
            </div>
          )
        })}
      </div>

      {/* CONTINUOUS GRADIENT PROGRESS BAR */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
          <span>Step {step} of {total}</span>
          <span className="font-mono font-semibold text-pink-500 dark:text-pink-400">
            {percentage}%
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80 border border-border/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}