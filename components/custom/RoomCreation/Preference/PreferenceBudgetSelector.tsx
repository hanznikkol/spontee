"use client"

import React from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Banknote } from "lucide-react"
import { budgetChoices, PreferenceBudget } from "@/lib/room/create/types/budget"

interface PreferenceBudgetSelectorProps {
  value?: PreferenceBudget
  onChange: (budget?: PreferenceBudget) => void
}

export function PreferenceBudgetSelector({
  value = "any",
  onChange,
}: PreferenceBudgetSelectorProps) {
  const currentLabel =
    budgetChoices.find((c) => c.value === value)?.label ?? "Any Budget"

  return (
    <section className="space-y-3" aria-labelledby="preference-budget-title">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2
            id="preference-budget-title"
            className="text-sm font-semibold flex items-center gap-1.5"
          >
            <Banknote className="h-4 w-4 text-purple-500" />
            Budget Tier
          </h2>
          <p className="text-xs text-muted-foreground">
            Filter options by estimated price range.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
          {currentLabel}
        </span>
      </div>

      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(nextValue) =>
          onChange(nextValue ? (nextValue as PreferenceBudget) : undefined)
        }
        className="grid w-full grid-cols-4 rounded-2xl border border-border/70 bg-background/50 p-1 gap-1"
        spacing={0}
      >
        {budgetChoices.map((choice) => (
          <ToggleGroupItem
            key={choice.value}
            value={choice.value}
            aria-label={choice.label}
            className="h-9 sm:h-10 rounded-xl px-0.5 sm:px-2 text-[11px] sm:text-xs font-semibold transition-all data-[state=on]:bg-gradient-to-r data-[state=on]:from-pink-500 data-[state=on]:to-purple-500 data-[state=on]:text-white data-[state=on]:shadow-xs data-[state=on]:shadow-pink-500/25 data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground cursor-pointer"
          >
            {choice.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
