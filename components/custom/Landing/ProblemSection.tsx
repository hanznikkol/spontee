"use client"

import { Clock, ArrowDown, HelpCircle, Volume2, AlertCircle } from "lucide-react"
import { PROBLEM_QUOTES } from "@/lib/landing/text-metadata"

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-20 sm:py-28 overflow-hidden bg-muted/20 border-y border-border/40">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-pink-500/5 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm shadow-xs">
            <AlertCircle className="h-3.5 w-3.5 text-pink-500" />
            The Anatomy of Group Indecision
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Everyone has an opinion.
            <br />
            <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Nobody wants to decide.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            It starts with an innocent question: &ldquo;Where should we eat?&rdquo; Thirty minutes
            later, everyone is starving, frustrated, and stuck in an endless loop of &ldquo;ikaw
            bahala&rdquo;.
          </p>
        </div>

        {/* INTERACTIVE GROUP CHAT VISUAL + THE 3 PITFALLS */}
        <div className="grid gap-8 lg:grid-cols-12 items-center max-w-6xl mx-auto">
          {/* LEFT: REALISTIC GROUP CHAT DIALOGUE MOCKUP */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="rounded-3xl border border-border/80 bg-background/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-3.5 relative">
              {/* CHAT HEADER */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex -space-x-2 shrink-0">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/20 text-pink-600 text-xs font-bold ring-2 ring-background">
                      M
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 text-xs font-bold ring-2 ring-background">
                      L
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-purple-600 text-xs font-bold ring-2 ring-background">
                      C
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-foreground truncate">Barkada Weekend Hangout</h3>
                    <p className="text-[10px] text-muted-foreground truncate">4 members · Active now</p>
                  </div>
                </div>
                <span className="rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" /> 26 mins wasted
                </span>
              </div>

              {/* CHAT BUBBLES */}
              <div className="space-y-2.5 pt-1">
                {PROBLEM_QUOTES.map((quote, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      quote.isHost ? "items-start" : "items-end"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 px-1 pb-0.5 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground/80">{quote.author}</span>
                      <span>{quote.time}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        quote.isHost
                          ? "rounded-tl-xs bg-muted/80 text-foreground border border-border/40"
                          : "rounded-tr-xs bg-linear-to-br from-pink-500/15 via-purple-500/10 to-blue-500/15 text-foreground border border-pink-500/20"
                      }`}
                    >
                      {quote.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER CALLOUT */}
              <div className="pt-2 text-center text-[11px] text-muted-foreground italic border-t border-border/40">
                Sounds familiar? You shouldn&apos;t need a 30-minute debate to grab dinner.
              </div>
            </div>
          </div>

          {/* RIGHT: THE 3 CORE PITFALLS */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="group rounded-3xl border border-border/70 bg-card/60 p-4 sm:p-6 backdrop-blur-md transition hover:border-pink-500/40 hover:bg-card/90 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 ring-1 ring-pink-500/20">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    The &ldquo;Kahit Saan&rdquo; Deflection
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Nobody wants to propose a place because nobody wants to take the blame if it
                    falls short. So everyone pretends they don&apos;t care, while secretly hoping someone
                    else picks what they crave.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-3xl border border-border/70 bg-card/60 p-4 sm:p-6 backdrop-blur-md transition hover:border-purple-500/40 hover:bg-card/90 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    The Group Chat Black Hole
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Three food links sent. Two people haven&apos;t seen them. One person vetoes burgers.
                    Suddenly it&apos;s 1:30 PM, your energy is drained, and the group ends up at the
                    same boring fallback spot.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-3xl border border-border/70 bg-card/60 p-4 sm:p-6 backdrop-blur-md transition hover:border-blue-500/40 hover:bg-card/90 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Loudest Voice Bias
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    In vocal groups, the most vocal or stubborn person decides by default. Quiet
                    members compromise every weekend. Spontee gives every single participant an
                    equal, anonymous vote.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRANSITION BRIDGE TO SOLUTION */}
        <div className="mt-14 pt-8 text-center max-w-xl mx-auto flex flex-col items-center gap-2">
          <div className="h-8 w-px bg-linear-to-b from-transparent via-pink-500 to-purple-500" />
          <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            The Spontee Solution
          </p>
          <p className="text-lg font-bold text-foreground">
            Stop asking. Start voting individually.
          </p>
          <ArrowDown className="h-4 w-4 text-pink-500 animate-bounce mt-1" />
        </div>
      </div>
    </section>
  )
}
