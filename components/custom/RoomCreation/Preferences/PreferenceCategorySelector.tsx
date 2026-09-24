"use client"

import React from "react"
import { Check, Info, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { categories, MAX_SELECTED_CATEGORIES } from "@/lib/room/create/types/categories"

interface PreferenceCategorySelectorProps {
  value: string[]
  onChange: (categories: string) => void
}

const singleCategoryNotes: Record<string, string> = {
  food: "Looking for top-rated restaurants, eateries, and quick bites.",
  coffee: "Looking for cozy cafes, coffee shops, and tea spots.",
  dessert: "Looking for sweet treats, bakeries, and dessert spots.",
  drinks: "Looking for craft beverages, breweries, wine, and cocktail spots.",
  bars: "Looking for nightlife, pubs, sports bars, and lounges.",
  entertainment: "Looking for fun activities, games, and entertainment venues.",
  shopping: "Looking for malls, retail markets, and shopping districts.",
  parks: "Looking for parks, scenic gardens, and outdoor spaces.",
  karaoke: "Looking for karaoke lounges and sing-along rooms.",
  sports: "Looking for athletic clubs, fitness, and sports recreation.",
  wellness: "Looking for spas, massage centers, and relaxation spots.",
}

function getCategoryNote(selected: string[]): string {
  if (selected.length === 0) {
    return "You can choose up to 2 categories."
  }

  if (selected.length === 1) {
    return singleCategoryNotes[selected[0]] ?? "Finding the best nearby options for your choice."
  }

  const labels = selected.map(
    (name) => categories.find((c) => c.name === name)?.label ?? name
  )

  const set = new Set(selected)
  if (set.has("food") && set.has("coffee")) {
    return "Great meal + coffee combo — cafe eateries serving both get top priority!"
  }
  if (set.has("food") && set.has("dessert")) {
    return "Savory & sweet mix — dining spots with great dessert menus get top priority!"
  }
  if (set.has("food") && set.has("drinks")) {
    return "Food & drinks pairing — spots with both good food and great drinks prioritized."
  }
  if (set.has("food") && set.has("bars")) {
    return "Dinner & nightlife — spots with great food and drinks prioritized."
  }
  if (set.has("entertainment") && set.has("food")) {
    return "Fun activity + bites — entertainment venues with food options prioritized."
  }
  if (set.has("drinks") && set.has("bars")) {
    return "Full drinks & nightlife mix across cocktail lounges, pubs, and bars."
  }

  return `Combining ${labels[0]} & ${labels[1]} — versatile spots that offer both get prioritized!`
}

export function PreferenceCategorySelector({
  value,
  onChange,
}: PreferenceCategorySelectorProps) {
  const selectedCount = value.length

  return (
    <section className="space-y-3" aria-labelledby="preference-category-title">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2
            id="preference-category-title"
            className="text-sm font-semibold flex items-center gap-1.5"
          >
            <Layers className="h-4 w-4 text-pink-500" />
            Categories
          </h2>
          <p className="text-xs text-muted-foreground">
            You can choose up to 2 categories.
          </p>
        </div>

        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors",
            selectedCount > 0
              ? "bg-pink-500/15 text-pink-600 dark:text-pink-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {selectedCount} of {MAX_SELECTED_CATEGORIES} selected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group">
        {categories.map((category) => {
          const isSelected = value.includes(category.name)

          return (
            <button
              key={category.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(category.name)}
              className={cn(
                "relative flex min-h-[68px] sm:min-h-[74px] flex-col items-start justify-between rounded-2xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50",
                isSelected
                  ? "border-pink-500 bg-pink-500/10 text-foreground shadow-xs ring-1 ring-pink-500/30"
                  : "border-border/70 bg-background/50 text-muted-foreground hover:border-pink-500/40 hover:bg-pink-500/5 hover:text-foreground"
              )}
            >
              <span className="text-xl sm:text-2xl select-none" aria-hidden="true">
                {category.emoji}
              </span>

              <span
                className={cn(
                  "text-xs font-semibold tracking-tight transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {category.label}
              </span>

              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs">
                  <Check className="h-3 w-3 stroke-3" aria-hidden="true" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-pink-500/5 border border-pink-500/10 px-3 py-2 text-[11px] sm:text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 text-pink-500 shrink-0" />
        <span>{getCategoryNote(value)}</span>
      </div>
    </section>
  )
}
