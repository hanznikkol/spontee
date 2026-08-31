"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import RoomSetupHeader from "@/components/custom/RoomCreation/Setup/RoomSetupHeader"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import RoomMaxParticipants from "@/components/custom/RoomCreation/Setup/RoomMaxParticipants"
import { SetupProgress } from "@/components/custom/RoomCreation/Setup/SetupProgress"
import { RoomMaxOptions } from "@/components/custom/RoomCreation/Setup/RoomMaxOptions"

export default function RoomSetup() {
  const router = useRouter()

  // Zustand Store
  const setRoomName = useCreateRoomStore((state) => state.setRoomName)
  const setMaxParticipants = useCreateRoomStore(
    (state) => state.setMaxParticipants
  )
  const setMaxOptions = useCreateRoomStore((state) => state.setMaxOptions)

  const maxParticipants = useCreateRoomStore((state) => state.maxParticipants)
  const maxOptions = useCreateRoomStore((state) => state.maxOptions)
  const roomName = useCreateRoomStore((state) => state.roomName)

  const canContinue = !!roomName.trim()

  const handleNext = () => {
    if (!canContinue) return
    router.replace("/create/preference")
  }

  const handleBack = () => {
    router.replace("/create/host")
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between px-3.5 sm:px-6 md:px-8 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md space-y-4 sm:space-y-5">
        {/* BRAND WORDMARK */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 transition-transform active:scale-95"
          >
            <span className="text-xl font-bold tracking-tight">
              Spont
              <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ee
              </span>
            </span>
          </Link>
        </div>

        {/* BACK ACTION & PROGRESS BAR */}
        <div className="space-y-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="rounded-xl px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors -ml-1 h-8"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Host Name
          </Button>

          <SetupProgress step={2} total={3} />
        </div>

        {/* MAIN FORM CARD */}
        <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
          <CardContent className="p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
            <RoomSetupHeader />

            <div className="space-y-4 sm:space-y-5">
              {/* ROOM NAME */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="room-name"
                  className="text-sm font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  Room Name
                </Label>
                <Input
                  id="room-name"
                  placeholder="e.g. Date Night, Friday Hangout, Team Lunch"
                  value={roomName}
                  maxLength={40}
                  autoFocus
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && canContinue && handleNext()
                  }
                  className="h-10 sm:h-11 rounded-2xl border-border/80 text-sm px-3.5"
                />
                <p className="text-xs text-muted-foreground">
                  Give your session a memorable title.
                </p>
              </div>

              {/* PARTICIPANT LIMIT */}
              <RoomMaxParticipants
                value={maxParticipants}
                onChange={setMaxParticipants}
                min={2}
                max={25}
              />

              {/* OPTIONS COUNT */}
              <RoomMaxOptions
                maxOptions={maxOptions}
                onChange={setMaxOptions}
              />
            </div>

            {/* CONTINUE CTA */}
            <div className="space-y-2.5 pt-1">
              <Button
                className="w-full h-11 sm:h-12 rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
                size="lg"
                onClick={handleNext}
                disabled={!canContinue}
              >
                Continue to Preferences
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                You&apos;ll get an invite link & QR code after creating.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
