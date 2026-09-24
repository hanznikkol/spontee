"use client"

import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepItem {
  step: number
  title: string
}

interface SetupProgressProps {
  step: number
  total?: number
  steps?: StepItem[]
}

const DEFAULT_STEPS: StepItem[] = [
  { step: 1, title: "Room" },
  { step: 2, title: "Preferences" },
  { step: 3, title: "Location" },
]

export function SetupProgress({
  step,
  total = 3,
  steps = DEFAULT_STEPS,
}: SetupProgressProps) {
  const currentStep = steps.find((item) => item.step === step)

  return (
    <nav
      aria-label={`Step ${step} of ${total}: ${currentStep?.title ?? ""}`}
      className="w-full min-w-0"
    >
      {/* 3-STEP MILESTONE SEGMENTED INDICATOR */}
      <div className="flex items-center justify-between gap-1 text-xs">
        {steps.map((item, index) => {
          const isCompleted = step > item.step
          const isCurrent = step === item.step
          const isUpcoming = step < item.step

          return (
            <React.Fragment key={item.step}>
              {/* STEP NODE */}
              <div
                className={cn(
                  "flex items-center gap-1.5 transition-colors shrink-0",
                  isCurrent && "font-semibold text-foreground",
                  isCompleted && "text-muted-foreground",
                  isUpcoming && "text-muted-foreground/40"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                    isCompleted && "bg-emerald-500 text-white shadow-xs",
                    isCurrent &&
                      "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs shadow-pink-500/30 ring-2 ring-pink-500/20",
                    isUpcoming &&
                      "bg-muted text-muted-foreground/60 border border-border/60"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
                  ) : (
                    item.step
                  )}
                </div>
                <span className="text-[11px] sm:text-xs tracking-tight">
                  {item.title}
                </span>
              </div>

              {/* CONNECTING TRACK LINE */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 min-w-3 sm:min-w-6 rounded-full transition-all duration-300",
                    step > item.step
                      ? "bg-gradient-to-r from-pink-500 to-purple-500"
                      : "bg-border/60"
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}