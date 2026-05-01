"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const MODES: { id: RoomMode; emoji: string; label: string; desc: string }[] = [
    {
      id: 'couple',
      emoji: '👩‍❤️‍👨',
      label: 'For Two',
      desc: 'Perfect for dates & couples',
    },
    {
      id: 'group',
      emoji: '👯',
      label: 'For Group',
      desc: 'Barkada, family & friends',
    },
]

function CreateRoom() {
  const router = useRouter()

  const [roomName, setRoomName] = useState("")
  const [mode, setMode] = useState<RoomMode | null>(null)
  const [loading, setLoading] = useState(false)

  const canCreate = !!roomName.trim() && !!mode

  const handleCreate = () => {
    if (!canCreate) return

    setLoading(true)
    const roomID = crypto.randomUUID()

    // redirect to room
    router.push(`/room/${roomID}?mode=${mode}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* BLOB BACKGROUND */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-40 w-md h-112 bg-blue-400/30 rounded-full blur-3xl" />

      <Card className="w-full max-w-md rounded-3xl backdrop-blur bg-background/70 border">
        <CardContent className="p-8 space-y-6">

          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Create a Room</h1>
            <p className="text-sm text-muted-foreground">
              Start deciding with your group
            </p>
          </div>

          {/* FORM CARD */}
          <div className="space-y-5">

            {/* ROOM NAME */}
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input placeholder={mode === 'couple'
                    ? 'e.g. Date night ideas, Netflix & Chill'
                    : mode === 'group'
                    ? 'e.g. Barkada outing, Family Reunion'
                    : 'e.g. Saan tayo?'}
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    className="rounded-xl"
              />
            </div>

            {/* MODE SELECTOR */}
            <div className="space-y-2">
              <Label>Who&apos;s deciding</Label>
              <div className="grid grid-cols-2 gap-3">
                {MODES.map(m => (
                   <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all text-center",
                      mode === m.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                    )}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="font-semibold text-sm">{m.label}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION */}
          <Button
            className="w-full rounded-2xl"
            size="lg"
            onClick={handleCreate}
            disabled={!canCreate || loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              '🚀 Create Room'
            )}
          </Button>
          
          {/* FOOTER */}
          <p className="text-xs text-center text-muted-foreground">
            You&apos;ll get a shareable link after creating
          </p>

        </CardContent>
      </Card>
    </main>
  )
}

export default CreateRoom