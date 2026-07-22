"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { ensureAnonUser } from "@/lib/user/services/auth.service"
import { ArrowRight, Loader2, Users } from "lucide-react"
import { extractRoomCode } from "@/lib/room/join/join"
import NameInput from "@/components/custom/Room/NameInput"
import RoomLinkInput from "@/components/custom/RoomJoin/RoomLinkInput"
import QRScannerCard from "@/components/custom/RoomJoin/QRScannerCard"

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
    const roomCode = extractRoomCode(roomValue, window.location.origin)

    if (!name) {
      setFeedback("Please enter your name first.")
      return
    }

    if (!roomCode) {
      setFeedback("Paste a room link or room code from the host.")
      return
    }

    setJoining(true)
    setFeedback("")

    try {
      const user = await ensureAnonUser()

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("room_id, room_code")
        .eq("room_code", roomCode)
        .single()

      if (roomError || !room) {
        throw new Error("We couldn’t find that room. Check the link or QR code.")
      }

      const { error: participantError } = await supabase
        .from("participants")
        .upsert({
          room_id: room.room_id,
          user_id: user.id,
          display_name: name,
          is_host: false,
      })  

      if (participantError) {
        throw participantError
      }

      router.push(`/room/${room.room_code}/lobby`)
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
              
              <NameInput
                title="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoin()
                  }
                }}
                placeholder="e.g. John, Anna"
              />

              <RoomLinkInput value={roomValue} onChange={(e) => setRoomValue(e.target.value)}/>

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

          <QRScannerCard
            uploading={uploading}
            fileInputRef={fileInputRef}
            onUpload={handleQrUpload}
            onScan={(value) => setRoomValue(value)}
          />
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
