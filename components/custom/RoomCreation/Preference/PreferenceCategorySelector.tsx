"use client"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { categories } from "@/lib/room/create/types/categories"

interface PreferenceCategorySelectorProps {
  value: string[]
  onChange: (categories: string) => void
}

export function PreferenceCategorySelector({ value, onChange }: PreferenceCategorySelectorProps) {

  return (
    <section className="space-y-3" aria-labelledby="preference-category-title">
      <div className="space-y-1">
        <h2 id="preference-category-title" className="text-base font-semibold">
          What are you deciding today?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose at least 3 category. We&apos;ll find nearby places for your group.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup">
        {categories.map((category) => {
          const isSelected = value.includes(category.name)

          return (
            <button
              key={category.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(category.name)}
              className={cn(
                "relative flex min-h-20 flex-col items-start justify-between rounded-2xl border bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                isSelected &&
                  "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/25"
              )}
            >
              <span className="text-2xl" aria-hidden="true">
                {category.emoji}
              </span>
              <span className="text-sm font-medium text-foreground">
                {category.label}
              </span>

              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
