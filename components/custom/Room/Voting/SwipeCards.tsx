'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { SwipeDirection } from '@/lib/room/voting/types/vote.types'
import CardInfo from './CardInfo'
import { RoomOption } from '@/lib/room/create/types/option-types'
import { Check, X } from 'lucide-react'

const MotionCard = motion.create(Card)
const SWIPE_VELOCITY = 500
const SWIPE_OFFSET = 120

interface SwipeCardProps {
  option: RoomOption
  direction: number
  onSwipe: (dir: SwipeDirection) => void
}

export default function SwipeCard({ option, direction, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const rejectOpacity = useTransform(x, [-140, -40, 0], [1, 0.4, 0])
  const acceptOpacity = useTransform(x, [0, 40, 140], [0, 0.4, 1])

  const hasSwiped = useRef(false)

  useEffect(() => {
    hasSwiped.current = false
  }, [option.option_id])

  const triggerSwipe = useCallback((dir: SwipeDirection) => {
    if (hasSwiped.current) return
    hasSwiped.current = true
    onSwipe(dir)
  }, [onSwipe])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') triggerSwipe('left')
      if (e.key === 'ArrowRight') triggerSwipe('right')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [triggerSwipe])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { velocity, offset } = info
    if (velocity.x > SWIPE_VELOCITY) return triggerSwipe('right')
    if (velocity.x < -SWIPE_VELOCITY) return triggerSwipe('left')
    if (offset.x > SWIPE_OFFSET) return triggerSwipe('right')
    if (offset.x < -SWIPE_OFFSET) return triggerSwipe('left')
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between touch-none">
      {/* Swipeable Card Area */}
      <div className="relative w-full flex-1 min-h-0">
        <MotionCard
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate }}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.02 }}
          exit={{
            opacity: 0,
            x: direction > 0 ? 300 : -300,
            transition: { duration: 0.25, ease: 'easeOut' },
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-[24px] border border-white/20 shadow-xl bg-card z-10"
        >
          {/* Background image */}
          <Image
            src={
              option.imageUrl ??
              'https://placehold.co/600x900/1a1a1a/444444?text=No+Photo'
            }
            alt={option.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 420px"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                'https://placehold.co/600x900/1a1a1a/444444?text=No+Photo'
            }}
            className="pointer-events-none object-cover select-none"
            draggable={false}
          />

          {/* Dark gradient overlay for text legibility */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />

          {/* Top Category Badge */}
          {option.category && (
            <div className="pointer-events-none absolute left-4 top-4 z-10">
              <span className="rounded-full bg-pink-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md capitalize">
                {String(option.category).replace('_', ' ')}
              </span>
            </div>
          )}

          {/* PASS Stamp */}
          <motion.div
            style={{ opacity: rejectOpacity }}
            className="pointer-events-none absolute right-4 top-5 z-20 sm:right-5 sm:top-5"
          >
            <span className="inline-block rotate-12 rounded-xl border-[3px] border-red-500 bg-black/40 px-3 py-1 text-xl font-black uppercase tracking-widest text-red-500 backdrop-blur-xs sm:text-2xl">
              Pass!
            </span>
          </motion.div>

          {/* GO Stamp */}
          <motion.div
            style={{ opacity: acceptOpacity }}
            className="pointer-events-none absolute left-4 top-5 z-20 sm:left-5 sm:top-5"
          >
            <span className="inline-block -rotate-12 rounded-xl border-[3px] border-emerald-400 bg-black/40 px-3 py-1 text-xl font-black uppercase tracking-widest text-emerald-400 backdrop-blur-xs sm:text-2xl">
              Go!
            </span>
          </motion.div>

          {/* Card Info Overlay */}
          <CardInfo option={option} />
        </MotionCard>
      </div>

      {/* Action Controls */}
      <div className="mt-3.5 sm:mt-4 flex flex-col items-center gap-1.5 sm:gap-2 w-full shrink-0">
        <div className="flex w-full gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={() => triggerSwipe('left')}
            className="flex-1 h-12 sm:h-13 rounded-2xl border-red-200 font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/40 shadow-xs active:scale-[0.98]"
          >
            <X className="mr-1.5 h-5 w-5 stroke-[2.5]" />
            Pass
          </Button>

          <Button
            size="lg"
            onClick={() => triggerSwipe('right')}
            className="flex-1 h-12 sm:h-13 rounded-2xl bg-emerald-500 font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            <Check className="mr-1.5 h-5 w-5 stroke-[3]" />
            Go
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Drag the card or use ← →
        </p>
      </div>
    </div>
  )
}