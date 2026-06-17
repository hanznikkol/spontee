"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { ensureUser } from "@/lib/user/ensure-user"
import { ArrowRight, Loader2, Upload, Users } from "lucide-react"

function extractRoomId(value: string, baseUrl: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  try {
    const parsedUrl = new URL(trimmed, baseUrl)
    const queryRoom = parsedUrl.searchParams.get("room")
    if (queryRoom) return queryRoom

    const segments = parsedUrl.pathname.split("/").filter(Boolean)
    const roomIndex = segments.indexOf("room")
    if (roomIndex !== -1 && segments[roomIndex + 1]) {
      return segments[roomIndex + 1]
    }
  } catch {
  }

  return trimmed.replace(/^\/+/, "")
}

type BarcodeDetectorResult = { rawValue: string }

type BarcodeDetectorInstance = {
  detect: (source: HTMLImageElement) => Promise<BarcodeDetectorResult[]>
}

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRoom = searchParams.get("room") ?? ""

  const [displayName, setDisplayName] = useState("")
  const [roomValue, setRoomValue] = useState(() => initialRoom)
  const [joining, setJoining] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState("")

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const decodeQrFromFile = async (file: File) => {
    if (!("BarcodeDetector" in window)) {
      throw new Error("QR scanning from uploads is not supported in this browser.")
    }

    const BarcodeDetector = window.BarcodeDetector as unknown as BarcodeDetectorConstructor
    const detector = new BarcodeDetector({ formats: ["qr_code"] })
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    try {
      const result = await new Promise<HTMLImageElement>((resolve, reject) => {
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("Could not read that image."))
        image.src = objectUrl
      })

      const codes = await detector.detect(result)
      const rawValue = codes[0]?.rawValue

      if (!rawValue) {
        throw new Error("No QR code was found in that image.")
      }

      setRoomValue(rawValue)
      setFeedback("QR code loaded. You can join now.")
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }

  const handleQrUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setFeedback("")

    try {
      await decodeQrFromFile(file)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to read that QR image.")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const handleJoin = async () => {
    const name = displayName.trim()
    const roomId = extractRoomId(roomValue, window.location.origin)

    if (!name) {
      setFeedback("Please enter your name first.")
      return
    }

    if (!roomId) {
      setFeedback("Paste a room link or room code from the host.")
      return
    }

    setJoining(true)
    setFeedback("")

    try {
      const user = await ensureUser()
      sessionStorage.setItem("session_id", user.id)
      sessionStorage.setItem("display_name", name)

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("room_id, room_name")
        .eq("room_id", roomId)
        .single()

      if (roomError || !room) {
        throw new Error("We couldn’t find that room. Check the link or QR code.")
      }

      const { error: participantError } = await supabase.from("participants").insert({
        room_id: room.room_id,
        user_id: user.id,
        display_name: name,
        is_host: false,
        session_id: user.id,
      })

      if (participantError) {
        throw participantError
      }

      router.push(`/room/${room.room_id}/lobby`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to join the room right now.")
    } finally {
      setJoining(false)
    }
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="text-center space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Guest join flow
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Join a host’s room</h1>
          <p className="text-sm text-muted-foreground">
            Enter your name, paste the host link, or scan their QR code to get in fast.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="display-name">Your name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="e.g. John"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-link">Room link or code</Label>
                <Input
                  id="room-link"
                  value={roomValue}
                  onChange={(event) => setRoomValue(event.target.value)}
                  placeholder="Paste the host's link or room ID"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  We accept full links like <span className="font-mono">/join?room=abc</span>, <span className="font-mono">/room/abc/lobby</span>, or just the room ID.
                </p>
              </div>

              {feedback && (
                <div className="rounded-2xl bg-muted/60 border border-red-500 text-red-500 px-4 py-3 text-sm">
                  {feedback}
                </div>
              )}

              <Button
                className="w-full rounded-2xl gap-2"
                size="lg"
                onClick={handleJoin}
                disabled={joining}
              >
                {joining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Room
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-dashed">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Upload QR instead</h2>
                <p className="text-sm text-muted-foreground">
                  Upload a screenshot or photo of the host’s QR code and we’ll decode it for you.
                </p>
              </div>

              <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Choose a QR image</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or HEIC screenshots work best.
                  </p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="rounded-xl"
                />
              </div>

              <div className="flex">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-2xl gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Reading..." : "Upload QR"}
                </Button>
              </div>

              <div className="rounded-2xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                If the QR image doesn’t work, paste the host link above instead.
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Need to host instead?{" "}
          <button type="button" className="font-medium text-foreground underline underline-offset-4" onClick={() => router.push("/create")}>
            Go to create
          </button>
        </p>
      </div>
    </main>
  )
}
