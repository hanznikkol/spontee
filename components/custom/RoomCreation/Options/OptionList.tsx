import { AnimatePresence, motion } from "framer-motion"

import { Label } from "@/components/ui/label"

import { OptionEmptyState } from "./OptionEmptyState"
import { OptionItem } from "./OptionItem"
import type { RoomOption } from "@/lib/room/create/options/option-types"

type OptionListProps = {
  options: RoomOption[]
  onDelete: (id: string) => void
  onEdit: (id: string, title: string) => boolean
}

export function OptionList({ options, onDelete, onEdit }: OptionListProps) {
  return (
    <section className="space-y-3" aria-labelledby="option-list">
      <div className="flex items-center justify-between gap-3">
        <Label id="option-list">Options List</Label>
        <span className="text-xs text-muted-foreground">
          {options.length} {options.length === 1 ? "option" : "options"}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {options.length === 0 ? (
          <OptionEmptyState key="empty" />
        ) : (
          <motion.ul layout className="space-y-2">
            <AnimatePresence initial={false}>
              {options.map((option) => (
                <OptionItem
                  key={option.option_id}
                  option={option}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  )
}
