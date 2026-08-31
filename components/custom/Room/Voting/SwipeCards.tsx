'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useCallback, useEffect, useRef, useState } from 'react'
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

  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const hasSwiped = useRef(false)

  const photos =
    option.imageUrls && option.imageUrls.length > 0
      ? option.imageUrls
      : ['/images/placeholder.png']


  const triggerSwipe = useCallback((dir: SwipeDirection) => {
    if (hasSwiped.current) return
    hasSwiped.current = true
    onSwipe(dir)
  }, [onSwipe])

  const handlePrevPhoto = useCallback(() => {
    if (Math.abs(x.get()) >= 5) return
    setActivePhotoIndex((prev) => Math.max(0, prev - 1))
  }, [x])

  const handleNextPhoto = useCallback(() => {
    if (Math.abs(x.get()) >= 5) return
    setActivePhotoIndex((prev) => Math.min(photos.length - 1, prev + 1))
  }, [x, photos.length])

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
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-6 touch-none">

      {/* Card */}
      <div className="relative w-full flex-1">
        <MotionCard
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate }}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.02 }}
          exit={{ opacity: 0, x: direction > 0 ? 300 : -300, transition: { duration: 0.25, ease: "easeOut" } }}
          className="absolute inset-0 rounded-2xl sm:rounded-3xl md:rounded-[32px] border-border/80 shadow-2xl cursor-grab active:cursor-grabbing z-10 overflow-hidden bg-card"
        >
          {/* Top pagination indicators (Tinder/Bumble style for 2-3 photos) */}
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

          {/* Background images with opacity transition and lazy loading for extra photos */}
          {photos.map((photoUrl, idx) => (
            <Image
              key={photoUrl}
              src={photoUrl}
              alt={`${option.title} photo ${idx + 1}`}
              fill
              priority={idx === 0}
              loading={idx === 0 ? undefined : 'lazy'}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png' }}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-200 ${
                idx === activePhotoIndex ? 'opacity-100' : 'opacity-0'
              }`}
              draggable={false}
            />
          ))}

          {/* Tap zones for photo navigation (left & right 35%) */}
          {photos.length > 1 && (
            <div className="absolute inset-x-0 top-0 bottom-28 z-15 flex justify-between pointer-events-auto">
              <button
                type="button"
                tabIndex={-1}
                aria-label="Previous photo"
                className="w-[35%] h-full opacity-0 cursor-pointer focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevPhoto()
                }}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label="Next photo"
                className="w-[35%] h-full opacity-0 cursor-pointer focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNextPhoto()
                }}
              />
            </div>
          )}

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* NOPE stamp */}
          <motion.div
            style={{ opacity: rejectOpacity }}
            className="pointer-events-none absolute right-4 top-5 sm:right-6 sm:top-6 z-20"
          >
            <span className="inline-block rotate-12 rounded-xl border-[3px] border-red-500 bg-black/40 px-3 sm:px-4 py-1 text-2xl sm:text-3xl font-black uppercase tracking-widest text-red-500 backdrop-blur-xs">
              Pass!
            </span>
          </motion.div>

          {/* LIKE stamp */}
          <motion.div
            style={{ opacity: acceptOpacity }}
            className="pointer-events-none absolute left-4 top-5 sm:left-6 sm:top-6 z-20"
          >
            <span className="inline-block -rotate-12 rounded-xl border-[3px] border-emerald-400 bg-black/40 px-3 sm:px-4 py-1 text-2xl sm:text-3xl font-black uppercase tracking-widest text-emerald-400 backdrop-blur-xs">
              Go!
            </span>
          </motion.div>

          {/* Text info  */}
          <CardInfo option={option} />
        </MotionCard>
      </div>

      {/* Buttons container fixed at bottom */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 w-full shrink-0">
        <div className="flex justify-center gap-6 sm:gap-10 w-full px-4">
          <button
            type="button"
            className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full border-2 border-red-200 text-red-500 bg-background/80 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-400 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            onClick={() => triggerSwipe('left')}
            aria-label="Pass"
          >
            <X className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.5]" />
          </button>
          
          <button
            type="button"
            className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all"
            onClick={() => triggerSwipe('right')}
            aria-label="Go"
          >
            <Check className="h-7 w-7 sm:h-8 sm:w-8 stroke-3" />
          </button>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden xs:block mt-1 sm:mt-0">
          Drag the card or use ← → arrow keys
        </p>
      </div>

    </div>
  )
}