import { motion } from "framer-motion"
import { Bot, Plus, WandSparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import type { SuggestionGroup } from "@/lib/room/create/options/option-types"

type QuickSuggestionsProps = {
  groups: SuggestionGroup[]
  onAddSuggestion: (title: string, category: string, source: SuggestionGroup["source"]) => void
}

export function QuickSuggestions({
  groups,
  onAddSuggestion,
}: QuickSuggestionsProps) {
  return (
    <section className="space-y-3" aria-labelledby="quick-suggestions">
      <div className="flex items-center justify-between gap-3">
        <Label id="quick-suggestions">Quick Suggestions</Label>
        <WandSparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <motion.div
            key={group.title}
            whileHover={{ y: -2 }}
            className="rounded-2xl border bg-muted/20 p-3"
          >
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {group.options.map((option) => (
                <Button
                  key={option.title}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-full bg-background"
                  onClick={() => onAddSuggestion(option.title, option.category, group.source)}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  {option.title}
                </Button>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-dashed bg-primary/5 p-3 sm:col-span-2"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
              <Bot className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">AI Suggestions</h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Smart suggestions will appear here based on your room name,
                categories, and group context.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
