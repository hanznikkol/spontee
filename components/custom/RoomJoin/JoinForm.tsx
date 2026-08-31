"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, AlertCircle } from "lucide-react"
import NameInput from "@/components/custom/Room/NameInput"
import RoomLinkInput from "@/components/custom/RoomJoin/RoomLinkInput"

interface JoinFormProps {
  displayName: string
  roomValue: string
  joining: boolean
  feedback: string
  onDisplayNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRoomChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onJoin: () => void
}

export function JoinForm({
  displayName,
  roomValue,
  joining,
  feedback,
  onDisplayNameChange,
  onRoomChange,
  onJoin,
}: JoinFormProps) {
  const isSubmitDisabled = joining || !displayName.trim() || !roomValue.trim()

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
      <CardContent className="p-6 sm:p-7 space-y-5">
        {/* DISPLAY NAME INPUT */}
        <NameInput
          title="Your Name"
          value={displayName}
          required
          onChange={onDisplayNameChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onJoin()
            }
          }}
          placeholder="e.g. John, Anna"
        />

        {/* ROOM LINK / CODE INPUT */}
        <RoomLinkInput
          value={roomValue}
          onChange={onRoomChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onJoin()
            }
          }}
        />

        {/* FEEDBACK / ERROR NOTIFICATION */}
        {feedback && (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
            <span className="leading-snug">{feedback}</span>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <Button
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
          size="lg"
          onClick={onJoin}
          disabled={isSubmitDisabled}
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
  )
}

