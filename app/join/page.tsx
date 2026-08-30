"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { extractRoomCode } from "@/lib/room/join/join"
import { useJoinRoom } from "@/lib/room/join/hook/useJoinRoom"
import { JoinBackground } from "@/components/custom/RoomJoin/JoinBackground"
import { JoinHeader } from "@/components/custom/RoomJoin/JoinHeader"
import { JoinForm } from "@/components/custom/RoomJoin/JoinForm"
import { JoinFooter } from "@/components/custom/RoomJoin/JoinFooter"

function JoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRoom = searchParams.get("room") ?? ""

  const [displayName, setDisplayName] = useState("")
  const [roomValue, setRoomValue] = useState(initialRoom)
  const { join, joining, feedback } = useJoinRoom()

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
    <main className="min-h-dvh relative overflow-hidden bg-background flex flex-col justify-center px-4 py-10 sm:py-16">
      <JoinBackground />

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 z-10 animate-in fade-in zoom-in-95 duration-300">
        <JoinHeader />

        <JoinForm
          displayName={displayName}
          roomValue={roomValue}
          joining={joining}
          feedback={feedback}
          onDisplayNameChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
          onRoomChange={(e) => setRoomValue(e.target.value)}
          onJoin={handleJoin}
        />

        <JoinFooter onGoToCreate={() => router.push("/create/host")} />
      </div>
    </main>
  )
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh relative overflow-hidden bg-background flex items-center justify-center px-4 py-10">
          <JoinBackground />
          <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-sm text-muted-foreground backdrop-blur-xl shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
            <span>Loading join details...</span>
          </div>
        </main>
      }
    >
      <JoinContent />
    </Suspense>
  )
}
