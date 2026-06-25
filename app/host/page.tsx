"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function HostPage() {
  const router = useRouter()
  const [hostName, setHostName] = useState("")

  const handleContinue = () => {
    if (!hostName.trim()) return

    // pass host name via query
    router.push(`/create?host=${encodeURIComponent(hostName.trim())}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl">
        <CardContent className="p-6 space-y-4">

          <div className="space-y-1">
            <h1 className="text-xl font-bold">Host Setup</h1>
            <p className="text-sm text-muted-foreground">
              What should we call you as the host?
            </p>
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
            I’m the host
          </Button>

        </CardContent>
      </Card>
    </main>
  )
}