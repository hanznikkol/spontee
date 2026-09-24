"use client"

import { useState, useSyncExternalStore } from "react"
import { ThumbsUp, ThumbsDown, Smile, Send, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SessionHelpfulResponse } from "@/lib/feedback/types/feedback.types"
import { submitFeedback } from "@/lib/feedback/services/feedback.service"
import { cn } from "@/lib/utils"

interface ResultSessionFeedbackProps {
  roomId: string
  roomCode: string
  userName?: string
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function useStoredFeedbackStatus(key: string): boolean {
  return useSyncExternalStore(
    subscribeStorage,
    () => {
      try {
        return typeof window !== "undefined" && Boolean(localStorage.getItem(key))
      } catch {
        return false
      }
    },
    () => false
  )
}

const RESPONSE_OPTIONS: Array<{
  key: SessionHelpfulResponse
  label: string
  rating: number
  icon: typeof ThumbsUp
  colorClass: string
  activeClass: string
}> = [
  {
    key: "yes",
    label: "Yes",
    rating: 5,
    icon: ThumbsUp,
    colorClass: "text-emerald-500",
    activeClass: "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs",
  },
  {
    key: "a_little",
    label: "A little",
    rating: 3,
    icon: Smile,
    colorClass: "text-amber-500",
    activeClass: "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold shadow-xs",
  },
  {
    key: "not_really",
    label: "Not really",
    rating: 1,
    icon: ThumbsDown,
    colorClass: "text-rose-500",
    activeClass: "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 font-semibold shadow-xs",
  },
]

export function ResultSessionFeedback({
  roomId,
  roomCode,
  userName,
}: ResultSessionFeedbackProps) {
  const [selectedResponse, setSelectedResponse] = useState<SessionHelpfulResponse | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Storage key to prevent repeatedly asking in the same room
  const storageKey = `spontee_session_feedback_${roomId || roomCode}`
  const isStoredDone = useStoredFeedbackStatus(storageKey)
  const isSubmitted = isStoredDone || justSubmitted

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedResponse || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    const optionConfig = RESPONSE_OPTIONS.find((opt) => opt.key === selectedResponse)
    const ratingValue = optionConfig ? optionConfig.rating : 3

    try {
      await submitFeedback({
        rating: ratingValue,
        source: "session",
        helpful_response: selectedResponse,
        room_code: roomCode || undefined,
        room_id: roomId || undefined,
        message: comment.trim() || undefined,
        user_name: userName?.trim() || undefined,
      })

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, "true")
        } catch {
          // ignore localStorage write errors
        }
      }
      setJustSubmitted(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send feedback. Please try again."
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If already submitted, show thank you note
  if (isSubmitted) {
    return (
      <div className="w-full rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-3.5 sm:p-4 text-center space-y-1 animate-in fade-in duration-300">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>Thank you for your feedback!</span>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          Your response helps make Spontee decisions smoother for everyone.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-all">
      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-bold tracking-tight text-foreground">
          Did Spontee help you decide?
        </h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          Tap an option to share a quick rating with us.
        </p>
      </div>

      {/* 3 OPTIONS */}
      <div className="grid grid-cols-3 gap-2">
        {RESPONSE_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = selectedResponse === opt.key

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSelectedResponse(opt.key)
                setError(null)
              }}
              className={cn(
                "h-10 sm:h-11 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer",
                isSelected
                  ? opt.activeClass
                  : "bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", opt.colorClass)} />
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* OPTIONAL EXPANDABLE COMMENT & SUBMIT BUTTON */}
      {selectedResponse && (
        <form onSubmit={handleSubmit} className="space-y-2.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <textarea
            rows={2}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any thoughts or suggestions? (optional)"
            className="w-full resize-none rounded-xl border border-input bg-background/60 p-2.5 text-xs sm:text-sm transition placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {error && (
            <p className="text-[11px] text-destructive leading-tight">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-0.5">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="h-8.5 px-3.5 rounded-xl text-xs font-semibold bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-xs hover:opacity-95 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
