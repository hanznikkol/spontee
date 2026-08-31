"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ArrowLeft } from "lucide-react"
import HostHeader from "@/components/custom/RoomCreation/Host/HostHeader"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import NameInput from "@/components/custom/Room/NameInput"
import { SetupProgress } from "@/components/custom/RoomCreation/Setup/SetupProgress"

export default function HostPage() {
  const router = useRouter()
  const hostName = useCreateRoomStore((state) => state.hostName)
  const setHostName = useCreateRoomStore((state) => state.setHostName)

  const isValidName = hostName.trim().length >= 2

  const handleContinue = () => {
    if (!hostName.trim()) return
    router.replace(`/create/room`)
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between px-3.5 sm:px-6 md:px-8 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md space-y-4 sm:space-y-5">
        {/* BRAND WORDMARK */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 transition-transform active:scale-95"
          >
            <span className="text-xl font-bold tracking-tight">
              Spont
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ee
              </span>
            </span>
          </Link>
        </div>

        {/* STEPPER PROGRESS */}
        <SetupProgress step={1} total={3} />

        {/* MAIN FORM CARD */}
        <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
          <CardContent className="p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
            <HostHeader />

            <div className="space-y-3">
              <NameInput
                title="Host Name"
                placeholder="e.g. Maya, Alex, The Host"
                value={hostName}
                required
                onChange={(e) => setHostName(e.target.value.slice(0, 20))}
                onKeyDown={(e) =>
                  e.key === "Enter" && isValidName && handleContinue()
                }
              />

              <p className="text-xs text-muted-foreground">
                Minimum 2 characters. You can invite your group after setup.
              </p>
            </div>

            <Button
              className="w-full h-11 sm:h-12 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
              size="lg"
              disabled={!isValidName}
              onClick={handleContinue}
            >
              Continue to Room Setup
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* FOOTER ACTIONS */}
        <div className="text-center space-y-2 text-xs text-muted-foreground pt-1">
          <p>
            Looking to join a room instead?{" "}
            <Link
              href="/join"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-pink-500 transition-colors"
            >
              Join with code
            </Link>
          </p>

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}