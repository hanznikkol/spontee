'use client'

import { AnimatePresence } from 'framer-motion'
import SwipeCard from '@/components/custom/Room/SwipeCards'
import { useVoting } from '@/lib/room/voting/hook/useVoting'
// import ResultScreen from '@/components/custom/Room/Phase/ResultScreen'

export default function RoomPage() {
  const {currentOption, options, exitDirection, handleSwipe} = useVoting()

  return (
    <main className="min-h-dvh w-full flex flex-col items-center justify-center px-4 gap-2 bg-background">

      {/* Top bar */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {options.length} left
        </span>
      </div>

      {/* Card + buttons */}
      <div className="relative w-full max-w-sm h-[85dvh]">
        <AnimatePresence initial={false}>
          {currentOption && (
            <SwipeCard
              key={currentOption.option_id}
              text={currentOption.title}
              direction={exitDirection}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>
      </div>

    </main>
  )
}
