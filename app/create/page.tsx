"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { X, Plus } from "lucide-react"
import { ROOM_STATUS, RoomMode } from "@/lib/room/room-types"
import { Option } from "@/lib/options/option-types"
import { PRESET_TIME, TimePreset } from "@/lib/room/time-limits"
import { saveRoom } from "@/lib/room/actions"
import { RoomDurationSelector } from "@/components/custom/Room/RoomDurationSelector"

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

const MIN_OPTIONS = 2
const MAX_OPTIONS = 10

function CreateRoom() {
  const router = useRouter()

  const [roomName, setRoomName] = useState("")
  const [mode, setMode] = useState<RoomMode | null>(null)
  const [timePreset, setTimePreset] = useState<TimePreset | null>(null)
  const [options, setOptions] = useState<Option[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const canAddMore = options.length < MAX_OPTIONS
  const hasEnoughOptions = options.length >= MIN_OPTIONS
  
  const canCreate = !!roomName.trim() && !!mode && !!timePreset && hasEnoughOptions

  const handleAddOption = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || !canAddMore) return

    const isDuplicate = options.some(
      (o) => o.text.toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) return

    setOptions((prev) => [
      ...prev,
      {
        options_id: crypto.randomUUID(),
        room_id: "",
        text: trimmed,
        votes: 0,
      },
    ])
    setInputValue("")
  }

  const handleRemoveOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.options_id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddOption()
  }

  const handleCreate = () => {
    if (!canCreate || !mode || !timePreset) return

    setLoading(true)
    const roomId = crypto.randomUUID()

    const duration = PRESET_TIME[mode][timePreset]

    const room = {
      room_id: roomId,
      name: roomName.trim(),
      mode,
      status: ROOM_STATUS.LOBBY,
      time_preset: timePreset,
      duration_seconds: duration,
      ends_at: null,
      created_at: new Date().toISOString(),
      options,
    }

    saveRoom(room)

    // Route to lobby first, not directly to swipe
    router.push(`/room/${roomId}/lobby`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-40 w-md h-112 bg-blue-400/30 rounded-full blur-3xl" />

      <Card className="w-full max-w-md rounded-3xl backdrop-blur bg-background/70 border">
        <CardContent className="p-8 space-y-6">

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Create a Room</h1>
            <p className="text-sm text-muted-foreground">
              Start deciding with your group
            </p>
          </div>

          <div className="space-y-5">

            {/* ROOM NAME */}
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input
                placeholder={
                  mode === 'couple'
                    ? 'e.g. Date night ideas, Netflix & Chill'
                    : mode === 'group'
                    ? 'e.g. Barkada outing, Family Reunion'
                    : 'e.g. Saan tayo?'
                }
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
                {MODES.map((m) => (
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

            {/* ROOM DURATION SELECTOR */}

            {mode && (
               <RoomDurationSelector
                mode={mode}
                value={timePreset}
                onChange={setTimePreset}
              />
            )}
           
            {/* OPTIONS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <span className={cn(
                  "text-xs tabular-nums transition-colors",
                  options.length >= MAX_OPTIONS
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}>
                  {options.length}/{MAX_OPTIONS}
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Jollibee, Beach, Netflix..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!canAddMore}
                  className="rounded-xl flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleAddOption}
                  disabled={!inputValue.trim() || !canAddMore}
                  className="rounded-xl shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {options.length > 0 && (
                <ul className="space-y-2 mt-1">
                  {options.map((opt) => (
                    <li
                      key={opt.options_id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/50 text-sm"
                    >
                      <span className="truncate">{opt.text}</span>
                      <button
                        onClick={() => handleRemoveOption(opt.options_id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!hasEnoughOptions && (
                <p className="text-xs text-muted-foreground">
                  Add at least {MIN_OPTIONS - options.length} more option
                  {MIN_OPTIONS - options.length !== 1 ? 's' : ''} to continue
                </p>
              )}
            </div>

          </div>

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

          <p className="text-xs text-center text-muted-foreground">
            You&apos;ll get a shareable link after creating
          </p>

        </CardContent>
      </Card>
    </main>
  )
}

export default CreateRoom