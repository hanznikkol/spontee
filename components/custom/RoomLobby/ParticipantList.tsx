"use client"

import { useState, useRef, useEffect } from "react"
import { Users, Crown, Sparkles, Pencil, Check, X, Loader2, UserX } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Participants } from "@/lib/room/lobby/types/participants-types"
import { ParticipantStatus } from "./ParticipantStatus"

interface ParticipantRowProps {
  participant: Participants
  isMe: boolean
  isHostUser?: boolean
  onRename?: (displayName: string) => Promise<void>
  onKick?: (participantId: string) => Promise<void>
}

function ParticipantRow({
  participant,
  isMe,
  isHostUser = false,
  onRename,
  onKick,
}: ParticipantRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(participant.display_name || "")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false)
  const [isKicking, setIsKicking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)


  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setEditName(participant.display_name || "")
    setError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditName(participant.display_name || "")
    setError(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    const trimmed = editName.trim()

    if (!trimmed) {
      setError("Name cannot be empty")
      inputRef.current?.focus()
      return
    }

    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters")
      inputRef.current?.focus()
      return
    }

    if (trimmed.length > 20) {
      setError("Name cannot exceed 20 characters")
      inputRef.current?.focus()
      return
    }

    if (trimmed === participant.display_name) {
      setIsEditing(false)
      setError(null)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      if (onRename) {
        await onRename(trimmed)
      }
      setIsEditing(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update display name. Please try again."
      setError(message)
      inputRef.current?.focus()
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmKick = async () => {
    if (!onKick || isKicking) return
    try {
      setIsKicking(true)
      await onKick(participant.participant_id)
      setIsKickDialogOpen(false)
    } catch (err) {
      console.error("Kick failed:", err)
      setIsKicking(false)
    }
  }

  const initial =
    (isEditing ? editName.trim() : participant.display_name)?.trim()?.[0]?.toUpperCase() || "?"

  // ----------------------------------------------------
  // EDITING STATE (SELF ONLY)
  // ----------------------------------------------------
  if (isMe && isEditing) {
    return (
      <li
        className="flex flex-col gap-1.5 p-2 sm:p-2.5 rounded-2xl border transition-all border-pink-500/50 bg-pink-500/5 ring-1 ring-pink-500/20"
        role="listitem"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          {/* AVATAR + INPUT + ACTIONS */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-8 w-8 shrink-0 rounded-full bg-linear-to-tr from-pink-500/15 via-purple-500/15 to-blue-500/15 text-pink-600 dark:text-pink-400 font-bold text-xs flex items-center justify-center ring-1 ring-pink-500/20 shadow-xs select-none">
              {initial}
            </div>

            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value.slice(0, 20))
                  if (error) setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSave()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    handleCancel()
                  }
                }}
                disabled={isSaving}
                maxLength={20}
                placeholder="Your name"
                className="w-full min-w-0 h-8 px-2.5 py-1 text-xs sm:text-sm font-medium rounded-xl bg-background border border-pink-500/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all disabled:opacity-50"
              />

              {/* SAVE / CONFIRM BUTTON */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl bg-pink-500 text-white shadow-xs hover:bg-pink-600 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                aria-label="Save display name"
                title="Save"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                )}
              </button>

              {/* CANCEL BUTTON */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                aria-label="Cancel editing"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* STATUS BADGES (Visible on tablet/desktop, compact) */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {participant.is_host && (
              <Badge
                variant="outline"
                className="rounded-full gap-1 px-2 py-0.5 text-[10px] font-bold border-pink-500/30 bg-pink-500/10 text-pink-600 dark:text-pink-400"
              >
                <Crown className="h-3 w-3" />
                <span>Host</span>
              </Badge>
            )}

            <ParticipantStatus status={participant.status} />
          </div>
        </div>

        {/* ERROR / VALIDATION MESSAGE */}
        {error && (
          <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 pl-10 animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </p>
        )}
      </li>
    )
  }

  // ----------------------------------------------------
  // NORMAL STATE (SELF OR OTHER PARTICIPANT)
  // ----------------------------------------------------
  return (
    <li
      className={`flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl border transition-all ${
        isMe
          ? "border-pink-500/40 bg-pink-500/5 ring-1 ring-pink-500/20"
          : "border-border/60 bg-background/50 hover:bg-background/80"
      }`}
      role="listitem"
    >
      {/* AVATAR & NAME */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="h-8 w-8 shrink-0 rounded-full bg-linear-to-tr from-pink-500/15 via-purple-500/15 to-blue-500/15 text-pink-600 dark:text-pink-400 font-bold text-xs flex items-center justify-center ring-1 ring-pink-500/20 shadow-xs select-none">
          {initial}
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate max-w-28 xs:max-w-36 sm:max-w-52">
            {participant.display_name}
          </span>

          {isMe && (
            <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.2 rounded-md shrink-0">
              You
            </span>
          )}

          {/* EDIT BUTTON (Only for current participant) */}
          {isMe && onRename && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center justify-center h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-lg text-muted-foreground/80 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-500/10 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Edit display name"
              title="Edit your display name"
            >
              <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* STATUS, HOST BADGES & HOST-ONLY KICK ACTION */}
      <div className="flex items-center gap-1.5 shrink-0">
        {participant.is_host && (
          <Badge
            variant="outline"
            className="rounded-full gap-1 px-2 py-0.5 text-[10px] font-bold border-pink-500/30 bg-pink-500/10 text-pink-600 dark:text-pink-400"
          >
            <Crown className="h-3 w-3" />
            <span>Host</span>
          </Badge>
        )}

        <ParticipantStatus status={participant.status} />

        {/* HOST-ONLY KICK BUTTON & CONFIRMATION DIALOG */}
        {isHostUser && !participant.is_host && !isMe && onKick && (
          <AlertDialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all cursor-pointer ml-0.5"
                title={`Remove ${participant.display_name}`}
                aria-label={`Remove ${participant.display_name}`}
              >
                <UserX className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Participant?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-foreground">
                    {participant.display_name}
                  </span>{" "}
                  from this room?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2 justify-end">
                <AlertDialogCancel
                  disabled={isKicking}
                  className="rounded-xl text-xs sm:text-sm mt-0"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handleConfirmKick()
                  }}
                  disabled={isKicking}
                  className="rounded-xl text-xs sm:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isKicking ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    "Remove"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </li>
  )
}

interface ParticipantListProps {
  participants: Participants[]
  currentParticipant: Participants | null
  participantCount: number
  maxParticipants: number
  isRoomFull: boolean
  isHost?: boolean
  onRenameParticipant?: (displayName: string) => Promise<void>
  onKickParticipant?: (participantId: string) => Promise<void>
}

export default function ParticipantList({
  participants,
  currentParticipant,
  participantCount,
  maxParticipants,
  isRoomFull,
  isHost = false,
  onRenameParticipant,
  onKickParticipant,
}: ParticipantListProps) {
  return (
    <Card className="w-full rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xl overflow-hidden transition-all">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Users className="h-4 w-4 text-purple-500" />
              Participants
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {isRoomFull && (
              <Badge
                variant="outline"
                className="rounded-full px-2 py-0.5 text-[10px] font-bold border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              >
                Room Full
              </Badge>
            )}

            <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
              {participantCount} / {maxParticipants}
            </span>
          </div>
        </div>

        {/* PARTICIPANTS LIST */}
        <ul
          className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto overscroll-contain pr-1"
          role="list"
        >
          {participants.map((participant) => {
            const isMe =
              currentParticipant?.participant_id === participant.participant_id

            return (
              <ParticipantRow
                key={participant.participant_id}
                participant={participant}
                isMe={isMe}
                isHostUser={isHost}
                onRename={isMe ? onRenameParticipant : undefined}
                onKick={isHost ? onKickParticipant : undefined}
              />
            )
          })}
        </ul>

        {/* EMPTY/WAITING STATE HELPER */}
        {participantCount === 1 && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-pink-500 shrink-0" />
            <p>
              Waiting for other participants to join with the room code.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}