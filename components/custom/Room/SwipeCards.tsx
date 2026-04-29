'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useRef } from 'react'

const MotionCard = motion.create(Card)

type SwipeCardProps = {
  text: string
  direction: number;
  onSwipe: (type: 'left' | 'right') => void 
}

export default function SwipeCard({ text, direction, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0)
  
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const bg = useTransform(
    x,
    [-150, 0, 150],
    ['#ef4444', '#ffffff', '#22c55e']
  )

  const hasSwiped = useRef(false)
  useEffect(() => {
    hasSwiped.current = false
  }, [text])

  
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (hasSwiped.current) return

    const velocity = info.velocity.x
    const offset = info.offset.x

    if (velocity > 500) {
      hasSwiped.current = true
      onSwipe('right')
      return
    }

    if (velocity < -500) {
      hasSwiped.current = true
      onSwipe('left')
      return
    }

    if (offset > 120) {
      hasSwiped.current = true
      onSwipe('right')
    } else if (offset < -120) {
      hasSwiped.current = true
      onSwipe('left')
    }
  }
  return (
    <MotionCard
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, backgroundColor: bg }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      exit={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute inset-0 rounded-3xl shadow-xl cursor-grab active:cursor-grabbing z-10 flex items-center justify-center"
    >
      <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
        <h2 className="text-3xl font-bold">{text}</h2>
        <p className="text-sm text-muted-foreground">
          Swipe or choose
        </p>
      </CardContent>
    </MotionCard>
  )
}