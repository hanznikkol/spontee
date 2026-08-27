"use client"

import {
  Flame,
  Trophy,
  MapPin,
  Zap,
  Users,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 sm:py-28 overflow-hidden bg-muted/20 border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-pink-500" />
            Product Capabilities
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Engineered for fast,
            <br />
            <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              frictionless consensus
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Built specifically to solve group indecision with modern web ergonomics and live
            synchronization.
          </p>
        </div>

        {/* BENTO GRID (VISUALLY DISTINCT COMPOSITIONS) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* 1. TACTILE SWIPE VOTING (WIDE 2-COL) */}
          <div className="group relative lg:col-span-2 rounded-3xl border border-border/70 bg-card/70 p-7 sm:p-8 backdrop-blur-md transition-all hover:border-pink-500/40 hover:bg-card/95 hover:shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold px-3 py-1 ring-1 ring-pink-500/20">
                  Tactile Ergonomics
                </span>
                <Flame className="h-5 w-5 text-pink-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Swipe-Based Voting Experience
                </h3>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Frictionless gesture mechanics with physics-based card rotation. Swipe right to
                  approve or left to pass. Full support for drag gestures, one-tap buttons, and
                  desktop keyboard arrows.
                </p>
              </div>
            </div>

            {/* VISUAL MICRO-MOCKUP: SWIPE CONTROLS */}
            <div className="mt-8 pt-6 border-t border-border/40 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-red-500">Swipe Left</span>
                  <p className="text-[11px] text-muted-foreground">&ldquo;Pass!&rdquo; on this place</p>
                </div>
                <span className="rounded-xl bg-red-500/10 text-red-500 p-2 font-mono text-xs font-bold">
                  ←
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-emerald-500">Swipe Right</span>
                  <p className="text-[11px] text-muted-foreground">&ldquo;Go!&rdquo; I&apos;m down</p>
                </div>
                <span className="rounded-xl bg-emerald-500/10 text-emerald-500 p-2 font-mono text-xs font-bold">
                  →
                </span>
              </div>
            </div>
          </div>

          {/* 2. CONSENSUS & COMPROMISE (1-COL) */}
          <div className="group relative lg:col-span-1 rounded-3xl border border-border/70 bg-card/70 p-7 sm:p-8 backdrop-blur-md transition-all hover:border-amber-500/40 hover:bg-card/95 hover:shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold px-3 py-1 ring-1 ring-amber-500/20">
                  Decision Algorithm
                </span>
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Consensus & Compromise
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If everyone loves one spot, it wins with 100% consensus. If opinions differ,
                  Spontee computes the highest group satisfaction rating to prevent deadlocks.
                </p>
              </div>
            </div>

            {/* MINI VISUAL TAGS */}
            <div className="mt-6 pt-4 border-t border-border/40 space-y-2">
              <div className="flex items-center justify-between text-xs bg-muted/60 rounded-xl px-3 py-2">
                <span className="font-semibold text-foreground">Consensus Match</span>
                <span className="text-emerald-500 font-bold">100% Unanimous</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-muted/60 rounded-xl px-3 py-2">
                <span className="font-semibold text-foreground">Best Compromise</span>
                <span className="text-pink-500 font-bold">Highest Net Score</span>
              </div>
            </div>
          </div>

          {/* 3. PREFERENCE-DRIVEN OPTIONS (1-COL) */}
          <div className="group relative lg:col-span-1 rounded-3xl border border-border/70 bg-card/70 p-7 sm:p-8 backdrop-blur-md transition-all hover:border-blue-500/40 hover:bg-card/95 hover:shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1 ring-1 ring-blue-500/20">
                  Location & Filters
                </span>
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Preference-Driven
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Curate choices based on your current craving, budget tier (₱ to ₱₱₱₱), and custom
                  distance radius (500m to 10km) using live Google Places data.
                </p>
              </div>
            </div>

            {/* CATEGORY CHIPS */}
            <div className="mt-6 pt-4 border-t border-border/40 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium">🍔 Food</span>
              <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium">☕ Coffee</span>
              <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium">🎳 Entertainment</span>
              <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium">🍰 Dessert</span>
            </div>
          </div>

          {/* 4. REALTIME PARTICIPANT PROGRESS (WIDE 2-COL) */}
          <div className="group relative lg:col-span-2 rounded-3xl border border-border/70 bg-card/70 p-7 sm:p-8 backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-card/95 hover:shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1 ring-1 ring-emerald-500/20">
                  Supabase Realtime
                </span>
                <Zap className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Real-time Participant Progress
                </h3>
                <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                  Supabase Postgres Changes power live room synchronization. See participants enter
                  the lobby, track live swiping completion, and unveil the winning recommendation
                  simultaneously on everyone&apos;s phone.
                </p>
              </div>
            </div>

            {/* PARTICIPANT LIVE TRACKER PREVIEW */}
            <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full bg-pink-500/20 text-pink-600 font-bold flex items-center justify-center ring-2 ring-background text-[11px]">
                    H
                  </div>
                  <div className="h-7 w-7 rounded-full bg-blue-500/20 text-blue-600 font-bold flex items-center justify-center ring-2 ring-background text-[11px]">
                    M
                  </div>
                  <div className="h-7 w-7 rounded-full bg-purple-500/20 text-purple-600 font-bold flex items-center justify-center ring-2 ring-background text-[11px]">
                    K
                  </div>
                </div>
                <span className="font-medium text-foreground">3 Friends Synchronized</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 font-mono font-semibold text-[11px] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Subscriptions Active
              </span>
            </div>
          </div>

          {/* 5. ZERO FRICTION ANONYMOUS AUTH (1-COL) */}
          <div className="group relative lg:col-span-1 rounded-3xl border border-border/70 bg-card/70 p-7 sm:p-8 backdrop-blur-md transition-all hover:border-purple-500/40 hover:bg-card/95 hover:shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold px-3 py-1 ring-1 ring-purple-500/20">
                  Instant Access
                </span>
                <Users className="h-5 w-5 text-purple-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Zero-Friction Entry
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No passwords, no confirmation emails, no account fatigue. Just enter your name
                  and enter the room with a unique Supabase anonymous identity.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>Code format:</span>
              <span className="font-mono font-bold text-foreground">XXXX-XXXX</span>
            </div>
          </div>

          {/* 6. SMART LOCAL SESSION RESILIENCE (WIDE 2-COL) */}
          <div className="group relative lg:col-span-2 rounded-3xl border border-border/70 bg-card/70 p-7 sm:p-8 backdrop-blur-md transition-all hover:border-rose-500/40 hover:bg-card/95 hover:shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold px-3 py-1 ring-1 ring-rose-500/20">
                  Reliability
                </span>
                <ShieldCheck className="h-5 w-5 text-rose-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Smart Session Persistence
                </h3>
                <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                  Accidentally closed your phone&apos;s mobile browser tab or refreshed while waiting?
                  Spontee preserves your active room session in local storage so you resume your
                  active room without losing your place.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>Resilient state management:</span>
              <span className="font-semibold text-foreground">Zustand + Local Persistence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}