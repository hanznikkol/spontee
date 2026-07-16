"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { budgetChoices, PreferenceBudget } from "@/lib/room/create/types/budget"


interface PreferenceBudgetSelectorProps {
  value?: PreferenceBudget
  onChange: (budget?: PreferenceBudget) => void
}

export function PreferenceBudgetSelector({ value, onChange, }: PreferenceBudgetSelectorProps) {
  return (
    <section className="space-y-3" aria-labelledby="preference-budget-title">
      <h2 id="preference-budget-title" className="text-base font-semibold">
        Budget
      </h2>

      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(nextValue) =>
          onChange(nextValue ? (nextValue as PreferenceBudget) : undefined)
        }
        className="grid w-full grid-cols-4 rounded-2xl bg-muted p-1"
        spacing={0}
      >
        {budgetChoices.map((choice) => (
          <ToggleGroupItem
            key={choice.value}
            value={choice.value}
            aria-label={choice.label}
            className="h-10 rounded-xl data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm"
          >
            {choice.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
