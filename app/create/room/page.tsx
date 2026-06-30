"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Lock, Users } from "lucide-react"
import { RoomMode, RoomVisibilityTypes } from "@/lib/room/create/room-types"
import { TimePreset } from "@/lib/room/create/time-limits"
import { RoomDurationSelector } from "@/components/custom/RoomCreation/Setup/RoomDurationSelector"
import { RoomModeSelector } from "@/components/custom/RoomCreation/Setup/RoomModeSelector"
import { SetupProgress } from "@/components/custom/RoomCreation/RoomSetupProgress"
import { MODES } from "@/lib/room/create/room-modes"
import { RoomVisibility } from "@/components/custom/RoomCreation/Setup/RoomVisibility"
import { saveRoomSetup } from "@/lib/room/create/room-save"
import RoomSetupHeader from "@/components/custom/RoomCreation/Setup/RoomSetupHeader"

function RoomSetup() {
  const router = useRouter()
  const roomSetup = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("roomSetup") ?? "{}") : {}
  const [roomName, setRoomName] = useState(roomSetup.roomName ?? "")
  const [roomVisibility, setRoomVisibility] = useState<RoomVisibilityTypes>(roomSetup.roomVisibility ?? "public")
  const [roomPassword, setRoomPassword] = useState(roomSetup.roomPassword ?? "")
  const [mode, setMode] = useState<RoomMode | null>(roomSetup.mode ?? null)
  const [timePreset, setTimePreset] = useState<TimePreset | null>(roomSetup.timePreset ?? null)

  const canContinue = !!roomName.trim() && !!mode && !!timePreset && ( roomVisibility === "public" || roomPassword.length >= 4 )

  const handleNext = async () => {
    if (!canContinue) return
    saveRoomSetup({
      roomName,
      roomVisibility,
      roomPassword,
      mode,
      timePreset,
    })

    router.push("/create/options")
  }

  const handleBack = () => {
    saveRoomSetup({
      roomName,
      roomVisibility,
      roomPassword,
      mode,
      timePreset,
    })

    router.push("/create/host")
  }
  
  return (
    <main className="relative overflow-hidden px-4 py-6 md:py-10">

      {/* Progress Bar */}
      <div className="mx-auto w-full max-w-md space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="w-fit px-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <SetupProgress step={2} total={3} />
      </div>

      <div className="flex justify-center items-center mt-4">
        <Card className="w-full max-w-md rounded-3xl backdrop-blur bg-background/70 border">
          <CardContent className="p-6 space-y-6">
          <RoomSetupHeader/>

            <div className="space-y-5">
              {/* ROOM NAME */}
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input
                  placeholder={
                    mode === 'couple' ? 'e.g. Date night ideas, Netflix & Chill' : mode === 'group' ? 'e.g. Barkada outing, Family Reunion' : 'e.g. Date night ideas, Barkada outing...'
                  }
                  value={roomName}
                  maxLength={40}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="rounded-xl"
                />
              </div>

              {/* VISIBILITY */}
              <RoomVisibility value={roomVisibility} onChange={setRoomVisibility}/> 
              {roomVisibility === "private" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Password</Label>
                    <Lock className="w-4 h-4 text-muted-foreground"/>
                  </div>
                  
                  <Input
                    type="password"
                    placeholder="Set room password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              )}

              {/* MODE SELECTOR */}
              <RoomModeSelector
                value={mode}
                onChange={setMode}
                options={MODES}
              />
            
              {/* ROOM DURATION SELECTOR */}
              {mode && (
                <RoomDurationSelector
                  mode={mode}
                  value={timePreset}
                  onChange={setTimePreset}
                />
              )}

            </div>

            <Button
              className="w-full rounded-2xl cursor-pointer"
              size="lg"
              onClick={handleNext}
              disabled={!canContinue}
            >
              Continue
              <ArrowRight className="w-4 h-4"/>
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You&apos;ll get a shareable link after creating
            </p>

          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default RoomSetup
