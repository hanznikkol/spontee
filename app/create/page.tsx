"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

function CreateRoom() {
  const router = useRouter()

  const [roomName, setRoomName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreate = () => {
    if (!roomName) return

    setLoading(true)
    // simulate room creation
    const roomID = crypto.randomUUID()

    // redirect to room
    router.push(`/room/${roomID}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* FUN BACKGROUND */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-40 w-md h-112 bg-blue-400/30 rounded-full blur-3xl" />

      <Card className="w-full max-w-md rounded-3xl backdrop-blur bg-background/70 border">
        <CardContent className="p-8 space-y-6">

          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Create a Room</h1>
            <p className="text-sm text-muted-foreground">
              Start deciding with your group
            </p>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            {/* ROOM NAME */}
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input
                placeholder="e.g. Date night ideas 🍜"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
          </div>

          {/* ACTION */}
          {loading ?(
            <Button className="w-full rounded-2xl" size="lg" disabled>
              <Spinner className="mr-2" />
              Creating...
            </Button>
            ):(
            <Button
              className="w-full rounded-2xl"
              size="lg"
              onClick={handleCreate}
              disabled={!roomName}
            >
            🚀 Create Room
            </Button>
            )
          }
          
          {/* FOOTER */}
          <p className="text-xs text-center text-muted-foreground">
            You’ll get a shareable link after creating
          </p>

        </CardContent>
      </Card>
    </main>
  )
}

export default CreateRoom