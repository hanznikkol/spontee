'use client'

import { AnimatePresence } from 'framer-motion'
import SwipeCard from '@/components/custom/Room/Voting/SwipeCards'
import { useVoting } from '@/lib/room/voting/hook/useVoting'
import { ProgressBar } from '@/components/custom/ProgressBar'
import LogoBranding from '@/components/custom/Landing/LogoBranding'
// import ResultScreen from '@/components/custom/Room/Phase/ResultScreen'

export default function RoomPage() {
  const {
    currentOption,
    exitDirection,
    handleSwipe,
    progress,
    progressLabel,
  } = useVoting()

  return (
  <>
  <LogoBranding/>
  <main className="relative min-h-dvh w-full flex flex-col items-center justify-center px-4 gap-2 bg-background">
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl"/>
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl"/>
    </div>

    {/* Top bar */}
    <div className="mx-auto w-full max-w-sm px-4 pt-6 space-y-2">
      <ProgressBar value={progress} leftLabel={progressLabel}/>
        <p className="text-center text-xs text-muted-foreground">
          Swipe left to pass • Swipe right to go
        </p>
    </div>

    {/* Card + buttons */}
    <div className="relative w-full max-w-sm aspect-9/16 max-h-[75dvh] lg:max-h-[80dvh] mx-auto">
      <AnimatePresence initial={false}>
        {currentOption && (
          <SwipeCard
            key={currentOption.option_id}
            option={currentOption}
            direction={exitDirection}
            onSwipe={handleSwipe}
          />
        )}
      </AnimatePresence>
    </div>

  </main>
  </>

  )
}
