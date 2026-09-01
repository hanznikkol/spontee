'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Sparkles,
  BarChart3,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OptionVoteTally, ResultType } from '@/lib/room/result/result.types'

const PREVIEW_LIMIT = 3

interface ResultVoteBreakdownProps {
  tally: OptionVoteTally[]
  resultType: ResultType
  participantCount: number
  winnerGoCount: number
}

export default function ResultVoteBreakdown({
  tally,
  resultType,
  participantCount,
  winnerGoCount,
}: ResultVoteBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!tally || tally.length === 0) return null

  const hasMore = tally.length > PREVIEW_LIMIT
  const displayedTally = isExpanded ? tally : tally.slice(0, PREVIEW_LIMIT)
  const hiddenCount = tally.length - PREVIEW_LIMIT

  return (
    <Card className="w-full rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-lg overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
                How Your Group Voted
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Anonymous vote tally across {participantCount} participant{participantCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {hasMore && (
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full hidden xs:inline-block">
              {isExpanded ? `All ${tally.length} shown` : `Top ${PREVIEW_LIMIT} of ${tally.length}`}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Decision Explanation Callout */}
        <div
          className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${
            resultType === 'consensus'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
              : 'border-purple-500/30 bg-purple-500/10 text-purple-950 dark:text-purple-100'
          }`}
        >
          <div
            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
              resultType === 'consensus'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
            }`}
          >
            {resultType === 'consensus' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs sm:text-sm font-semibold">
              {resultType === 'consensus'
                ? 'Unanimous Agreement'
                : 'Top Compromise Choice'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {resultType === 'consensus'
                ? `All ${participantCount} out of ${participantCount} participants voted "Go" on the top pick.`
                : `The winning pick received ${winnerGoCount} out of ${participantCount} "Go" votes, leading the group's decision.`}
            </p>
          </div>
        </div>

        {/* Tally Breakdown List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vote Distribution
            </p>
            {hasMore && (
              <p className="text-[11px] text-muted-foreground xs:hidden">
                {isExpanded ? `All ${tally.length}` : `Top ${PREVIEW_LIMIT} of ${tally.length}`}
              </p>
            )}
          </div>

          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {displayedTally.map((item, index) => {
                const rank = index + 1
                const goPercentage =
                  participantCount > 0
                    ? Math.round((item.goCount / participantCount) * 100)
                    : 0

                return (
                  <motion.li
                    key={item.optionId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, delay: index >= PREVIEW_LIMIT ? (index - PREVIEW_LIMIT) * 0.04 : 0 }}
                    className={`flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl border transition-all ${
                      item.isWinner
                        ? 'border-primary/40 bg-primary/5 shadow-xs ring-1 ring-primary/20'
                        : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                    }`}
                  >
                    {/* Top line: Rank, Title, Winner pill, Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Rank badge */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            item.isWinner
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.isWinner ? (
                            <Trophy className="h-3 w-3" />
                          ) : (
                            rank
                          )}
                        </span>

                        {/* Title */}
                        <span className="text-xs sm:text-sm font-semibold truncate text-foreground">
                          {item.title}
                        </span>

                        {/* Winner Badge */}
                        {item.isWinner && (
                          <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                            Winner
                          </span>
                        )}
                      </div>

                      {/* Rating / Meta */}
                      {item.rating != null && item.rating > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-500 shrink-0">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom line: Bar & Counts */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {item.goCount} Go
                          {item.passCount > 0 ? (
                            <span className="text-muted-foreground font-normal ml-1">
                              · {item.passCount} Pass
                            </span>
                          ) : null}
                        </span>
                        <span className="font-mono font-medium">
                          {goPercentage}%
                        </span>
                      </div>

                      {/* Proportional distribution bar */}
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                        {goPercentage > 0 && (
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              item.isWinner
                                ? 'bg-linear-to-r from-pink-500 via-purple-500 to-blue-500'
                                : 'bg-primary/70'
                            }`}
                            style={{ width: `${goPercentage}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>

          {/* View All / Show Less Toggle Button */}
          {hasMore && (
            <div className="pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-full h-10 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-dashed border-border/70"
              >
                {isExpanded ? (
                  <>
                    <span>Show top {PREVIEW_LIMIT} only</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>View all {tally.length} options (+{hiddenCount} more)</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

