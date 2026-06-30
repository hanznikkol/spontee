import { motion } from "framer-motion"
import { Lightbulb } from "lucide-react"

export function OptionEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
        <Lightbulb className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-sm font-semibold">No options yet</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Use a quick template or type your first idea to start building the vote.
      </p>
    </motion.div>
  )
}
