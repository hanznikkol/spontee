"use client"

import React from "react"
import { Check, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { categories } from "@/lib/room/create/types/categories"

interface PreferenceCategorySelectorProps {
  value: string[]
  onChange: (categories: string) => void
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
            Select 1 to 3 categories for nearby spots.
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
          {selectedCount} of 3 selected
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
                  <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
