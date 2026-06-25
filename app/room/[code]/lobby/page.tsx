'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Copy, Users, ArrowRight } from 'lucide-react'
import { RoomMode } from '@/lib/room/room-types'
import { supabase } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'
import { Participants } from '@/lib/user/participants'
import { RealtimeChannel } from '@supabase/supabase-js'

export default function LobbyPage() {
  const params = useParams()
  const code = typeof params.code === "string" ? params.code : ""
  const searchParams = useSearchParams()
  const router = useRouter()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const mode = searchParams.get('mode') as RoomMode | null

  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [participants, setParticipants] = useState<Participants[]>([])
  const [me, setMe] = useState<Participants | null>(null)

  const [editingName, setEditingName] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")
  const [roomName, setRoomName] = useState('')

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?room=${code}` : ''

  const shareCode = code

  useEffect(() => {
    if (!code) return

    let cancelled = false

    const loadRoom = async () => {
      const normalizedCode = code.toString().trim().toUpperCase()

      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', normalizedCode)
        .single()

      if (!room || cancelled) return

      setRoomName(room.room_name)

      const { data: initialParticipants } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', room.room_id)

      if (initialParticipants) {
        setParticipants(initialParticipants)
      }

      // CLEAN OLD CHANNEL FIRST
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      const channel = supabase
        .channel(`participants-${room.room_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'participants',
            filter: `room_id=eq.${room.room_id}`,
          },
          (payload) => {
            const newRow = payload.new as Participants
            const oldRow = payload.old as Participants

            setParticipants((prev) => {
              if (payload.eventType === 'INSERT') {
                if (prev.some(p => p.participant_id === newRow.participant_id)) {
                  return prev
                }
                return [...prev, newRow]
              }

              if (payload.eventType === 'DELETE') {
                return prev.filter(p => p.participant_id !== oldRow.participant_id)
              }

              if (payload.eventType === 'UPDATE') {
                return prev.map(p =>
                  p.participant_id === newRow.participant_id ? newRow : p
                )
              }

              return prev
            })
          }
        )

      channel.subscribe()

      channelRef.current = channel
    }

    loadRoom()

    return () => {
      cancelled = true

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [code])

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)

      setCopiedKey(key)

      setTimeout(() => {
        setCopiedKey(null)
      }, 3000)
    } catch (err) {
      console.log("Copy failed", err)
    }
  }

  const handleStart = () => {
    localStorage.setItem(`room:${code}:status`, 'active')
    router.push(`/room/${code}?mode=${mode}`)
  }

  const modeLabel = mode === 'couple' ? 'For Two' : 'Group'

  return (
    <main className="min-h-dvh w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">

      {/* background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col gap-4"
        >
          <div className="text-center space-y-1">
            <Badge variant="secondary">{modeLabel}</Badge>
            <h1 className="text-2xl font-bold">{roomName}</h1>
            <p className="text-sm text-muted-foreground">
              Share the link so everyone can join
            </p>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="p-4 space-y-3">

              <div className="flex justify-between">
                <p className="text-xs uppercase text-muted-foreground">
                  Members
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {participants.length}
                  {mode === 'couple' && '/2'}
                </div>
              </div>

              <ul className="space-y-2">
                {participants.map(m => {
                  const isMe = me?.participant_id === m.participant_id

                  return (
                    <li
                      key={m.participant_id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50 border
                        ${isMe ? 'border-primary' : 'border-transparent'}`}
                    >
                      {/* avatar */}
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {m.display_name?.[0]}
                      </div>

                      {/* name */}
                      {editingName === m.participant_id && isMe ? (
                        <input
                          autoFocus
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => updateDisplayName(m.participant_id, tempValue)}
                          className="text-sm font-medium bg-transparent border-b outline-none"
                        />
                      ) : (
                        <span
                          className={`text-sm font-medium ${isMe ? 'cursor-pointer' : ''}`}
                          onClick={() => {
                            if (!isMe) return
                            setEditingName(m.participant_id)
                            setTempValue(m.display_name)
                          }}
                        >
                          {m.display_name}
                        </span>
                      )}

                      {/* HOST TAG */}
                      {m.is_host && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          Host
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="rounded-2xl gap-2 cursor-pointer"
            onClick={handleStart}
          >
            Start Now <ArrowRight />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {mode === 'couple'
              ? 'Both of you need to be here before starting'
              : 'You can start anytime'}
          </p>
        </motion.div>

        {/* DIVIDER */}
        <div className="hidden md:flex items-center">
          <div className="w-px h-full bg-border" />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-sm">

            <div className="absolute inset-0 bg-linear-to-br from-pink-400/30 via-fuchsia-400/20 to-blue-400/30 blur-3xl scale-110 rounded-[3rem]" />
            <div className="absolute -inset-px rounded-[2rem] bg-linear-to-br from-pink-400/40 via-transparent to-blue-400/40 opacity-70" />

            <Card className="relative rounded-[2rem] border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center gap-6">

                {/* HEADER */}
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Invite Others</h2>
                  <p className="text-sm text-muted-foreground">
                    Share code or scan QR to join
                  </p>
                </div>

                {/* ROOM CODE */}
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Room Code
                  </p>

                  <div className="relative group inline-flex items-center justify-center">
                    
                    {/* glow background */}
                    <div className="absolute inset-0 bg-linear-to-r from-pink-400/20 via-fuchsia-400/20 to-blue-400/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition" />

                    {/* main box */}
                    <div className="relative flex items-center gap-3 px-5 py-3 rounded-2xl border bg-background/70 backdrop-blur-md shadow-sm">
                      
                      {/* code */}
                      <span className="text-lg md:text-xl font-mono font-bold tracking-[0.3em] text-foreground">
                        {shareCode}
                      </span>

                      {/* divider */}
                      <div className="w-px h-6 bg-border" />

                      {/* copy button */}
                      <button
                        onClick={() => handleCopy(shareCode, "code")}
                        className="text-xs font-medium px-2 py-1 text-primary transition flex items-center gap-1"
                      >
                        {copiedKey === "code" ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {/* QR */}
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-br from-pink-400/20 to-blue-400/20 blur-2xl scale-125 rounded-full" />

                  <div className="relative p-4 bg-white rounded-[1.5rem] shadow-xl">
                    <QRCodeSVG value={shareUrl} size={190} level="H" />
                  </div>
                </div>

                {/* LINK */}
                <div className="w-full space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Direct Link
                  </p>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border w-full">
                    <span className="text-xs truncate flex-1 font-mono">
                      {shareUrl || 'Loading...'}
                    </span>

                    <button
                      onClick={() => handleCopy(shareUrl, "link")}
                      className="shrink-0 text-xs font-medium text-primary hover:opacity-70"
                    >
                      {copiedKey === "link" ? (
                        <>
                          <Check className="w-3 h-3 inline mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 inline mr-1" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </main>
  )
}