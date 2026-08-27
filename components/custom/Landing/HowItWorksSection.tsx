"use client"

import { Users, SlidersHorizontal, Layers, Trophy, Check } from "lucide-react"
import { HOW_IT_WORKS_STEPS } from "@/lib/landing/text-metadata"

export default function HowItWorksSection() {
  const stepIcons = [Users, SlidersHorizontal, Layers, Trophy]

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm shadow-xs">
            <Check className="h-3.5 w-3.5 text-pink-500" />
            Simple 4-Step Flow
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            How Spontee works
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            From setup to the final recommendation in less than two minutes.
          </p>
        </div>

        {/* 4-STEP GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {HOW_IT_WORKS_STEPS.map((step, idx) => {
            const Icon = stepIcons[idx]
            return (
              <div
                key={step.number}
                className="group relative flex flex-col justify-between rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-pink-500/40 hover:bg-card/90 hover:shadow-xl"
              >
                <div className="space-y-4">
                  {/* TOP ROW: ICON + STEP NUMBER */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-pink-500/15 to-purple-500/15 text-pink-500 ring-1 ring-pink-500/20 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xl font-extrabold text-muted-foreground/30 group-hover:text-pink-500/60 transition">
                      {step.number}
                    </span>
                  </div>

                  {/* TITLE & TAGLINE */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold tracking-tight text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs font-semibold text-pink-500 dark:text-pink-400">
                      {step.tagline}
                    </p>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* BOTTOM HIGHLIGHT BADGE */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/80">
                    <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    {step.highlight}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
