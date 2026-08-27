"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Loader2, Users } from "lucide-react"
import { extractRoomCode } from "@/lib/room/join/join"
import NameInput from "@/components/custom/Room/NameInput"
import RoomLinkInput from "@/components/custom/RoomJoin/RoomLinkInput"
import { useJoinRoom } from "@/lib/room/join/hook/useJoinRoom"

function JoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRoom = searchParams.get("room") ?? ""
  
  const [displayName, setDisplayName] = useState("")
  const [roomValue, setRoomValue] = useState(initialRoom)
  const {join, joining, feedback} = useJoinRoom()
  
  const handleJoin = async () => {
    const name = displayName.trim()
    const roomCode = extractRoomCode(roomValue, window.location.origin)

    if (!name || !roomCode) return

    try {
      const room = await join({
        roomCode,
        displayName: name,
      })

      console.log("JOIN SUCCESS:", room)

      router.push(`/room/${room.room_code}/lobby`)
    } catch (error) {
      return error
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
             Enter your name and join the room through the host&apos;s invite.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="rounded-3xl">
            <CardContent className="space-y-5 p-6">
              
              <NameInput
                title="Your Name"
                value={displayName}
                required
                onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoin()
                  }
                }}
                placeholder="e.g. John, Anna"
              />

              <RoomLinkInput value={roomValue} 
                onChange={(e) => setRoomValue(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoin()
                  }
                }}/>

              {feedback && (
                <div className="rounded-2xl bg-muted/60 border border-red-500 text-red-500 px-4 py-3 text-sm">
                  {feedback}
                </div>
              )}

              <Button
                className="w-full rounded-2xl gap-2"
                size="lg"
                onClick={handleJoin}
                disabled={ joining || !displayName.trim() || !roomValue.trim()}
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
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Need to host instead?{" "}
          <button type="button" className="font-medium text-foreground underline underline-offset-4 hover:text-primary hover:cursor-pointer duration-100" onClick={() => router.push("/create/host")}>
            Go to create
          </button>
        </p>
      </div>
    </main>
  )
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-background px-4 py-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading join details...
          </div>
        </main>
      }
    >
      <JoinContent />
    </Suspense>
  )
}
