"use client"

import { useState } from "react"
import { Coffee, Heart, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResultSupportCardProps {
  onDismiss?: () => void
}

export function ResultSupportCard({ onDismiss }: ResultSupportCardProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const supportUrl =
    process.env.NEXT_PUBLIC_SUPPORT_URL || "https://buymeacoffee.com/spontee"

  return (
    <div className="w-full rounded-2xl border border-pink-500/20 bg-linear-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 p-3.5 sm:p-4 text-card-foreground relative transition-all animate-in fade-in duration-300">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-2.5 right-2.5 p-1 rounded-lg text-muted-foreground/60 hover:text-foreground transition cursor-pointer"
        aria-label="Dismiss support prompt"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0 ring-1 ring-pink-500/20">
            <Coffee className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <span>Support Spontee</span>
              <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
            </h4>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-normal max-w-sm">
              Help keep group decisions fast, fun, and ad-free.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
          >
            Maybe later
          </Button>

          <Button
            size="sm"
            asChild
            className="h-8 px-3 text-xs font-semibold rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/30 transition shadow-none active:scale-[0.98]"
          >
            <a href={supportUrl} target="_blank" rel="noopener noreferrer">
              <span>Buy a coffee</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
