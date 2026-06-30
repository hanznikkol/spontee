import { useState } from "react"
import { motion } from "framer-motion"
import { Check, GripVertical, Pencil, Sparkle, Trash2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { OptionSource, RoomOption } from "@/lib/room/create/options/option-types"

const sourceStyles: Record<OptionSource, string> = {
  manual: "bg-foreground/5 text-foreground",
  template: "bg-primary/10 text-primary",
  ai: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  search: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  import: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
}

type OptionItemProps = {
  option: RoomOption
  onDelete: (id: string) => void
  onEdit: (id: string, title: string) => boolean
}

export function OptionItem({ option, onDelete, onEdit }: OptionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(option.title)

  const saveEdit = () => {
    const saved = onEdit(option.option_id, draftTitle)
    if (saved) {
      setIsEditing(false)
    }
  }

  const cancelEdit = () => {
    setDraftTitle(option.title)
    setIsEditing(false)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -12, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border bg-background p-3 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-2 text-muted-foreground/70 transition-colors hover:text-foreground"
          aria-label={`Drag ${option.title}`}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
          <Sparkle className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {isEditing ? (
            <Input
              value={draftTitle}
              autoFocus
              maxLength={48}
              onChange={(event) => setDraftTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveEdit()
                if (event.key === "Escape") cancelEdit()
              }}
              className="h-8 rounded-xl"
              aria-label={`Edit ${option.title}`}
            />
          ) : (
            <div>
              <h3 className="truncate text-sm font-semibold">{option.title}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {option.description ?? "Add a note later when details are ready."}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{option.category}</Badge>
            <Badge
              variant="outline"
              className={cn("border-transparent", sourceStyles[option.source])}
            >
              {option.source}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          {isEditing ? (
            <>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={saveEdit}
                aria-label={`Save ${option.title}`}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={cancelEdit}
                aria-label={`Cancel editing ${option.title}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                aria-label={`Edit ${option.title}`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => onDelete(option.option_id)}
                aria-label={`Delete ${option.title}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.li>
  )
}
