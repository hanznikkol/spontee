"use client"

import { Smartphone, GitMerge, Trophy, CheckCircle, ArrowRight } from "lucide-react"

export default function SolutionSection() {
  const steps = [
    {
      step: "01",
      icon: Smartphone,
      title: "Everyone votes independently",
      tagline: "No peer pressure, no hesitation",
      description:
        "Each person swipes on their own phone without knowing what friends picked. Quiet friends get an equal voice. The loudest person can't dominate.",
      badge: "Private Ballots",
      accent: "from-pink-500/20 to-pink-500/5",
      iconBg: "bg-pink-500/10 text-pink-500 ring-pink-500/20",
    },
    {
      step: "02",
      icon: GitMerge,
      title: "Spontee compares the choices",
      tagline: "Real-time algorithmic scoring",
      description:
        "The instant everyone finishes, Spontee cross-references ballots. It checks for a unanimous Consensus, or calculates the highest-satisfaction Compromise.",
      badge: "Smart Matching",
      accent: "from-purple-500/20 to-purple-500/5",
      iconBg: "bg-purple-500/10 text-purple-500 ring-purple-500/20",
    },
    {
      step: "03",
      icon: Trophy,
      title: "The group gets a recommendation",
      tagline: "One winner. Zero second-guessing",
      description:
        "The debate terminates immediately. Everyone sees the crowned winner with star rating, price tier, address, and Google Maps directions.",
      badge: "Instant Decision",
      accent: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
    },
  ]

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm shadow-xs">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            The Spontee Principle
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            How Spontee replaces
            <br />
            <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              endless debates
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            One shared room. Private individual votes. One mathematically fair group recommendation.
          </p>
        </div>

        {/* 3 STEPS GRID */}
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {steps.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-border/70 bg-card/60 p-5 sm:p-6 lg:p-8 backdrop-blur-md transition-all duration-300 hover:border-border hover:bg-card/90 hover:shadow-xl"
              >
                {/* Subtle top accent gradient */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-3xl bg-linear-to-b ${item.accent} opacity-40 transition group-hover:opacity-80`}
                />

                <div className="relative space-y-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${item.iconBg}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-muted-foreground/30 group-hover:text-muted-foreground/60 transition">
                      {item.step}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {item.badge}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-pink-500 dark:text-pink-400">
                      {item.tagline}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="relative pt-6 mt-6 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-foreground/80">
                  <span>Seamless flow</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
