"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
import { RoomHeader } from "@/components/custom/RoomCreation/Room/RoomHeader"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import NameInput from "@/components/custom/Room/NameInput"
import { SetupProgress } from "@/components/custom/RoomCreation/Preferences/SetupProgress"
import RoomMaxParticipants from "@/components/custom/RoomCreation/Room/RoomMaxParticipants"

export default function CreateRoomPage() {
  const router = useRouter()
  const hostName = useCreateRoomStore((state) => state.hostName)
  const setHostName = useCreateRoomStore((state) => state.setHostName)
  const roomName = useCreateRoomStore((state) => state.roomName)
  const setRoomName = useCreateRoomStore((state) => state.setRoomName)
  const maxParticipants = useCreateRoomStore((state) => state.maxParticipants)
  const setMaxParticipants = useCreateRoomStore(
    (state) => state.setMaxParticipants
  )

  const isValidName = hostName.trim().length >= 2

  const handleContinue = () => {
    const trimmedHost = hostName.trim()
    if (trimmedHost.length < 2) return
    if (!roomName.trim()) {
      setRoomName(`${trimmedHost}'s Room`)
    }
    router.replace(`/create/preferences`)
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
            <span className="text-xl font-bold tracking-tight text-foreground">
              Spont
              <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ee
              </span>
            </span>
          </Link>
        </div>

        {/* STEPPER PROGRESS */}
        <SetupProgress step={1} total={3} />

        {/* MAIN FORM CARD */}
        <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
          <CardContent className="p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
            <RoomHeader />

            <div className="space-y-4 sm:space-y-5">
              {/* HOST DISPLAY NAME */}
              <div className="space-y-1.5">
                <NameInput
                  title="Your Name"
                  placeholder="e.g. Maya, Alex"
                  value={hostName}
                  required
                  onChange={(e) => setHostName(e.target.value.slice(0, 20))}
                  onKeyDown={(e) =>
                    e.key === "Enter" && isValidName && handleContinue()
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 2 characters. Your friends will see this in the lobby.
                </p>
              </div>

              {/* ROOM NAME (OPTIONAL WITH AUTO-DEFAULT) */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="room-name"
                  className="text-sm font-semibold flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    Room Name
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </Label>
                <Input
                  id="room-name"
                  placeholder="e.g. Friday Hangout, Dinner with Friends"
                  value={roomName}
                  maxLength={40}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && isValidName && handleContinue()
                  }
                  className="h-10 sm:h-11 rounded-2xl border-border/80 text-sm px-3.5"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use &quot;
                  {hostName.trim() ? `${hostName.trim()}'s Room` : "Your Name's Room"}
                  &quot;.
                </p>
              </div>

              {/* GROUP SIZE LIMIT */}
              <RoomMaxParticipants
                value={maxParticipants}
                onChange={setMaxParticipants}
                min={2}
                max={25}
              />
            </div>

            <Button
              className="w-full h-11 sm:h-12 rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
              size="lg"
              disabled={!isValidName}
              onClick={handleContinue}
            >
              Continue to Preferences
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* FOOTER ACTIONS */}
        <div className="text-center space-y-2 text-xs text-muted-foreground pt-1">
          <p>
            Looking to join a room instead?{" "}
            <Link
              href="/join"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-pink-500 transition-colors"
            >
              Join with code
            </Link>
          </p>

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}