'use client'

import React from 'react'
import { Check, Vote as VoteIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MyVotesTriggerProps {
  onClick: () => void
  totalVotes?: number
  goCount?: number
  passCount?: number
  className?: string
}

export function MyVotesTrigger({
  onClick,
  totalVotes = 0,
  goCount = 0,
  passCount = 0,
  className,
}: MyVotesTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none',
        'bg-background/80 hover:bg-background border-border/80 hover:border-primary/40 shadow-xs backdrop-blur-md active:scale-97 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label="Open personal vote review"
    >
      <VoteIcon className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
      <span className="text-foreground font-medium">My Votes</span>

      {totalVotes > 0 && (
        <span className="flex items-center gap-1.5 pl-1 text-[11px] font-bold border-l border-border/60">
          {goCount > 0 && (
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3 stroke-3" />
              <span>{goCount}</span>
            </span>
          )}
          {passCount > 0 && (
            <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
              <X className="h-3 w-3 stroke-[2.5]" />
              <span>{passCount}</span>
            </span>
          )}
        </span>
      )}
    </button>
  )
}
