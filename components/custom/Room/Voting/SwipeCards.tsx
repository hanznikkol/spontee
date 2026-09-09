'use client'

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { SwipeDirection } from '@/lib/room/voting/types/vote.types'
import CardInfo from './CardInfo'
import { RoomOption } from '@/lib/room/create/types/option-types'
import { Check, X } from 'lucide-react'

const MotionCard = motion.create(Card)
const SWIPE_VELOCITY = 450
const SWIPE_OFFSET = 100

export interface SwipeCardRef {
  swipe: (dir: SwipeDirection) => void
}

export interface SwipeCardProps {
  option: RoomOption
  onSwipe: (dir: SwipeDirection) => void
  priority?: boolean
}

/**
 * Background card rendered behind the active card in the deck.
 * Static, non-interactive, loads only primary photo with lazy priority.
 * Memoized so it never re-renders while the active card is being dragged.
 */
export const BackgroundCard = React.memo(function BackgroundCard({
  option,
}: {
  option: RoomOption
}) {
  const photoUrl =
    option.imageUrls && option.imageUrls.length > 0
      ? option.imageUrls[0]
      : '/images/placeholder.png'

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 rounded-2xl sm:rounded-3xl md:rounded-[32px] border border-border/60 shadow-lg overflow-hidden bg-card scale-[0.96] translate-y-2 opacity-80 sm:opacity-90 pointer-events-none transform-gpu transition-transform duration-200"
    >
      <Image
        src={photoUrl}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 448px"
        loading="lazy"
        priority={false}
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />
      <CardInfo option={option} />
    </div>
  )
})

/**
 * Stable bottom action buttons for voting (Pass / Go).
 * Decoupled from the card exit animation to prevent unmounting/layout shifts.
 */
export const SwipeActionButtons = React.memo(function SwipeActionButtons({
  onPass,
  onGo,
  disabled = false,
}: {
  onPass: () => void
  onGo: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 w-full shrink-0">
      <div className="flex justify-center gap-6 sm:gap-10 w-full px-4">
        <button
          type="button"
          disabled={disabled}
          className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full border-2 border-red-200 text-red-500 bg-background/90 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-400 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          onClick={onPass}
          aria-label="Pass"
        >
          <X className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.5]" />
        </button>

        <button
          type="button"
          disabled={disabled}
          className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          onClick={onGo}
          aria-label="Go"
        >
          <Check className="h-7 w-7 sm:h-8 sm:w-8 stroke-3" />
        </button>
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden xs:block mt-1 sm:mt-0">
        Drag the card or use ← → arrow keys
      </p>
    </div>
  )
})

/**
 * Active draggable swipe card with GPU-accelerated transforms.
 * Only the active photo is rendered in the DOM to conserve mobile memory.
 */
const SwipeCardComponent = React.forwardRef<SwipeCardRef, SwipeCardProps>(
  function SwipeCardComponent(
    { option, onSwipe, priority = true },
    ref
  ) {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-15, 15], { clamp: true })
    const rejectOpacity = useTransform(x, [-140, -40, 0], [1, 0.4, 0], { clamp: true })
    const acceptOpacity = useTransform(x, [0, 40, 140], [0, 0.4, 1], { clamp: true })

    const [activePhotoIndex, setActivePhotoIndex] = useState(0)
    const [isExiting, setIsExiting] = useState(false)
    const hasSwiped = useRef(false)
    const isDraggingRef = useRef(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const controlsRef = useRef<{ stop: () => void } | null>(null)

    const photos =
      option.imageUrls && option.imageUrls.length > 0
        ? option.imageUrls
        : ['/images/placeholder.png']

    const triggerSwipe = useCallback(
      (dir: SwipeDirection) => {
        if (hasSwiped.current) return
        hasSwiped.current = true
        setIsExiting(true)

        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }

        const flyDistance =
          typeof window !== 'undefined'
            ? Math.max(window.innerWidth, 500) + 100
            : 600
        const targetX = dir === 'right' ? flyDistance : -flyDistance

        controlsRef.current = animate(x, targetX, {
          duration: 0.22,
          ease: 'easeOut',
          onComplete: () => {
            onSwipe(dir)
          },
        })
      },
      [x, onSwipe]
    )

    useImperativeHandle(
      ref,
      () => ({
        swipe: (dir: SwipeDirection) => {
          triggerSwipe(dir)
        },
      }),
      [triggerSwipe]
    )

    const advancePhoto = useCallback(() => {
      if (photos.length <= 1) return
      setActivePhotoIndex((prev) => (prev + 1) % photos.length)
    }, [photos.length])

    const startAutoplayTimer = useCallback(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (photos.length <= 1) return

      timerRef.current = setInterval(() => {
        // Pause automatic advances while user is actively dragging or swiping
        if (isDraggingRef.current || hasSwiped.current) return
        advancePhoto()
      }, 3000)
    }, [advancePhoto, photos.length])

    useEffect(() => {
      startAutoplayTimer()
      return () => {
        controlsRef.current?.stop()
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }, [startAutoplayTimer])

    const handleCardTap = useCallback(() => {
      if (photos.length <= 1) return
      if (Math.abs(x.get()) >= 5 || hasSwiped.current || isDraggingRef.current) return
      advancePhoto()
      startAutoplayTimer()
    }, [advancePhoto, startAutoplayTimer, photos.length, x])

    const handleDragStart = useCallback(() => {
      isDraggingRef.current = true
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, [])

    const handleDragEnd = useCallback(
      (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        isDraggingRef.current = false
        const currentX = x.get()
        const vx = info.velocity.x
        const ox = info.offset.x

        // Right swipe criteria:
        // 1. Dragged right beyond threshold, OR
        // 2. Displaced right (>= 20px) AND flicked right with sufficient velocity
        const isRightSwipe =
          ox > SWIPE_OFFSET ||
          currentX > SWIPE_OFFSET ||
          (ox > 20 && vx > SWIPE_VELOCITY) ||
          (currentX > 20 && vx > SWIPE_VELOCITY)

        // Left swipe criteria:
        // 1. Dragged left beyond negative threshold, OR
        // 2. Displaced left (<= -20px) AND flicked left with sufficient velocity
        const isLeftSwipe =
          ox < -SWIPE_OFFSET ||
          currentX < -SWIPE_OFFSET ||
          (ox < -20 && vx < -SWIPE_VELOCITY) ||
          (currentX < -20 && vx < -SWIPE_VELOCITY)

        if (isRightSwipe && !isLeftSwipe) {
          triggerSwipe('right')
        } else if (isLeftSwipe && !isRightSwipe) {
          triggerSwipe('left')
        } else {
          startAutoplayTimer()
        }
      },
      [startAutoplayTimer, triggerSwipe, x]
    )

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') triggerSwipe('left')
        if (e.key === 'ArrowRight') triggerSwipe('right')
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [triggerSwipe])

    return (
      <div className="absolute inset-0 touch-none">
        <MotionCard
          drag={isExiting ? false : 'x'}
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate, willChange: 'transform' }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTap={handleCardTap}
          whileDrag={{ scale: 1.02 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.1, ease: 'easeOut' },
          }}
          className={`absolute inset-0 rounded-2xl sm:rounded-3xl md:rounded-[32px] border-border/80 shadow-2xl cursor-grab active:cursor-grabbing z-10 overflow-hidden bg-card transform-gpu select-none ${
            isExiting ? 'pointer-events-none' : ''
          }`}
        >
          {/* Top pagination indicators for multiple photos */}
          {photos.length > 1 && (
            <div className="absolute top-2.5 inset-x-3 sm:top-3.5 sm:inset-x-4 z-30 flex gap-1.5 pointer-events-none">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                    idx === activePhotoIndex
                      ? 'bg-white shadow-xs'
                      : 'bg-white/35 backdrop-blur-xs'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Active photo - only the active image is rendered in the DOM to eliminate extra decodes and GPU memory overhead */}
          <Image
            key={photos[activePhotoIndex]}
            src={photos[activePhotoIndex]}
            alt={`${option.title} photo ${activePhotoIndex + 1}`}
            fill
            priority={priority && activePhotoIndex === 0}
            loading={priority && activePhotoIndex === 0 ? undefined : 'lazy'}
            sizes="(max-width: 640px) 100vw, 448px"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/images/placeholder.png'
            }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* NOPE stamp (Glassmorphic with GPU layer promotion) */}
          <motion.div
            style={{ opacity: rejectOpacity }}
            className="pointer-events-none absolute right-4 top-5 sm:right-6 sm:top-6 z-20 transform-gpu"
          >
            <span className="inline-block rotate-12 rounded-xl border-[3px] border-red-500 bg-black/40 px-3 sm:px-4 py-1 text-2xl sm:text-3xl font-black uppercase tracking-widest text-red-500 backdrop-blur-xs shadow-md">
              Pass!
            </span>
          </motion.div>

          {/* LIKE stamp (Glassmorphic with GPU layer promotion) */}
          <motion.div
            style={{ opacity: acceptOpacity }}
            className="pointer-events-none absolute left-4 top-5 sm:left-6 sm:top-6 z-20 transform-gpu"
          >
            <span className="inline-block -rotate-12 rounded-xl border-[3px] border-emerald-400 bg-black/40 px-3 sm:px-4 py-1 text-2xl sm:text-3xl font-black uppercase tracking-widest text-emerald-400 backdrop-blur-xs shadow-md">
              Go!
            </span>
          </motion.div>

          {/* Text info */}
          <CardInfo option={option} />
        </MotionCard>
      </div>
    )
  }
)

const SwipeCard = React.memo(SwipeCardComponent)
export default SwipeCard