'use client'

import { useParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import SwipeCard from '@/components/custom/Room/Voting/SwipeCards'
import { useVoting } from '@/lib/room/voting/hook/useVoting'
import { ProgressBar } from '@/components/custom/ProgressBar'
import LogoBranding from '@/components/custom/Landing/LogoBranding'
import { useRoomSessionStore } from '@/lib/room/main/stores/room-session-store.store'

export default function VotingPage() {
  const params = useParams()
  const routeCode = params?.code as string
  const sessionRoomCode = useRoomSessionStore((state) => state.roomCode)
  const roomCode = routeCode || sessionRoomCode || 'ROOM'

  const {
    loading,
    currentOption,
    exitDirection,
    handleSwipe,
    progress,
    progressLabel,
  } = useVoting()

  return (
    <>
      {/* Logo */}
      <LogoBranding />

      {/* Main */}
      <main className="relative min-h-dvh w-full flex flex-col items-center justify-start pt-14 sm:pt-16 pb-4 sm:pb-6 px-4 bg-background overflow-x-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-87.5 w-175 -translate-x-1/2 rounded-full bg-linear-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 blur-3xl -z-10" />

        <div className="w-full justify-center max-w-sm sm:max-w-md mx-auto flex flex-col flex-1 min-h-0">
          {/* Top Session Information */}
          <div className="mb-3 sm:mb-4 px-1">
            <ProgressBar
              value={progress}
              leftLabel={
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">
                    Room: {roomCode}
                  </span>
                </span>
              }
              rightLabel={progressLabel}
            />
          </div>

          {/* Swipe Card Viewport (No outer border enclosure — card moves freely) */}
          <div className="relative w-full flex-1 min-h-110 max-h-160 mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
                <p className="text-xs sm:text-sm font-medium text-muted-foreground animate-pulse">
                  Loading voting deck...
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </main>
    </>
  )
}
