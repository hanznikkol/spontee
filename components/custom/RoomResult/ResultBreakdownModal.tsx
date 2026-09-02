'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Trophy,
  Star,
  MapPin,
  ExternalLink,
  ChevronLeft,
  X,
  Sparkles,
  BarChart3,
  ChevronRight,
} from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { OptionVoteTally, ResultType } from '@/lib/room/result/result.types'
import { cn } from '@/lib/utils'

interface ResultBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  tally: OptionVoteTally[]
  resultType: ResultType
  participantCount: number
  winnerGoCount: number
  initialSelectedOption?: OptionVoteTally | null
  initialMode?: 'list' | 'detail'
}

function formatPriceLevel(level?: number | null) {
  if (!level) return ''
  return '₱'.repeat(level)
}

export default function ResultBreakdownModal({
  isOpen,
  onClose,
  tally,
  participantCount,
  initialSelectedOption = null,
  initialMode = 'list',
}: ResultBreakdownModalProps) {
  const [internalOption, setInternalOption] = useState<OptionVoteTally | null>(null)
  const [internalMode, setInternalMode] = useState<'list' | 'detail' | null>(null)
  const [openedFromList, setOpenedFromList] = useState(false)

  if (!isOpen) return null

  const mode = internalMode ?? (initialSelectedOption ? 'detail' : initialMode)
  const selectedOption = internalOption ?? initialSelectedOption

  const handleSelectFromList = (item: OptionVoteTally) => {
    setInternalOption(item)
    setInternalMode('detail')
    setOpenedFromList(true)
  }

  const handleBackToList = () => {
    setInternalOption(null)
    setInternalMode('list')
    setOpenedFromList(false)
  }

  const handleClose = () => {
    setInternalOption(null)
    setInternalMode(null)
    setOpenedFromList(false)
    onClose()
  }

  // Calculate rank index
  const selectedRank = selectedOption
    ? tally.findIndex((item) => item.optionId === selectedOption.optionId) + 1
    : 0

  const selectedGoPercent =
    selectedOption && participantCount > 0
      ? Math.round((selectedOption.goCount / participantCount) * 100)
      : 0

  const mapsUrl = selectedOption
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        selectedOption.title + (selectedOption.address ? ` ${selectedOption.address}` : '')
      )}`
    : ''

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        
        {/* Responsive Container: Bottom Sheet on Mobile, Centered Modal on Desktop */}
        <DialogPrimitive.Content
          aria-describedby="result-breakdown-description"
          className={cn(
            'fixed z-50 flex flex-col bg-card text-card-foreground border border-border/80 shadow-2xl outline-none duration-200 overflow-hidden',
            // Mobile: Bottom Sheet
            'bottom-0 inset-x-0 w-full max-h-[88dvh] rounded-t-3xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-6',
            // Tablet & Desktop: Centered Dialog
            'sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:max-w-lg sm:max-h-[85dvh] sm:rounded-3xl sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95'
          )}
        >
          {/* Mobile Sheet Drag Handle */}
          <div className="shrink-0 sm:hidden flex items-center justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Modal Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border/60">
            <div className="flex items-center gap-2">
              {mode === 'detail' && openedFromList && (
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="p-1 -ml-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Back to all results"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <DialogPrimitive.Title className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  {mode === 'list' ? (
                    <>
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span>Result Breakdown</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>{selectedOption?.isWinner ? 'Winning Pick' : 'Alternative Pick'}</span>
                    </>
                  )}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description
                  id="result-breakdown-description"
                  className="text-[11px] sm:text-xs text-muted-foreground"
                >
                  {mode === 'list'
                    ? `${tally.length} options evaluated by ${participantCount} participant${participantCount === 1 ? '' : 's'}`
                    : `Rank #${selectedRank} in your group session`}
                </DialogPrimitive.Description>
              </div>
            </div>

            <DialogPrimitive.Close
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Close"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Modal Body */}
          <div className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-4">
            {mode === 'list' ? (
              /* LIST VIEW: Full Rankings */
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-0.5">
                  Group Ranking & Votes
                </p>

                <div className="space-y-2">
                  {tally.map((item, index) => {
                    const rank = index + 1
                    const goPercent =
                      participantCount > 0
                        ? Math.round((item.goCount / participantCount) * 100)
                        : 0

                    return (
                      <button
                        key={item.optionId}
                        type="button"
                        onClick={() => handleSelectFromList(item)}
                        className={`w-full flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                          item.isWinner
                            ? 'border-primary/40 bg-primary/5 hover:bg-primary/10 shadow-2xs'
                            : 'border-border/70 bg-muted/20 hover:bg-muted/50'
                        }`}
                      >
                        {/* Top Line: Rank, Title, Rating, Arrow */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                item.isWinner
                                  ? 'bg-primary text-primary-foreground shadow-2xs'
                                  : rank === 2
                                  ? 'bg-muted text-foreground'
                                  : rank === 3
                                  ? 'bg-muted text-foreground'
                                  : 'bg-muted text-muted-foreground text-[11px]'
                              }`}
                            >
                              {item.isWinner ? (
                                <Trophy className="h-3 w-3" />
                              ) : rank === 2 ? (
                                '🥈'
                              ) : rank === 3 ? (
                                '🥉'
                              ) : (
                                rank
                              )}
                            </span>

                            <span className="text-xs sm:text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </span>

                            {item.isWinner && (
                              <span className="hidden xs:inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                                Winner
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.rating != null && item.rating > 0 && (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-amber-500">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>{item.rating}</span>
                              </div>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>

                        {/* Bottom Line: Distribution Bar & Vote Counts */}
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
                              {goPercent}%
                            </span>
                          </div>

                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                            {goPercent > 0 && (
                              <div
                                className={`h-full rounded-full ${
                                  item.isWinner
                                    ? 'bg-linear-to-r from-pink-500 via-purple-500 to-blue-500'
                                    : 'bg-primary/70'
                                }`}
                                style={{ width: `${goPercent}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : selectedOption ? (
              /* DETAIL VIEW: Alternative Details */
              <div className="space-y-4">
                {/* Place Thumbnail / Banner if available */}
                {selectedOption.imageUrl && (
                  <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-border/80 bg-muted">
                    <Image
                      src={selectedOption.imageUrl}
                      alt={selectedOption.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs border border-white/20">
                        {selectedRank === 1 ? '🥇 #1 Choice' : selectedRank === 2 ? '🥈 #2 Choice' : selectedRank === 3 ? '🥉 #3 Choice' : `#${selectedRank} Choice`}
                      </span>
                      {selectedOption.rating != null && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {selectedOption.rating}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Title & Metadata */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {selectedOption.isWinner ? 'Group Recommendation' : `Alternative #${selectedRank}`}
                    </span>
                    {selectedOption.priceLevel != null && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatPriceLevel(selectedOption.priceLevel)}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                    {selectedOption.title}
                  </h4>
                  {selectedOption.address && (
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-500 mt-0.5" />
                      <span>{selectedOption.address}</span>
                    </p>
                  )}
                </div>

                {/* Why it's a strong alternative callout */}
                <div className="p-3.5 rounded-xl sm:rounded-2xl border border-border/80 bg-muted/30 backdrop-blur-xs space-y-1.5">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Why consider this place?</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedOption.isWinner
                      ? `This place received ${selectedOption.goCount} "Go" votes (${selectedGoPercent}% approval), winning your group's decision.`
                      : selectedOption.goCount > 0
                      ? `Received ${selectedOption.goCount} "Go" votes from your group of ${participantCount} voters (${selectedGoPercent}% agreement). A great alternative if your group wants another option!`
                      : `Evaluated during your session as option #${selectedRank}.`}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button asChild className="w-full h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-xs cursor-pointer">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>

                  {openedFromList ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToList}
                      className="w-full h-10 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Back to all options
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="w-full h-10 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
