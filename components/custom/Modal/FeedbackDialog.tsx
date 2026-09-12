"use client"

import { useState, useRef, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, CheckCircle2, Star, Loader2, AlertCircle } from "lucide-react"
import { submitFeedback } from "@/lib/feedback/services/feedback.service"
import { cn } from "@/lib/utils"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RATING_LABELS: Record<number, string> = {
  1: "Needs improvement",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Loved it!",
}

const MAX_MESSAGE_LENGTH = 500

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [userName, setUserName] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const starGroupRef = useRef<HTMLDivElement>(null)

  // Reset states when closed
  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSubmitted(false)
      setSubmitting(false)
      setRating(0)
      setHoverRating(0)
      setUserName("")
      setMessage("")
      setError(null)
    }, 300)
  }

  // Focus the first star on open if not submitted
  useEffect(() => {
    if (open && !submitted) {
      setError(null)
    }
  }, [open, submitted])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setRating((prev) => Math.min(5, (prev || 0) + 1))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setRating((prev) => Math.max(1, (prev || 2) - 1))
    } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
      e.preventDefault()
      setRating(parseInt(e.key, 10))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a star rating to help us understand your experience.")
      return
    }

    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await submitFeedback({
        rating,
        user_name: userName.trim() || undefined,
        message: message.trim(),
      })
      setSubmitted(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit feedback. Please try again."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const currentDisplayRating = hoverRating > 0 ? hoverRating : rating
  const ratingText = currentDisplayRating > 0 ? RATING_LABELS[currentDisplayRating] : "Tap a star to rate"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md flex flex-col rounded-3xl p-4 sm:p-5 border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <AlertDialogHeader className="shrink-0 space-y-1 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 ring-1 ring-pink-500/20">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold tracking-tight">
                We value your feedback
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Help us improve your group decision experience.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {submitted ? (
          <div className="py-4 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold tracking-tight">Thank you for your feedback!</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Your thoughts directly shape the future of Spontee. We truly appreciate you taking the time!
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-3.5 w-3.5",
                      s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 fill-transparent"
                    )}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold">{RATING_LABELS[rating]}</span>
            </div>

            <Button
              className="mt-2 w-full h-10 rounded-xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 pt-1">
            <div className="space-y-2.5">
              {/* STAR RATING INTERACTION */}
              <div className="space-y-1 text-center rounded-2xl border border-border/60 bg-muted/30 p-2.5 sm:p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  How would you rate your experience? <span className="text-destructive">*</span>
                </span>

                <div
                  ref={starGroupRef}
                  role="radiogroup"
                  aria-label="Rating out of 5 stars"
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl py-0.5"
                >
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled = starValue <= currentDisplayRating
                    const isSelected = starValue === rating

                    return (
                      <button
                        key={starValue}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${starValue} star${starValue > 1 ? "s" : ""} - ${RATING_LABELS[starValue]}`}
                        onClick={() => {
                          setRating(starValue)
                          setError(null)
                        }}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={cn(
                          "h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          "hover:scale-115 active:scale-95"
                        )}
                      >
                        <Star
                          className={cn(
                            "h-6 w-6 sm:h-6.5 sm:w-6.5 transition-all duration-150",
                            isFilled
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_6px_rgba(251,191,36,0.45)]"
                              : "text-muted-foreground/30 fill-transparent hover:text-amber-400/50"
                          )}
                        />
                      </button>
                    )
                  })}
                </div>

                <div className="h-4 flex items-center justify-center">
                  <span
                    className={cn(
                      "text-[11px] font-semibold transition-colors duration-150",
                      currentDisplayRating > 0 ? "text-foreground" : "text-muted-foreground/60 font-normal"
                    )}
                  >
                    {ratingText}
                  </span>
                </div>
              </div>

              {/* OPTIONAL NAME INPUT */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="feedback-name" className="text-[11px] font-medium text-muted-foreground">
                    Your Name <span className="text-muted-foreground/60">(optional)</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground/60">
                    Anonymous if blank
                  </span>
                </div>
                <Input
                  id="feedback-name"
                  type="text"
                  maxLength={50}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Alex (or leave blank)"
                  className="h-9 rounded-xl border border-input bg-background/50 px-3 text-xs sm:text-sm transition placeholder:text-muted-foreground/60 focus:outline-none focus:border-pink-500/80 focus:ring-2 focus:ring-pink-500/20 focus-visible:outline-none focus-visible:border-pink-500/80 focus-visible:ring-2 focus-visible:ring-pink-500/20"
                />
              </div>

              {/* MESSAGE TEXTAREA */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="feedback-input" className="text-[11px] font-medium text-muted-foreground">
                    Your thoughts or ideas <span className="text-muted-foreground/60">(optional)</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground/60 font-mono">
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
                <textarea
                  id="feedback-input"
                  rows={3}
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What did you like? What can be better?"
                  className="w-full h-20 resize-none rounded-xl border border-input bg-background/50 p-2.5 text-xs sm:text-sm transition placeholder:text-muted-foreground/60 focus:outline-none focus:border-pink-500/80 focus:ring-2 focus:ring-pink-500/20 focus-visible:outline-none focus-visible:border-pink-500/80 focus-visible:ring-2 focus-visible:ring-pink-500/20"
                />
              </div>

              {/* ERROR ALERT BANNER */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-3 py-2 text-xs flex items-start gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-destructive" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}
            </div>

            <AlertDialogFooter className="shrink-0 flex flex-row items-center justify-end gap-2 pt-2 border-t border-border/40">
              <AlertDialogCancel
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="h-9 rounded-xl border-border/80 hover:bg-muted/60 text-xs sm:text-sm px-3"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={rating === 0 || submitting}
                className="h-9 rounded-xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-pink-500/20 hover:opacity-95 active:scale-[0.98] transition px-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Send Feedback
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
