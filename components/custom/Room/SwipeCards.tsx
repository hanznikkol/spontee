'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useRef } from 'react'

const MotionCard = motion.create(Card)

const SWIPE_VELOCITY = 500
const SWIPE_OFFSET = 120

type SwipeCardProps = {
  text: string
  direction: number
  onSwipe: (dir: 'left' | 'right') => void
}

export default function SwipeCard({ text, direction, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const rejectOpacity = useTransform(x, [-150, -60, 0], [1, 0, 0])
  const acceptOpacity = useTransform(x, [0, 60, 150], [0, 0, 1])

  const hasSwiped = useRef(false)
  useEffect(() => {
    hasSwiped.current = false
  }, [text])

  const triggerSwipe = useCallback((dir: 'left' | 'right') => {
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
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 touch-none">

      {/* Card — fills available space above buttons */}
      <div className="relative w-full flex-1">
        <MotionCard
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate }}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
          exit={{ opacity: 0, x: direction > 0 ? 300 : -300, transition: { duration: 0.3 } }}
          className="absolute inset-0 rounded-3xl shadow-xl cursor-grab active:cursor-grabbing z-10 flex items-center justify-center"
        >
          <motion.div
            style={{ opacity: rejectOpacity }}
            className="absolute inset-0 rounded-3xl bg-red-500/20 flex items-start justify-end p-6 pointer-events-none"
          >
            <span className="text-red-500 font-bold text-xl border-2 border-red-500 px-3 py-1 rounded-xl rotate-12">
              Nah!
            </span>
          </motion.div>

          <motion.div
            style={{ opacity: acceptOpacity }}
            className="absolute inset-0 rounded-3xl bg-green-500/20 flex items-start justify-start p-6 pointer-events-none"
          >
            <span className="text-green-500 font-bold text-xl border-2 border-green-500 px-3 py-1 rounded-xl -rotate-12">
              G!
            </span>
          </motion.div>

          <div className="flex flex-col items-center justify-center text-center space-y-3 p-8">
            <h2 className="text-3xl font-bold">{text}</h2>
            <p className="text-sm text-muted-foreground">Swipe or choose below</p>
          </div>
        </MotionCard>
      </div>

      {/* Buttons — pinned at bottom of the absolute container */}
      <div className="flex flex-col items-center gap-2 w-full shrink-0">
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-2xl border-red-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            onClick={() => triggerSwipe('left')}
          >
            ✕ Nah
          </Button>
          <Button
            size="lg"
            className="flex-1 rounded-2xl bg-green-500 hover:bg-green-600 text-white"
            onClick={() => triggerSwipe('right')}
          >
            ✓ G!
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">or use ← → arrow keys</p>
      </div>

    </div>
  )
}