'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Copy, Users, ArrowRight, Clock } from 'lucide-react'
import { Option } from '@/lib/options/option-types'
import { RoomMode } from '@/lib/room/room-types'

// Simulated "other user" for demo purposes
// Swap with Supabase Realtime presence when ready
const DEMO_MEMBERS = [
  { id: 'you', name: 'You', isYou: true },
]

export default function LobbyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = params.id as string
  const mode = searchParams.get('mode') as RoomMode | null

  const [copied, setCopied] = useState(false)
  const [members, setMembers] = useState(DEMO_MEMBERS)
  const [roomName, setRoomName] = useState('Your Room')
  const [options, setOptions] = useState<Option[]>([])

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomId}`
    : ''

  // Load room data from localStorage (swap with Supabase query later)
  useEffect(() => {
    const savedName = localStorage.getItem(`room:${roomId}:name`)
    const savedOptions = localStorage.getItem(`room:${roomId}:options`)

    if (savedName) setRoomName(savedName)
    if (savedOptions) {
      try { setOptions(JSON.parse(savedOptions)) } catch { /* noop */ }
    }
  }, [roomId])

  // Simulate second person joining after 3s (demo only — remove with Supabase)
  useEffect(() => {
    if (mode !== 'couple') return
    const t = setTimeout(() => {
      setMembers(prev => [
        ...prev,
        { id: 'partner', name: 'Partner', isYou: false },
      ])
    }, 3000)
    return () => clearTimeout(t)
  }, [mode])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStart = () => {
    // Mark room as active in localStorage (swap with Supabase update later)
    localStorage.setItem(`room:${roomId}:status`, 'active')
    router.push(`/room/${roomId}?mode=${mode}`)
  }

  const modeLabel = mode === 'couple' ? 'For Two' : 'Group'
  const requiredToStart = mode === 'couple' ? 2 : 1
  const canStart = members.length >= requiredToStart || mode === 'group'

  return (
    <main className="min-h-dvh w-full flex flex-col items-center justify-center px-4 gap-5 bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <Badge variant="secondary" className="mb-2">{modeLabel}</Badge>
          <h1 className="text-2xl font-bold">{roomName}</h1>
          <p className="text-sm text-muted-foreground">
            Share the link so everyone can join
          </p>
        </div>

        {/* Share link card */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Room Link
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border">
              <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                {shareUrl || 'Loading...'}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:opacity-70 transition-opacity"
              >
                {copied
                  ? <><Check className="w-3 h-3" /> Copied!</>
                  : <><Copy className="w-3 h-3" /> Copy</>
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Members card */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Members
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{members.length}</span>
                {mode === 'couple' && <span>/ 2</span>}
              </div>
            </div>

            <ul className="space-y-2">
              {members.map((m) => (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {m.name[0]}
                  </div>
                  <span className="text-sm font-medium">{m.name}</span>
                  {m.isYou && (
                    <span className="ml-auto text-xs text-muted-foreground">You</span>
                  )}
                </motion.li>
              ))}

              {/* Waiting slot for couple mode */}
              {mode === 'couple' && members.length < 2 && (
                <li className="flex items-center gap-3 px-3 py-2 rounded-xl border border-dashed">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">Waiting for partner...</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Options preview */}
        {options.length > 0 && (
          <Card className="rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Options ({options.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <span
                    key={opt.id}
                    className="px-2.5 py-1 rounded-lg bg-muted/50 text-xs font-medium"
                  >
                    {opt.text}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start button */}
        <Button
          size="lg"
          className="w-full rounded-2xl gap-2"
          onClick={handleStart}
          disabled={!canStart}
        >
          {canStart ? (
            <>Start Swiping <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>Waiting for partner...</>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {mode === 'couple'
            ? 'Both of you need to be here before starting'
            : 'You can start anytime — others can join mid-session'}
        </p>
      </motion.div>
    </main>
  )
}