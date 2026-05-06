'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useParams, useSearchParams } from 'next/navigation'
import { Option } from '@/lib/options/option-types'
import { RoomMode } from '@/lib/room/room-types'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SwipeCard from '@/components/custom/Room/SwipeCards'
import ResultScreen from '@/components/custom/Room/Phase/ResultScreen'

// Fallback if no options are stored (dev/demo)
const FALLBACK_OPTIONS: Option[] = [
  { options_id: '1', text: 'Jollibee', votes: 0 },
  { options_id: '2', text: 'Samgyup', votes: 0 },
  { options_id: '3', text: 'Beach', votes: 0 },
  { options_id: '4', text: 'Coffee', votes: 0 },
]

type Phase = 'swiping' | 'result'

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.id as string
  const mode = searchParams.get('mode') as RoomMode | null

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomId}`
    : ''

  const [options, setOptions] = useState<Option[]>([])
  const [initialOptions, setInitialOptions] = useState<Option[]>([])
  const [phase, setPhase] = useState<Phase>('swiping')
  const [exitDirection, setExitDirection] = useState(0)
  const [copied, setCopied] = useState(false)

  // Load options from localStorage (swap with Supabase query later)
  useEffect(() => {
    const saved = localStorage.getItem(`room:${roomId}:options`)
    if (saved) {
      try {
        const parsed: Option[] = JSON.parse(saved)
        // Reset votes for a fresh swipe session
        const fresh = parsed.map(o => ({ ...o, votes: 0 }))
        setOptions(fresh)
        setInitialOptions(fresh)
      } catch {
        setOptions(FALLBACK_OPTIONS)
        setInitialOptions(FALLBACK_OPTIONS)
      }
    } else {
      setOptions(FALLBACK_OPTIONS)
      setInitialOptions(FALLBACK_OPTIONS)
    }
  }, [roomId])

  const current = options[0]

  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    if (!current) return

    const isRight = dir === 'right'
    setExitDirection(isRight ? 1 : -1)

    const swipedId = current.options_id

    setOptions(prev =>
      prev.map(opt =>
        opt.options_id === swipedId
          ? { ...opt, votes: isRight ? opt.votes + 1 : opt.votes }
          : opt
      )
    )

    setTimeout(() => {
      setOptions(prev => {
        if (prev[0]?.options_id !== swipedId) return prev
        const next = prev.slice(1)
        if (next.length === 0) setPhase('result')
        return next
      })
    }, 150)
  }, [current])

  // Winner = highest votes; tie-break by original order
  const winner = useMemo(() => {
    if (phase !== 'result') return null
    const all = [...initialOptions].map(orig => {
      const voted = options.find(o => o.options_id === orig.options_id)
      return voted ?? orig
    })
    return all.sort((a, b) => b.votes - a.votes)[0] ?? null
  }, [phase, options, initialOptions])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRestart = () => {
    const fresh = initialOptions.map(o => ({ ...o, votes: 0 }))
    setOptions(fresh)
    setPhase('swiping')
  }

  if (phase === 'result') {
    return (
      <ResultScreen
        winner={winner}
        mode={mode}
        shareUrl={shareUrl}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <main className="min-h-dvh w-full flex flex-col items-center justify-center px-4 gap-2 bg-background">

      {/* Top bar */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {options.length} left
        </span>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleCopy}>
          {copied
            ? <><Check className="w-3 h-3" /> Copied!</>
            : <><Copy className="w-3 h-3" /> Invite</>
          }
        </Button>
      </div>

      {/* Card + buttons */}
      <div className="relative w-full max-w-sm h-[85dvh]">
        <AnimatePresence initial={false}>
          {current && (
            <SwipeCard
              key={current.options_id}
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