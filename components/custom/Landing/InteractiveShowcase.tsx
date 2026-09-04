"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Star,
  MapPin,
  Check,
  X,
  RotateCcw,
  Users,
  Trophy,
  ArrowRight,
  Hand,
} from "lucide-react"
import { DEMO_OPTIONS, DemoOption } from "@/lib/landing/text-metadata"

export default function InteractiveShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userVotes, setUserVotes] = useState<Record<string, "go" | "pass">>({})
  const [activePartnerStatus, setActivePartnerStatus] = useState(
    "Maya and Liam are voting..."
  )
  const [isAnimating, setIsAnimating] = useState(false)

  const isFinished = currentIndex >= DEMO_OPTIONS.length
  const currentOption: DemoOption | undefined = DEMO_OPTIONS[currentIndex]

  // Motion values for swipe drag
  const x = useMotionValue(0)

  const rotate = useTransform(x, [-200, 200], [-15, 15])

  const opacityPass = useTransform(
    x,
    [-140, -40, 0],
    [1, 0.4, 0]
  )

  const opacityGo = useTransform(
    x,
    [0, 40, 140],
    [0, 0.4, 1]
  )

  const handleSwipe = useCallback(
    async (vote: "go" | "pass") => {
      if (
        isFinished ||
        !currentOption ||
        isAnimating
      ) {
        return
      }

      setIsAnimating(true)

      const swipeDirection = vote === "go" ? 1 : -1

      setUserVotes((prev) => ({
        ...prev,
        [currentOption.id]: vote,
      }))

      // Simulated live peer messages
      if (currentIndex === 0) {
        setActivePartnerStatus(
          "Maya swiped Go! · Liam swiped Go!"
        )
      } else if (currentIndex === 1) {
        setActivePartnerStatus(
          "Maya swiped Go! · Liam swiped Pass!"
        )
      }

      // Animate the current card out of the viewport.
      await animate(
        x,
        swipeDirection * 500,
        {
          duration: 0.25,
          ease: "easeOut",
        }
      )

      // Move to the next card only after the old card has left.
      setCurrentIndex((prev) => prev + 1)

      // Reset the motion value for the next card.
      x.set(0)

      setIsAnimating(false)
    },
    [
      isFinished,
      currentOption,
      currentIndex,
      isAnimating,
      x,
    ]
  )

  const handleDragEnd = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: {
        offset: { x: number }
        velocity: { x: number }
      }
    ) => {
      if (isAnimating) return

      const swipeThreshold = 90

      if (info.offset.x > swipeThreshold) {
        handleSwipe("go")
      } else if (info.offset.x < -swipeThreshold) {
        handleSwipe("pass")
      } else {
        // Not enough movement — naturally return to center.
        animate(x, 0, {
          type: "spring",
          stiffness: 500,
          damping: 30,
        })
      }
    },
    [handleSwipe, isAnimating, x]
  )

  const handleRestart = () => {
    setCurrentIndex(0)
    setUserVotes({})
    setActivePartnerStatus(
      "Maya and Liam are voting..."
    )
    x.set(0)
    setIsAnimating(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || isAnimating) return

      if (e.key === "ArrowLeft") {
        handleSwipe("pass")
      } else if (e.key === "ArrowRight") {
        handleSwipe("go")
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }
  }, [handleSwipe, isFinished, isAnimating])

  return (
    <section
      id="demo"
      className="relative overflow-hidden border-y border-border/40 bg-muted/30 py-20 sm:py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-87.5 w-175 -translate-x-1/2 rounded-full bg-linear-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-xs font-semibold text-pink-600 backdrop-blur-sm dark:text-pink-400">
            <Hand className="h-3.5 w-3.5" />
            Interactive Playground
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Try the Spontee voting deck
          </h2>

          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Swipe what you like. Skip what you don&apos;t.
            Spontee finds what everyone agrees on.
          </p>
        </div>

        {/* SIMULATOR */}
        <div className="mx-auto max-w-md">
          <div className="rounded-[32px] border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-2xl sm:p-6">

            {/* TOP BAR */}
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                <span className="font-semibold text-foreground">
                  Room: SPON-2026
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-pink-500" />

                <span>3 Participants</span>
              </div>
            </div>

            {/* PROGRESS */}
            <div className="mb-5 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Group Voting Progress</span>

                <span className="font-mono font-semibold text-foreground">
                  {Math.min(
                    currentIndex,
                    DEMO_OPTIONS.length
                  )}{" "}
                  of {DEMO_OPTIONS.length}
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-300"
                  style={{
                    width: `${
                      (Math.min(
                        currentIndex,
                        DEMO_OPTIONS.length
                      ) /
                        DEMO_OPTIONS.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* CARD VIEWPORT */}
            <div className="relative flex aspect-4/5 min-h-[430px] sm:min-h-[460px] w-full items-center justify-center overflow-hidden rounded-[24px] bg-muted/40">
              <AnimatePresence mode="wait">
                {!isFinished && currentOption ? (
                  <motion.div
                    key={currentOption.id}
                    style={{
                      x,
                      rotate,
                    }}
                    drag={isAnimating ? false : "x"}
                    dragConstraints={{
                      left: 0,
                      right: 0,
                    }}
                    dragElastic={0.65}
                    onDragEnd={handleDragEnd}
                    initial={{
                      scale: 0.95,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                      transition: {
                        duration: 0.05,
                      },
                    }}
                    whileTap={{
                      cursor: "grabbing",
                    }}
                    className="absolute inset-0 cursor-grab select-none overflow-hidden rounded-[24px] border border-white/20 shadow-xl"
                  >
                    {/* IMAGE */}
                    <Image
                      src={currentOption.image}
                      alt={`Interactive voting preview for ${currentOption.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="pointer-events-none object-cover"
                    />

                    {/* OVERLAY */}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />

                    {/* PASS */}
                    <motion.div
                      style={{
                        opacity: opacityPass,
                      }}
                      className="pointer-events-none absolute right-4 top-5 z-20 sm:right-5 sm:top-5"
                    >
                      <span className="inline-block rotate-12 rounded-xl border-[3px] border-red-500 bg-black/40 px-3 py-1 text-xl font-black uppercase tracking-widest text-red-500 backdrop-blur-xs sm:text-2xl">
                        Pass!
                      </span>
                    </motion.div>

                    {/* GO */}
                    <motion.div
                      style={{
                        opacity: opacityGo,
                      }}
                      className="pointer-events-none absolute left-4 top-5 z-20 sm:left-5 sm:top-5"
                    >
                      <span className="inline-block -rotate-12 rounded-xl border-[3px] border-emerald-400 bg-black/40 px-3 py-1 text-xl font-black uppercase tracking-widest text-emerald-400 backdrop-blur-xs sm:text-2xl">
                        Go!
                      </span>
                    </motion.div>

                    {/* TAG */}
                    <div className="pointer-events-none absolute left-4 top-4 z-10">
                      <span className="rounded-full bg-pink-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                        {currentOption.tag}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-5 sm:p-6 text-white">
                      
                      {/* Badges */}
                      <div className="mb-1.5 sm:mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium capitalize text-white backdrop-blur-md border border-white/10">
                          {currentOption.category}
                        </span>

                        <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-amber-300 backdrop-blur-md border border-amber-400/20">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {currentOption.rating} ({currentOption.reviewsCount})
                        </span>

                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium tracking-widest text-white backdrop-blur-md border border-white/10">
                          {"₱".repeat(currentOption.priceLevel)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="line-clamp-2 wrap-break-word text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                        {currentOption.title}
                      </h3>

                      {/* Highlight */}
                      {currentOption.highlight && (
                        <p className="mt-1 line-clamp-1 text-[11px] sm:text-xs text-white/85">
                          {currentOption.highlight}
                        </p>
                      )}

                      {/* Address */}
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] sm:text-xs text-white/85 line-clamp-1">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-400" />
                        <span className="truncate">{currentOption.address}</span>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* RESULT */
                  <motion.div
                    key="result"
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-between rounded-[24px] bg-linear-to-b from-card via-background to-muted/40 p-4 sm:p-6 text-center overflow-y-auto custom-scrollbar"
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

                      <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                        Unanimous 3/3 &ldquo;Go!&rdquo;
                        votes across all participants.
                        The decision is made!
                      </p>
                    </div>

                    <div className="w-full space-y-1.5 rounded-2xl border border-border/70 bg-card p-3 text-left text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Rating:
                        </span>

                        <span className="font-semibold text-foreground">
                          ⭐ 4.9 (1.4k reviews)
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Price Tier:
                        </span>

                        <span className="font-semibold text-foreground">
                          ₱₱₱ (Moderate)
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Your Vote:
                        </span>

                        <span className="font-semibold text-emerald-500">
                          {userVotes["demo-1"] ===
                          "go"
                            ? "✓ Approved (Go!)"
                            : "Reviewed"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Location:
                        </span>

                        <span className="font-semibold text-foreground">
                          BGC, Taguig City
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 pt-2">
                      <Button
                        asChild
                        className="w-full rounded-xl bg-linear-to-r from-pink-500 to-blue-500 text-xs font-semibold text-white shadow-md"
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

            {/* LIVE PEERS */}
            <div className="mt-4 flex items-center justify-between gap-2 min-w-0 rounded-xl bg-muted/60 px-3.5 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                Live Peers:
              </span>

              <span className="truncate font-mono text-[11px] shrink min-w-0 text-right">
                {activePartnerStatus}
              </span>
            </div>

            {/* CONTROLS */}
            {!isFinished && (
              <div className="mt-5 sm:mt-6 flex flex-col items-center gap-2 w-full">
                <div className="flex justify-center gap-6 sm:gap-10 w-full px-4">
                  <button
                    type="button"
                    disabled={isAnimating}
                    onClick={() => handleSwipe("pass")}
                    aria-label="Pass"
                    className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full border-2 border-red-200 text-red-500 bg-background/80 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-400 shadow-lg backdrop-blur-md active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                  >
                    <X className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    disabled={isAnimating}
                    onClick={() => handleSwipe("go")}
                    aria-label="Go"
                    className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                  >
                    <Check className="h-7 w-7 sm:h-8 sm:w-8 stroke-3" />
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Drag the card or use ← →
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}