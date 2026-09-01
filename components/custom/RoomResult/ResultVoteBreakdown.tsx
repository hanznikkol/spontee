'use client'

import { BarChart3, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OptionVoteTally, ResultType } from '@/lib/room/result/result.types'

interface ResultVoteBreakdownProps {
  tally: OptionVoteTally[]
  resultType: ResultType
  participantCount: number
  winnerGoCount: number
  onSelectAlternative: (item: OptionVoteTally) => void
  onOpenFullBreakdown: () => void
}

export default function ResultVoteBreakdown({
  tally,
  participantCount,
  winnerGoCount,
  onSelectAlternative,
  onOpenFullBreakdown,
}: ResultVoteBreakdownProps) {
  if (!tally || tally.length === 0) return null

  // Extract up to 2 runner-up alternatives
  const topAlternatives = tally.filter((item) => !item.isWinner).slice(0, 2)

  return (
    <Card className="w-full rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-lg overflow-hidden">
      {/* Header: Compact Vote Summary */}
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight">
                Group Vote Summary
              </CardTitle>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {winnerGoCount} of {participantCount} voters chose the top recommendation
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {participantCount > 0 ? Math.round((winnerGoCount / participantCount) * 100) : 0}% Agreement
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {/* Top Alternatives (Max 2 displayed on main page) */}
        {topAlternatives.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Other Strong Picks
              </p>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                Tap to view details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topAlternatives.map((alt, index) => (
                <button
                  key={alt.optionId}
                  type="button"
                  onClick={() => onSelectAlternative(alt)}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all text-left group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm font-bold shrink-0 border border-border/60">
                      {index === 0 ? '🥈' : '🥉'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                        {alt.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {alt.goCount} Go votes
                        {alt.rating ? ` · ★ ${alt.rating}` : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View All Results Button (Progressive Disclosure Trigger) */}
        {tally.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenFullBreakdown}
            className="w-full h-10 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center justify-center gap-1.5 cursor-pointer border-dashed border-border/80"
          >
            <span>View all {tally.length} results & rankings</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
