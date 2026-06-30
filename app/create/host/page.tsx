"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"
import { SetupProgress } from "@/components/custom/RoomCreation/RoomSetupProgress"
import { saveHostName } from "@/lib/room/create/room-save"
import HostHeader from "@/components/custom/RoomCreation/Host/HostHeader"

export default function HostPage() {
  const router = useRouter()
  const [hostName, setHostName] = useState("")
  const isValidName = hostName.trim().length >= 2

  const handleContinue = () => {
    if (!hostName.trim()) return

    saveHostName(hostName.trim())
    router.push(`/create/room`)
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

            <div className="space-y-2">
              <Label>Host name</Label>
              <Input
                autoFocus
                maxLength={20}
                placeholder="e.g. John, Mom, Team Captain"
                value={hostName}
                onChange={(e) => setHostName(e.target.value.slice(0,20))}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              />
            </div>

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