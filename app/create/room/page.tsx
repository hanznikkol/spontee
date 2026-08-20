"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import RoomSetupHeader from "@/components/custom/RoomCreation/Setup/RoomSetupHeader"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import RoomMaxParticipants from "@/components/custom/RoomCreation/Setup/RoomMaxParticipants"
import { SetupProgress } from "@/components/custom/RoomCreation/Setup/SetupProgress"

function RoomSetup() {
  const router = useRouter()
  // Zustand Store
  const setRoomName = useCreateRoomStore((state) => state.setRoomName)
  const setMaxParticipants = useCreateRoomStore((state) => state.setMaxParticipants)

  const maxParticipants = useCreateRoomStore((state) => state.maxParticipants)
  const roomName = useCreateRoomStore((state) => state.roomName)

  const canContinue = !!roomName.trim()

  const handleNext = async () => {
    if (!canContinue) return
    router.push("/create/preference")
  }

  const handleBack = () => {
    router.push("/create/host")
  }
  
  return (
    <main className="relative overflow-hidden px-4 py-6 md:py-10 min-h-dvh">

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
                    'e.g. Date Night, Barkada Outing, Family Gatherings'
                  }
                  value={roomName}
                  maxLength={40}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="rounded-xl"
                />
              </div>

              <RoomMaxParticipants
                value={maxParticipants}
                onChange={setMaxParticipants}
                min={2}
                max={25}
              />

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
