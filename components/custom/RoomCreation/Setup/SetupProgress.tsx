"use client"

import { ProgressBar } from "../../ProgressBar"

interface SetupProgressProps {
  step: number
  total: number
}

export function SetupProgress({
  step,
  total,
}: SetupProgressProps) {
  const value = (step / total) * 100

  return (
    <ProgressBar
      value={value}
      leftLabel={`Step ${step} of ${total}`}
      rightLabel={`${Math.round(value)}%`}
    />
  )
}