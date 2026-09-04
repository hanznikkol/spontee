"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, SlidersHorizontal, Loader2, Compass, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { retryRoomAction } from '@/lib/room/create/actions/retry-room'

interface ResultNoMatchCardProps {
  roomId?: string | null
  roomCode?: string
  isHost?: boolean
  participantCount?: number
  onOpenChangePreferences?: () => void
}

export default function ResultNoMatchCard({
  roomId,
  roomCode,
  isHost = false,
  participantCount = 2,
  onOpenChangePreferences,
}: ResultNoMatchCardProps) {
  const router = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

  const handleTryAgain = async () => {
    if (!roomId || isRetrying) return

    try {
      setIsRetrying(true)
      setRetryError(null)

      await retryRoomAction({ roomId })

      if (roomCode) {
        router.push(`/room/${roomCode}`)
      }
    } catch (err) {
      console.error('Retry failed:', err)
      setRetryError(
        err instanceof Error
          ? err.message
          : 'Could not generate new options. Please try again.'
      )
    } finally {
      setIsRetrying(false)
    }
  }

  const handleOpenPreferences = () => {
    setRetryError(null)
    onOpenChangePreferences?.()
  }

  const passCopy =
    participantCount === 2
      ? 'You both passed on everything this round.'
      : 'Everyone passed on everything this round.'

  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-8 w-full">
      <Card className="w-full max-w-lg mx-auto rounded-2xl sm:rounded-3xl md:rounded-[32px] border-border/80 bg-linear-to-b from-card/90 to-card/50 backdrop-blur-2xl shadow-xl sm:shadow-2xl p-5 sm:p-8 md:p-10 text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-purple-500/10 blur-[50px] sm:blur-[64px] rounded-full pointer-events-none" />

        <div className="relative flex flex-col items-center w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 sm:mb-6 text-purple-500 shadow-inner">
            <Compass className="h-7 w-7 sm:h-8 sm:w-8 text-purple-500" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 sm:mb-3 text-foreground">
            Nothing clicked?
          </h2>

          <div className="space-y-1 mb-6 sm:mb-8 text-muted-foreground">
            <p className="text-xs sm:text-sm md:text-base leading-relaxed">
              {passCopy}
            </p>
            <p className="text-xs sm:text-sm md:text-base font-medium text-foreground/80 leading-relaxed">
              Let&apos;s try a fresh set of options.
            </p>
          </div>

          {retryError && (
            <Alert
              variant="destructive"
              className="mb-6 text-left rounded-2xl border-destructive/30 bg-destructive/10 backdrop-blur-sm"
            >
              <AlertCircle />
              <AlertTitle className="text-sm font-semibold tracking-tight text-destructive">
                Unable to Refresh Options
              </AlertTitle>
              <AlertDescription className="text-xs sm:text-sm text-destructive/90 leading-relaxed">
                {retryError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 w-full">
            {isHost ? (
              <>
                <Button
                  onClick={handleTryAgain}
                  disabled={isRetrying}
                  className="w-full sm:w-auto sm:flex-1 min-h-[48px] h-12 sm:h-13 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold shadow-md active:scale-[0.98] transition-all bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white cursor-pointer justify-center text-center whitespace-normal"
                >
                  {isRetrying ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span>Finding Fresh Options...</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 shrink-0" />
                      <span>Try Again</span>
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenPreferences}
                  disabled={isRetrying}
                  className="w-full sm:w-auto sm:flex-1 min-h-[48px] h-12 sm:h-13 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold active:scale-[0.98] transition-all cursor-pointer justify-center text-center whitespace-normal border-border/80 hover:bg-muted/70"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 shrink-0" />
                    <span>Change Preferences</span>
                  </span>
                </Button>
              </>
            ) : (
              <div className="w-full py-3.5 px-4 rounded-2xl border border-border/60 bg-muted/40 text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2.5 leading-relaxed text-center">
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping shrink-0" />
                <span>Waiting for the host to decide whether to try again or change the room preferences.</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
