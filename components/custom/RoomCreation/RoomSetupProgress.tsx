"use client"

import { Progress } from "@/components/ui/progress"

interface SetupProgressProps {
  step: number
  total: number
}

export function SetupProgress({
  step,
  total,
}: SetupProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {step} of {total}</span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>

      <Progress value={(step / total) * 100} />
    </div>
  )
}