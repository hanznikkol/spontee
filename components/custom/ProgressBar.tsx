"use client"

import { Progress } from "@/components/ui/progress"

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
    <div className="space-y-2">
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}

      <Progress value={value} />
    </div>
  )
}