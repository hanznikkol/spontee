"use client"

import React from "react"

interface ProgressBarProps {
  value: number
  leftLabel?: React.ReactNode
  rightLabel?: React.ReactNode
}

export function ProgressBar({
  value,
  leftLabel,
  rightLabel,
}: ProgressBarProps) {
  return (
    <div className="space-y-1.5 w-full">
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>{leftLabel}</span>
          <span className="font-mono font-semibold text-foreground">{rightLabel}</span>
        </div>
      )}

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
          }}
        />
      </div>
    </div>
  )
}