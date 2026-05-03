'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useParams, useSearchParams } from 'next/navigation'
import { Option } from '@/lib/options/option-types'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SwipeCard from '@/components/custom/Room/SwipeCards'
import ResultScreen from '@/components/custom/Room/Phase/ResultScreen'
import { Phase } from '@/lib/room/room-types'

// Change real data soon
const HARDCODED_OPTIONS: Option[] = [
  { id: '1', text: 'Jollibee', votes: 0 },
  { id: '2', text: 'Samgyup', votes: 0 },
  { id: '3', text: 'Beach', votes: 0 },
  { id: '4', text: 'Coffee', votes: 0 },
]

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.id as string
  const mode = searchParams.get('mode') as 'couple' | 'group' | null

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomId}`
    : ''

  // Swap useState with useRoom(roomId) when Supabase is ready
  const [options, setOptions] = useState<Option[]>([])
  const [roomName, setRoomName] = useState<string>('')
  const [phase, setPhase] = useState<Phase>('lobby')
  const [exitDirection, setExitDirection] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const savedOptions = localStorage.getItem(`room:${roomId}:options`)
    const savedName = localStorage.getItem(`room:${roomId}:name`)
 
    setOptions(savedOptions ? JSON.parse(savedOptions) : HARDCODED_OPTIONS)
    setRoomName(savedName ?? 'Spontee Room')
  }, [roomId])
 
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

  if (phase === 'lobby') {
    return (
      <main className="min-h-dvh w-full flex flex-col items-center justify-center px-4 gap-6 bg-background">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
 
          {/* Room info */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">You&apos;re in</p>
            <h1 className="text-2xl font-bold">{roomName}</h1>
            <p className="text-sm text-muted-foreground">
              {options.length} option{options.length !== 1 ? 's' : ''} to decide from
            </p>
          </div>
 
          {/* Options preview */}
          {options.length > 0 && (
            <ul className="w-full space-y-2">
              {options.map((opt) => (
                <li
                  key={opt.id}
                  className="px-4 py-2.5 rounded-2xl bg-muted/50 text-sm font-medium text-left"
                >
                  {opt.text}
                </li>
              ))}
            </ul>
          )}
 
          {/* Share */}
          <div className="w-full space-y-3">
            <p className="text-xs text-muted-foreground">
              Invite others to swipe with you
            </p>
            <Button
              variant="outline"
              className="w-full rounded-2xl gap-2"
              onClick={handleCopy}
            >
              {copied
                ? <><Check className="w-4 h-4" /> Copied!</>
                : <><Copy className="w-4 h-4" /> Copy Invite Link</>
              }
            </Button>
          </div>
 
          {/* Start */}
          <Button
            className="w-full rounded-2xl"
            size="lg"
            onClick={() => setPhase('swiping')}
          >
            🚀 Start Swiping
          </Button>
 
        </div>
      </main>
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