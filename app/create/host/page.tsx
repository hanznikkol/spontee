"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import HostHeader from "@/components/custom/RoomCreation/Host/HostHeader"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import NameInput from "@/components/custom/Room/NameInput"
import { SetupProgress } from "@/components/custom/RoomCreation/Setup/SetupProgress"

export default function HostPage() {
  const router = useRouter()
  const hostName = useCreateRoomStore((state) => state.hostName)
  const setHostName = useCreateRoomStore((state) => state.setHostName)
  
  const isValidName = hostName.trim().length >= 2

  const handleContinue = () => {
    if (!hostName.trim()) return
    router.replace(`/create/room`)
  }

  return (
    <div className="grid grid-rows-[auto_1fr] px-4 pt-8 min-h-dvh">
      {/* Progress */}  
      <div className="mx-auto w-full max-w-md">
        <SetupProgress step={1} total={3} />
      </div>

      {/* Main */}
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="p-6 space-y-6">

            <HostHeader/>

            <NameInput
              title="Host Name"
              placeholder="e.g. John, Mom, Team Captain"
              value = {hostName}
              onChange={(e) => setHostName(e.target.value.slice(0,20))}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            />

            <Button
              className="w-full"
              disabled={!isValidName}
              onClick={handleContinue}
            >
              Continue
              <ArrowRight/>
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}