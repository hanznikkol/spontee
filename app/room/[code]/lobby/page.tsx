'use client'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Clock3, Copy, Loader2, Play, Users } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useLobby } from '@/lib/room/lobby/hook/useLobby'
import { useClipboard } from '@/lib/room/lobby/hook/useClipboard'
import { Badge } from '@/components/ui/badge'

export default function LobbyPage() {
  const { loading, room, participants, currentParticipant, shareCode, shareUrl, handleOpenRoom, handleStartVoting } = useLobby()
  const { copiedKey, handleCopy, } = useClipboard()

  const participantCount = participants.length
  const maxParticipants = room?.max_participants ?? 0
  const isHost = currentParticipant?.is_host
  const isLobby = room?.status === "lobby"
  const isActive = room?.status === "active"
  const canOpenRoom = isHost && isLobby && participantCount >= 2
  const isRoomFull = maxParticipants > 0 && participantCount >= maxParticipants

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
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">{room?.room_name}</h1>
            <Badge variant={isActive ? "default" : "secondary"} className="rounded-full px-3">
              {isActive ? "🟢 Room Open" : "🟡 Waiting for Host"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Share the link so everyone can join
            </p>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="p-4 space-y-3">

              <div className="flex justify-between">
                <p className="text-xs uppercase text-muted-foreground">
                  Participants
                </p>
                <div className="flex items-center gap-2">
                  {isRoomFull && (
                    <Badge variant="secondary" className="rounded-full">
                      Full
                    </Badge>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {participantCount} / {maxParticipants}
                  </div>
                </div>
              </div>

              <ul className="space-y-2">
                {participants.map(m => {
                  const isMe = currentParticipant?.participant_id === m.participant_id

                  return (
                    <li
                      key={m.participant_id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50 border
                        ${isMe ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50'}`}
                    >
                      {/* avatar */}
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {m.display_name?.[0]}
                      </div>

                      {/* name */}
                      <span className="text-sm font-medium">
                        {m.display_name}
                      </span>

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


          {/* For Host */}
          {isHost && isLobby && (
            <Button
              size="lg"
              className="rounded-2xl gap-2"
              onClick={handleOpenRoom}
              disabled={!canOpenRoom || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening...
                </>
              ) : participantCount < 2 ? (
                <>
                  <Clock3 className="w-4 h-4" />
                  Waiting for Others...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Open Room
                </>
              )}
            </Button>
          )}

          {isHost && isActive && (
            <Button
              size="lg"
              className="rounded-2xl gap-2"
              onClick={handleStartVoting}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Start Voting
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}

          {/* For Guest */}
          {!isHost && isLobby && (
            <Button
              size="lg"
              disabled
              className="rounded-2xl"
            >
              <Clock3 className="w-4 h-4" />
              Waiting for Host...
            </Button>
          )}

          {!isHost && isActive && (
            <Button
              size="lg"
              className="rounded-2xl gap-2"
              onClick={handleStartVoting}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Start Voting
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">You can start anytime</p>
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