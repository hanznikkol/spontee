import { useState } from "react"
import { LogOut, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

interface LobbyHeaderProps {
  roomName?: string
  isActive: boolean
  isHost?: boolean
  onLeaveRoom?: () => Promise<void>
}

export default function LobbyHeader({
  roomName,
  isActive,
  isHost = false,
  onLeaveRoom,
}: LobbyHeaderProps) {
  const [isLeaving, setIsLeaving] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleConfirmLeave = async () => {
    if (!onLeaveRoom || isLeaving) return
    try {
      setIsLeaving(true)
      await onLeaveRoom()
      setIsAlertOpen(false)
    } catch (err) {
      console.error("Leave room failed:", err)
      setIsLeaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground wrap-break-word">
            {roomName || "Spontee Decision Room"}
          </h1>

          <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isActive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            <span
              className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            {isActive ? "Room Open" : "Lobby · Waiting"}
          </Badge>
        </div>

        {/* LEAVE ROOM BUTTON & CONFIRMATION DIALOG */}
        {onLeaveRoom && (
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer gap-1.5"
                title={isHost ? "Close & Leave Room" : "Leave Room"}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Leave</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl max-w-sm sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isHost ? "Leave & Close Room?" : "Leave Room?"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm leading-relaxed">
                  {isHost
                    ? "As the host, leaving will close this room for all participants. Are you sure you want to end this room?"
                    : "You will leave this decision room. You can rejoin using the room code if the room is still open."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2 justify-end">
                <AlertDialogCancel
                  disabled={isLeaving}
                  className="rounded-xl text-xs sm:text-sm mt-0"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handleConfirmLeave()
                  }}
                  disabled={isLeaving}
                  className="rounded-xl text-xs sm:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLeaving ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Leaving...
                    </>
                  ) : isHost ? (
                    "Close & Leave"
                  ) : (
                    "Leave Room"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {isActive
          ? "The room is live! When everyone is ready, start voting on places."
          : "Share the code or QR below so your group can join before voting starts."}
      </p>
    </div>
  )
}