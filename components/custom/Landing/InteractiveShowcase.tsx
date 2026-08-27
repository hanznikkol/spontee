"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Star,
  MapPin,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Users,
  Trophy,
  ArrowRight,
} from "lucide-react"
import { DEMO_OPTIONS, DemoOption } from "@/lib/landing/text-metadata"

export default function InteractiveShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [userVotes, setUserVotes] = useState<Record<string, "go" | "pass">>({})
  const [activePartnerStatus, setActivePartnerStatus] = useState<string>("Maya and Liam are voting...")

  const isFinished = currentIndex >= DEMO_OPTIONS.length
  const currentOption: DemoOption | undefined = DEMO_OPTIONS[currentIndex]

  // Motion values for swipe drag
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacityPass = useTransform(x, [-140, -40, 0], [1, 0.4, 0])
  const opacityGo = useTransform(x, [0, 40, 140], [0, 0.4, 1])

  const handleSwipe = useCallback(
    (vote: "go" | "pass") => {
      if (isFinished || !currentOption) return
      setDirection(vote === "go" ? "right" : "left")
      setUserVotes((prev) => ({ ...prev, [currentOption.id]: vote }))

      // Update simulated live peer messages
      if (currentIndex === 0) {
        setActivePartnerStatus("Maya swiped Go! · Liam swiped Go!")
      } else if (currentIndex === 1) {
        setActivePartnerStatus("Maya swiped Go! · Liam swiped Pass!")
      }

      setCurrentIndex((prev) => prev + 1)
      x.set(0)
    },
    [isFinished, currentOption, currentIndex, x]
  )

  const handleRestart = () => {
    setCurrentIndex(0)
    setUserVotes({})
    setActivePartnerStatus("Maya and Liam are voting...")
    x.set(0)
  }

  // Keyboard navigation when user is hovering / focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return
      if (e.key === "ArrowLeft") {
        handleSwipe("pass")
      } else if (e.key === "ArrowRight") {
        handleSwipe("go")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSwipe, isFinished])

  return (
    <section id="demo" className="relative py-20 sm:py-28 overflow-hidden bg-muted/30 border-y border-border/40">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 blur-3xl rounded-full" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-xs font-semibold text-pink-600 dark:text-pink-400 backdrop-blur-sm shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Playground
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Try the Spontee voting deck
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Drag the card or click the buttons below. See how real-time swiping eliminates
            arguing and calculates the group winner.
          </p>
        </div>

        {/* SIMULATOR CONTAINER */}
        <div className="max-w-md mx-auto">
          <div className="rounded-[32px] border border-border/80 bg-background/95 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl">
            {/* SIMULATOR TOP BAR */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-foreground">Room: SPON-2026</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-pink-500" />
                <span>3 Participants</span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Group Voting Progress</span>
                <span className="font-mono text-foreground font-semibold">
                  {Math.min(currentIndex, DEMO_OPTIONS.length)} of {DEMO_OPTIONS.length}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-300"
                  style={{
                    width: `${(Math.min(currentIndex, DEMO_OPTIONS.length) / DEMO_OPTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* MAIN CARD VIEWPORT */}
            <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden bg-muted/40 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {!isFinished && currentOption ? (
                  <motion.div
                    key={currentOption.id}
                    style={{ x, rotate }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.65}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 90) handleSwipe("go")
                      else if (info.offset.x < -90) handleSwipe("pass")
                    }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      x: direction === "right" ? 320 : -320,
                      opacity: 0,
                      transition: { duration: 0.25 },
                    }}
                    whileTap={{ cursor: "grabbing" }}
                    className="absolute inset-0 rounded-[24px] overflow-hidden border border-white/20 shadow-xl cursor-grab select-none"
                  >
                    {/* OPTION IMAGE */}
                    <Image
                      src={currentOption.image}
                      alt={currentOption.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover pointer-events-none"
                    />

                    {/* GRADIENT OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                    {/* PASS STAMP */}
                    <motion.div
                      style={{ opacity: opacityPass }}
                      className="absolute top-5 right-5 pointer-events-none z-20"
                    >
                      <span className="text-red-500 font-black text-2xl tracking-widest border-[3px] border-red-500 px-3 py-1 rounded-xl rotate-12 inline-block uppercase bg-black/40 backdrop-blur-xs">
                        Pass!
                      </span>
                    </motion.div>

                    {/* GO STAMP */}
                    <motion.div
                      style={{ opacity: opacityGo }}
                      className="absolute top-5 left-5 pointer-events-none z-20"
                    >
                      <span className="text-emerald-400 font-black text-2xl tracking-widest border-[3px] border-emerald-400 px-3 py-1 rounded-xl -rotate-12 inline-block uppercase bg-black/40 backdrop-blur-xs">
                        Go!
                      </span>
                    </motion.div>

                    {/* TOP BADGE */}
                    <div className="absolute top-4 left-4 pointer-events-none z-10">
                      <span className="rounded-full bg-pink-500/90 text-white text-[11px] font-semibold px-2.5 py-0.5 backdrop-blur-md shadow-xs">
                        {currentOption.tag}
                      </span>
                    </div>

                    {/* BOTTOM DETAILS */}
                    <div className="absolute bottom-0 inset-x-0 p-5 text-white pointer-events-none z-10 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium backdrop-blur-md">
                          {currentOption.category}
                        </span>
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium backdrop-blur-md">
                          {"₱".repeat(currentOption.priceLevel)}
                        </span>
                        <span className="rounded-full bg-amber-400/20 text-amber-300 px-2.5 py-0.5 font-semibold backdrop-blur-md flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {currentOption.rating} ({currentOption.reviewsCount})
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold tracking-tight leading-snug">
                        {currentOption.title}
                      </h3>

                      <p className="text-xs text-white/80 line-clamp-1">
                        {currentOption.highlight}
                      </p>

                      <p className="flex items-center gap-1 text-[11px] text-white/70 pt-1">
                        <MapPin className="h-3 w-3 text-pink-400 shrink-0" />
                        {currentOption.address}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* RESULT REVEAL VIEW */
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 p-6 flex flex-col items-center justify-between text-center bg-gradient-to-b from-card via-background to-muted/40 rounded-[24px]"
                  >
                    <div className="space-y-3 pt-2">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20 shadow-lg">
                        <Trophy className="h-7 w-7" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        🎉 Consensus Match Found!
                      </span>
                      <h3 className="text-2xl font-black text-foreground">
                        Mendokoro Ramenba
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Unanimous 3/3 &ldquo;Go!&rdquo; votes across all participants. The decision is
                        made!
                      </p>
                    </div>

                    <div className="w-full rounded-2xl border border-border/70 bg-card p-3 space-y-1.5 text-xs text-left">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <span className="font-semibold text-foreground">⭐ 4.9 (1.4k reviews)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price Tier:</span>
                        <span className="font-semibold text-foreground">₱₱₱ (Moderate)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Vote:</span>
                        <span className="font-semibold text-emerald-500">
                          {userVotes["demo-1"] === "go" ? "✓ Approved (Go!)" : "Reviewed"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-semibold text-foreground">BGC, Taguig City</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full pt-2">
                      <Button
                        asChild
                        className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold text-xs shadow-md"
                      >
                        <Link href="/create/host">
                          Create Your Real Room
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRestart}
                        className="rounded-xl text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="mr-1.5 h-3 w-3" />
                        Try Demo Again
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* LIVE PEER STATUS TICKER */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                Live Peers:
              </span>
              <span className="font-mono text-[11px] truncate max-w-[200px]">
                {activePartnerStatus}
              </span>
            </div>

            {/* CONTROLS (PASS / GO) */}
            {!isFinished && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex gap-3 w-full">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleSwipe("pass")}
                    className="flex-1 rounded-2xl border-red-200 dark:border-red-950 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-400 font-semibold transition"
                  >
                    <X className="mr-1.5 h-5 w-5" />
                    Pass (Left)
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleSwipe("go")}
                    className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20 transition"
                  >
                    <Check className="mr-1.5 h-5 w-5" />
                    Go! (Right)
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pro tip: Drag with your cursor or use arrow keys ← →
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
