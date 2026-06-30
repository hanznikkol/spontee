import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import type { OptionCategory, OptionCategoryId } from "@/lib/room/create/options/option-types"

type OptionCategoriesProps = {
  categories: OptionCategory[]
  selected: OptionCategoryId[]
  onToggle: (categoryId: OptionCategoryId) => void
}

export function OptionCategories({
  categories,
  selected,
  onToggle,
}: OptionCategoriesProps) {
  return (
    <section className="space-y-3" aria-labelledby="option-categories">
      <div className="flex items-center justify-between gap-3">
        <Label id="option-categories">Categories</Label>
        <span className="text-xs text-muted-foreground">Optional</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selected.includes(category.category_id)

          return (
            <motion.div
              key={category.category_id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                type="button"
                variant="outline"
                aria-pressed={isSelected}
                onClick={() => onToggle(category.category_id)}
                className={cn(
                  "h-9 rounded-full px-3 transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm hover:bg-primary/10"
                    : "bg-background hover:bg-muted/50"
                )}
              >
                <span aria-hidden="true">{category.emoji}</span>
                <span>{category.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
