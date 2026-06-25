"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"

export default function HostPage() {
  const router = useRouter()
  const [hostName, setHostName] = useState("")

  const handleContinue = () => {
    if (!hostName.trim()) return

    sessionStorage.setItem("hostName", hostName.trim())
    router.push(`/create`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl">
        <CardContent className="p-6 space-y-4">

          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              👤
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                You&apos;re the Host
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Pick a display name. Everyone in the room will see it.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Host name</Label>
            <Input
              placeholder="e.g. John123, TheCreator6"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            />
          </div>

          <Button
            className="w-full"
            disabled={!hostName.trim()}
            onClick={handleContinue}
          >
            Continue
            <ArrowRight/>
          </Button>

        </CardContent>
      </Card>

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-40 w-md h-112 bg-blue-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
    </div>
  )
}