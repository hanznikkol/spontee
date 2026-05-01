'use client'

import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useParams, useSearchParams } from 'next/navigation'
import { Option } from '@/lib/options/option-types'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SwipeCard from '@/components/custom/Room/SwipeCards'
import ResultScreen from '@/components/custom/Room/Phase/ResultScreen'

// Change real data soon
const HARDCODED_OPTIONS: Option[] = [
  { id: '1', text: 'Jollibee', votes: 0 },
  { id: '2', text: 'Samgyup', votes: 0 },
  { id: '3', text: 'Beach', votes: 0 },
  { id: '4', text: 'Coffee', votes: 0 },
]

type Phase = 'swiping' | 'result'

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.id as string
  const mode = searchParams.get('mode') as 'couple' | 'group' | null

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomId}`
    : ''

  // Swap useState with useRoom(roomId) when Supabase is ready
  const [options, setOptions] = useState<Option[]>(HARDCODED_OPTIONS)

  const [phase, setPhase] = useState<Phase>('swiping')
  const [exitDirection, setExitDirection] = useState(0)
  const [copied, setCopied] = useState(false)

  const current = options[0]

  // Swap with a Supabase vote write when ready
  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    if (!current) return

    const isRight = dir === 'right'
    setExitDirection(isRight ? 1 : -1)
    
    const swipedId = current.id

    setOptions(prev =>
      prev.map(opt =>
        opt.id === current.id
          ? { ...opt, votes: isRight ? opt.votes + 1 : opt.votes }
          : opt
      )
    )

    setTimeout(() => {
      setOptions(prev => {
        if (prev[0]?.id !== swipedId) return prev
        const next = prev.slice(1)
        if (next.length === 0) setPhase('result')
        return next
      })
    }, 150)
  }, [current])

  //Supabase will be added here soon
  const winner = useMemo(() => {
    if (phase !== 'result') return null
    return [...options].sort((a, b) => b.votes - a.votes)[0] ?? null
  }, [phase, options])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRestart = () => {
    setOptions(HARDCODED_OPTIONS)
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