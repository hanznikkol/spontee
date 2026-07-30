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
  const rejectOpacity = useTransform(x, [-150, -60, 0], [1, 0, 0])
  const acceptOpacity = useTransform(x, [0, 60, 150], [0, 0, 1])

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
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 touch-none">

      {/* Card*/}
      <div className="relative w-full flex-1">
        <MotionCard
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate }}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
          exit={{ opacity: 0, x: direction > 0 ? 300 : -300, transition: { duration: 0.3 } }}
          className="absolute inset-0 rounded-[28px] ring-1 ring-white/10 shadow-xl cursor-grab active:cursor-grabbing z-10 overflow-hidden"
        >
          {/* Background image */}
          <Image
            src={option.imageUrl ?? '/images/placeholder.png'}
            alt={option.title}
            fill
            sizes='(max-width: 768px) 100vw, 420px'
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x900/1a1a1a/444444?text=No+Photo' }}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Dark gradient overlay — fades bottom */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent pointer-events-none rounded-3xl" />

          {/* NOPE stamp */}
          <motion.div
            style={{ opacity: rejectOpacity }}
            className="absolute top-6 right-6 pointer-events-none"
          >
            <span className="text-red-500 font-black text-2xl tracking-widest border-[3px] border-red-500 px-3 py-1 rounded-xl rotate-12 inline-block uppercase">
              Pass!
            </span>
          </motion.div>

          {/* LIKE stamp */}
          <motion.div
            style={{ opacity: acceptOpacity }}
            className="absolute top-6 left-6 pointer-events-none"
          >
            <span className="text-green-400 font-black text-2xl tracking-widest border-[3px] border-green-400 px-3 py-1 rounded-xl -rotate-12 inline-block uppercase">
              Go!
            </span>
          </motion.div>

          {/* Text info  */}
          <CardInfo option={option} />
        </MotionCard>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-2 w-full shrink-0">
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-2xl border-red-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            onClick={() => triggerSwipe('left')}
          >
            <X/>
          </Button>
          <Button
            size="lg"
            className="flex-1 rounded-2xl bg-green-500 hover:bg-green-600 text-white"
            onClick={() => triggerSwipe('right')}
          >
            <Check/>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">or use ← → arrow keys</p>
      </div>

    </div>
  )
}