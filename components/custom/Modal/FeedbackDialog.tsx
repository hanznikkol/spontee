"use client"

import { useState } from "react"
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
import { MessageSquare, Send, CheckCircle2 } from "lucide-react"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    // Pre-fill mailto link as fallback or primary submission
    const subject = encodeURIComponent("Spontee App Feedback")
    const body = encodeURIComponent(feedback.trim())
    const mailto = `mailto:hanznikkolmaas@gmail.com?subject=${subject}&body=${body}`

    // Trigger submission state
    setSubmitted(true)
    setTimeout(() => {
      window.open(mailto, "_blank")
    }, 400)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSubmitted(false)
      setFeedback("")
    }, 300)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-3xl p-6 sm:p-7 border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl">
        <AlertDialogHeader className="space-y-2 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 ring-1 ring-pink-500/20">
            <MessageSquare className="h-5 w-5" />
          </div>
          <AlertDialogTitle className="text-xl font-bold tracking-tight">
            We value your feedback
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Have an idea for Spontee, spotted an issue, or want to say hi? Let the developer know!
          </AlertDialogDescription>
        </AlertDialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold">Thank you for helping us improve!</h4>
            <p className="text-xs text-muted-foreground">
              Your feedback client has opened. If it didn&apos;t open automatically, you can email us directly at{" "}
              <a
                href="mailto:hanznikkolmaas@gmail.com"
                className="font-medium text-primary hover:underline"
              >
                hanznikkolmaas@gmail.com
              </a>.
            </p>
            <Button
              className="mt-4 w-full rounded-xl"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="feedback-input" className="text-xs font-medium text-muted-foreground">
                Your thoughts or bug report
              </label>
              <textarea
                id="feedback-input"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you like? What can be better? What feature would save your next hangout?"
                className="w-full resize-none rounded-2xl border border-input bg-background/50 p-3.5 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition"
                required
              />
            </div>

            <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
              <AlertDialogCancel
                type="button"
                onClick={handleClose}
                className="rounded-xl border-border/80 hover:bg-muted/60"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={!feedback.trim()}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-md shadow-pink-500/20 hover:opacity-95 transition"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Feedback
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
