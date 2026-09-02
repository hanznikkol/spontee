'use client'

import React from 'react'
import Image from 'next/image'
import { Check, X, Star, MapPin, Sparkles, Frown, ThumbsUp, ThumbsDown } from 'lucide-react'
import { UserVote, VoteFilter } from '@/lib/room/voting/types/vote.types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MyVotesProps {
  votes: UserVote[]
  filteredVotes: UserVote[]
  filter: VoteFilter
  onFilterChange: (filter: VoteFilter) => void
  goCount: number
  passCount: number
  totalCount: number
  loading?: boolean
  error?: string | null
  totalOptions?: number
}

export function MyVotes({
  votes,
  filteredVotes,
  filter,
  onFilterChange,
  goCount,
  passCount,
  totalCount,
  loading = false,
  error = null,
  totalOptions,
}: MyVotesProps) {
  function formatPriceLevel(level?: number | null) {
    if (!level) return null
    return '₱'.repeat(level)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top summary metrics */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-muted/50 border border-border/50">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {totalOptions && totalOptions > 0
              ? `${totalCount} of ${totalOptions} completed`
              : `${totalCount} ${totalCount === 1 ? 'place' : 'places'} swiped`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Check className="h-3 w-3 stroke-3" />
            <span>{goCount} GO</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <X className="h-3 w-3 stroke-[2.5]" />
            <span>{passCount} PASS</span>
          </span>
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-muted/70 text-xs font-semibold gap-1">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer',
            filter === 'all'
              ? 'bg-background text-foreground shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span>All</span>
          <span className="text-[11px] opacity-75 font-mono">({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('go')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer',
            filter === 'go'
              ? 'bg-emerald-500 text-white shadow-xs font-bold shadow-emerald-500/20'
              : 'text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400'
          )}
        >
          <Check className="h-3 w-3 stroke-3" />
          <span>GO</span>
          <span className="text-[11px] opacity-90 font-mono">({goCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('pass')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer',
            filter === 'pass'
              ? 'bg-rose-500 text-white shadow-xs font-bold shadow-rose-500/20'
              : 'text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400'
          )}
        >
          <X className="h-3 w-3 stroke-[2.5]" />
          <span>PASS</span>
          <span className="text-[11px] opacity-90 font-mono">({passCount})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[160px] max-h-[52dvh] sm:max-h-[58dvh] overflow-y-auto overscroll-contain pr-0.5 space-y-2.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2.5 text-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-xs text-muted-foreground animate-pulse">Loading your votes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <Frown className="h-8 w-8 text-rose-500/80" />
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          </div>
        ) : votes.length === 0 ? (
          /* Empty overall state */
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2.5 rounded-2xl border border-dashed border-border/80 bg-muted/20">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">No votes recorded yet</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Swipe cards right for <span className="font-semibold text-emerald-600 dark:text-emerald-400">GO</span> or left for <span className="font-semibold text-rose-600 dark:text-rose-400">PASS</span> to build your vote list.
              </p>
            </div>
          </div>
        ) : filteredVotes.length === 0 ? (
          /* Empty filtered state */
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/20">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              {filter === 'go' ? (
                <ThumbsUp className="h-4 w-4" />
              ) : (
                <ThumbsDown className="h-4 w-4" />
              )}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                {filter === 'go' ? 'No GO votes yet' : 'No PASS votes yet'}
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {filter === 'go'
                  ? 'Swipe right on places you want to go to see them here.'
                  : 'Swipe left on places you want to pass on to see them here.'}
              </p>
            </div>
          </div>
        ) : (
          /* Rendered Votes List */
          filteredVotes.map((item) => {
            const isGo = item.vote === 'go'
            const photoUrl = item.image_urls?.[0] || '/images/placeholder.png'
            const price = formatPriceLevel(item.price_level)

            return (
              <div
                key={item.option_id}
                className="group flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border border-border/70 bg-card hover:bg-muted/30 transition-colors shadow-xs"
              >
                {/* Thumbnail */}
                <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/40">
                  <Image
                    src={photoUrl}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/images/placeholder.png'
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 leading-snug">
                    {item.title}
                  </h4>

                  {/* Rating & Price */}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                    {item.rating != null && (
                      <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {item.rating.toFixed(1)}
                      </span>
                    )}

                    {price && (
                      <span className="font-semibold text-foreground/80 tracking-wider">
                        {price}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  {item.address && (
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 shrink-0 text-pink-500/80" />
                      <span className="truncate">{item.address}</span>
                    </p>
                  )}
                </div>

                {/* Vote Decision Pill */}
                <div className="shrink-0 flex items-center pl-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-xl border flex items-center gap-1 shadow-2xs',
                      isGo
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    )}
                    aria-label={`Voted ${isGo ? 'GO' : 'PASS'}`}
                  >
                    {isGo ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-3" />
                        <span>GO</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>PASS</span>
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
