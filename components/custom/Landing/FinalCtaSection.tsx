"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, ArrowRight, Zap, CheckCircle2 } from "lucide-react"

export default function FinalCtaSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Soft atmospheric backlight */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-r from-pink-500/20 via-purple-500/15 to-blue-500/20 blur-3xl rounded-full -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl rounded-[36px] border border-border/80 bg-linear-to-b from-card/80 to-card/40 p-8 sm:p-12 md:p-16 text-center backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Subtle ambient accent ring */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-linear-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30 blur-2xl rounded-full" />

          <div className="relative space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Your Next Hangout Starts Here</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground">
              Stop debating.
              <br />
              <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Let Spontee decide.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Skip the 40-minute group chat argument. Create a private room in 15 seconds, invite
              your group with a link or QR code, and let everyone swipe to the winning pick.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Link href="/create/host">
                  <Zap className="mr-2 h-5 w-5 fill-white" />
                  Create a Room
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-13 px-7 rounded-2xl border-border/80 bg-background/60 hover:bg-muted/70 text-base font-medium backdrop-blur-sm transition-all"
              >
                <Link href="/join">
                  <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                  Join with Code
                </Link>
              </Button>
            </div>

            {/* Micro guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Works on any mobile browser
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No app install needed
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
