"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation, Share2, CalendarPlus, RotateCcw, Home, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoomOption } from "@/lib/room/create/types/option-types"
import { Participants } from "@/lib/room/lobby/types/participants-types"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import { ResultPlanModal } from "./ResultPlanModal"

interface ResultActionsProps {
  option: RoomOption
  roomCode?: string
  participants?: Participants[]
}

export default function ResultActions({
  option,
  roomCode = "",
  participants = [],
}: ResultActionsProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isPlanOpen, setIsPlanOpen] = useState(false)

  const handleShare = async () => {
    const title = `We're going to ${option.title}!`
    const text = `🎉 We decided on ${option.title} on Spontee!\n📍 ${option.address || ""}\nCheck out the result:`
    const url = typeof window !== "undefined" ? window.location.href : ""

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
        return
      } catch {
        // Fallback to clipboard if share was cancelled or unsupported
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateAnother = () => {
    useCreateRoomStore.getState().reset()
    router.push("/create/host")
  }

  const getDirectionsUrl = () => {
    if (!option.address && !option.title) return "https://maps.google.com"
    const query = encodeURIComponent(`${option.title} ${option.address || ""}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
        {/* 1. Primary Action: Get Directions (Prominent Hero Action) */}
        <Button
          className="w-full h-12 sm:h-14 rounded-2xl text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          asChild
        >
          <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
            <Navigation className="mr-2 h-4.5 w-4.5 sm:h-5 sm:w-5" />
            <span>Get Directions</span>
          </a>
        </Button>

        {/* 2. Secondary Actions Grid: Plan this & Share Result */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
          {/* Plan this */}
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border-border hover:bg-muted transition-all active:scale-[0.98]"
            onClick={() => setIsPlanOpen(true)}
          >
            <CalendarPlus className="mr-2 h-4 w-4 text-purple-500 shrink-0" />
            <span className="truncate">Plan this</span>
          </Button>

          {/* Share Result */}
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border-border hover:bg-muted transition-all active:scale-[0.98]"
            onClick={handleShare}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-emerald-500 font-semibold truncate">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4 text-blue-500 shrink-0" />
                <span className="truncate">Share result</span>
              </>
            )}
          </Button>
        </div>

        {/* 3. Utility Row: Create another Spontee + Return Home */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10 sm:h-11 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-[0.98]"
            onClick={handleCreateAnother}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5 text-pink-500" />
            <span>Create another Spontee</span>
          </Button>

          <Button
            variant="outline"
            className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-[0.98] shrink-0"
            asChild
            title="Return to Home"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Lightweight Planning Dialog */}
      <ResultPlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        option={option}
        participants={participants}
        roomCode={roomCode}
      />
    </>
  )
}
