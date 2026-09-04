"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Users,
  MapPin,
  Star,
  Check,
  X,
  CheckCircle2,
  MessageCircleOff,
} from "lucide-react"

export default function HeroSection() {
  // Demo card interactive motion
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-160, 160], [-12, 12])
  const opacityPass = useTransform(x, [-120, -40, 0], [1, 0.4, 0])
  const opacityGo = useTransform(x, [0, 40, 120], [0, 0.4, 1])

  // Automated convergence cycle simulation
  const [convergeStep, setConvergeStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setConvergeStep((prev) => (prev + 1) % 4)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 lg:pt-16 lg:pb-28 overflow-hidden">
      {/* Soft ambient background glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-150 h-87.5 bg-linear-to-tr from-pink-500/20 via-purple-500/15 to-blue-500/20 blur-3xl rounded-full -z-10 opacity-70" />
      <div className="pointer-events-none absolute top-1/2 -right-48 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -z-10" />
      <div className="pointer-events-none absolute bottom-0 -left-48 w-96 h-96 bg-pink-500/10 blur-3xl rounded-full -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: PRODUCT VALUE PROPOSITION */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8">
            {/* BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-pink-500/20 bg-pink-500/5 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs md:text-sm font-medium text-pink-600 dark:text-pink-400 backdrop-blur-md shadow-xs text-center"
            >
             <MessageCircleOff className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                <span>Skip the group-chat debate</span>
                <span className="h-1 w-1 rounded-full bg-pink-500/60 shrink-0" />
                <span>The Group Decision Engine</span>
            </motion.div>

            {/* HEADLINE */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2 max-w-2xl"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
                Stop arguing.
                <br />
                <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Start swiping.
                </span>
              </h1>
            </motion.div>

            {/* SUPPORTING TEXT */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Everyone votes individually on their own phone without endless debates or awkward{" "}
              <span className="italic font-medium text-foreground">&ldquo;kahit saan&rdquo;</span>. Spontee
              turns individual swipes into one group recommendation everyone agrees on.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
            >
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Link href="/create/host">
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
            </motion.div>

            {/* TRUST SIGNALS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 sm:gap-6 pt-2 border-t border-border/50 w-full max-w-lg text-xs sm:text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>No sign up</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Real nearby spots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Private ballots</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: THE SWIPE & CONVERGENCE SHOWCASE */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
            {/* Visual demo container */}
            <div className="relative w-full max-w-90 sm:max-w-97.5 flex flex-col items-center justify-center mx-auto">
              <div className="relative w-full aspect-9/12 flex flex-col items-center justify-center">
                {/* SWIPE AFFORDANCE LABELS */}
              <div className="absolute -top-7 left-0 right-0 flex items-center justify-between px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase pointer-events-none select-none z-20">
                <span className="flex items-center gap-1 text-red-500/80">
                  <X className="h-3.5 w-3.5" />
                  Pass (Left)
                </span>
                <span className="flex items-center gap-1 text-emerald-500/90">
                  Choose (Right)
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* STACKED CARD DECK (BACKGROUND CARDS FOR DEPTH) */}
              <div className="absolute inset-x-5 inset-y-2 bg-muted/40 rounded-[28px] border border-border/40 scale-90 translate-y-6 opacity-40 shadow-md" />
              <div className="absolute inset-x-2 inset-y-1 bg-muted/60 rounded-[28px] border border-border/60 scale-95 translate-y-3 opacity-70 shadow-lg" />

              {/* MAIN INTERACTIVE SWIPE CARD */}
              <motion.div
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                whileHover={{ scale: 1.01 }}
                whileTap={{ cursor: "grabbing" }}
                className="relative w-full h-full rounded-[28px] overflow-hidden border border-white/20 shadow-2xl bg-card cursor-grab select-none z-10"
              >
                {/* Real place photo */}
                <Image
                  src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop"
                  alt="Mendokoro Ramenba"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover pointer-events-none"
                />

                {/* Dark gradient overlay matching real Spontee voting UI */}
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                {/* PASS! STAMP OVERLAY */}
                <motion.div
                  style={{ opacity: opacityPass }}
                  className="absolute top-6 right-6 pointer-events-none z-30"
                >
                  <span className="text-red-500 font-black text-2xl tracking-widest border-[3px] border-red-500 px-3 py-1 rounded-xl rotate-12 inline-block uppercase bg-black/40 backdrop-blur-xs">
                    Pass!
                  </span>
                </motion.div>

                {/* GO! STAMP OVERLAY */}
                <motion.div
                  style={{ opacity: opacityGo }}
                  className="absolute top-6 left-6 pointer-events-none z-30"
                >
                  <span className="text-emerald-400 font-black text-2xl tracking-widest border-[3px] border-emerald-400 px-3 py-1 rounded-xl -rotate-12 inline-block uppercase bg-black/40 backdrop-blur-xs">
                    Go!
                  </span>
                </motion.div>

                {/* TOP HEADER: ROOM CODE PILL */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
                  <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10">
                    Room: <strong>SPON-4820</strong>
                  </span>
                  <span className="rounded-full bg-pink-500/80 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                    Option 1 of 5
                  </span>
                </div>

                {/* BOTTOM CARD DETAILS */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white pointer-events-none z-20 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md">
                      🍜 Ramen
                    </span>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md">
                      ₱₱₱
                    </span>
                    <span className="rounded-full bg-amber-400/20 text-amber-300 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      4.9 (1.4k)
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                    Mendokoro Ramenba
                  </h2>

                  <p className="flex items-center gap-1.5 text-xs text-white/80">
                    <MapPin className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                    Bonifacio Global City, Taguig · 1.2 km away
                  </p>
                </div>
              </motion.div>
            </div>

            {/* CONVERGING PARTICIPANTS TICKER BELOW CARD */}
            <div className="w-full mt-4 bg-background/85 backdrop-blur-xl border border-border/70 rounded-2xl p-3 shadow-lg z-20">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-pink-500" />
                    Group Voting
                </span>

                <span className="text-[11px] font-mono font-medium text-pink-500">
                    {convergeStep >= 2
                    ? "Everyone finished!"
                    : "Voting in progress..."}
                </span>
                </div>

                {/* VOTING STATUS */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs py-0.5">
                        <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-300 font-bold flex items-center justify-center text-[10px]">
                            M
                        </div>
                        <span className="font-medium text-foreground">
                            Maya (Host)
                        </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" />
                        Finished
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-0.5">
                        <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                            L
                        </div>
                        <span className="font-medium text-foreground">
                            Liam
                        </span>
                        </div>

                        {convergeStep >= 1 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-in fade-in zoom-in duration-200">
                            <Check className="h-3 w-3" />
                            Finished
                        </span>
                        ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                            Voting...
                        </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs py-0.5">
                        <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center text-[10px]">
                            Y
                        </div>
                        <span className="font-medium text-foreground">
                            You
                        </span>
                        </div>

                        {convergeStep >= 2 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-in fade-in zoom-in duration-200">
                            <Check className="h-3 w-3" />
                            Finished
                        </span>
                        ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                            Voting...
                        </span>
                        )}
                    </div>
                </div>

                {/* FINAL RESULT BANNER */}
                <AnimatePresence>
                    {convergeStep >= 2 && (
                        <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="pt-2 border-t border-border/50 text-center"
                        >
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 w-full justify-center text-center">
                            <span>🎉 Everyone finished — finding your match...</span>
                        </div>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}