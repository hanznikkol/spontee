'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import SwipeCard from '@/components/custom/Room/SwipeCards'
import { Option } from '@/lib/options/option-types'

export default function Room() {
  const [option, setOption] = useState<Option[]>([
    { id: '1', text: 'Jollibee', votes: 0 },
    { id: '2', text: 'Samgyup', votes: 0 },
    { id: '3', text: 'Beach', votes: 0 },
    { id: '4', text: 'Coffee', votes: 0 },
  ])
  const [exitDirection, setExitDirection] = useState(0)

  const current = option[0]
  const next = option[1]
  const nextNext = option[2]

  const handleSwipe = (dir: 'left' | 'right') => {
    if (!current) return

    const isRight = dir === 'right'

    setExitDirection(isRight ? 1 : -1)

    // vote update
    setOption(prev =>
      prev.map(opt =>
        opt.id === current.id
          ? { ...opt, votes: isRight ? opt.votes + 1 : opt.votes }
          : opt
      )
    )

    // remove top card after animation
    setTimeout(() => {
      setOption(prev => prev.slice(1))
    }, 50)
  }

  return (
    <main className="h-dvh w-full flex items-center justify-center overflow-hidden bg-background">

      <div className="relative w-full max-w-sm h-[80dvh] flex items-center justify-center">

        <AnimatePresence initial={false}>
          {current && (
            <SwipeCard
              key={current.id}
              text={current.text}
              direction={exitDirection}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}