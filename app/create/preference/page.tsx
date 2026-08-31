"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RoomPreferenceHeader } from "@/components/custom/RoomCreation/Preference/RoomPreferenceHeader"
import { PreferenceCategorySelector } from "@/components/custom/RoomCreation/Preference/PreferenceCategorySelector"
import { PreferenceBudgetSelector } from "@/components/custom/RoomCreation/Preference/PreferenceBudgetSelector"
import PreferenceLocationCard from "@/components/custom/RoomCreation/Preference/PreferenceLocationCard"
import { SetupProgress } from "@/components/custom/RoomCreation/Setup/SetupProgress"
import { ErrorDialog } from "@/components/custom/Modal/ErrorLogDialog"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import { useRoomSessionStore } from "@/lib/room/main/stores/room-session-store.store"
import { createRoomAction } from "@/lib/room/create/actions/create-room"
import { ensureAnonUser } from "@/lib/user/services/auth.service"

const loadingMessages = [
  "Creating your room...",
  "Saving your preferences...",
  "Finding nearby places with Google...",
  "Generating recommendations...",
  "Almost ready...",
]

export default function RoomPreferencePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0])
  const [isErrorOpen, setIsErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Zustand Store
  const selectedBudget = useCreateRoomStore((state) => state.budget)
  const setSelectedBudget = useCreateRoomStore((state) => state.setBudget)
  const selectedCategories = useCreateRoomStore(
    (state) => state.selectedCategoriesbyNames
  )
  const toggleCategory = useCreateRoomStore((state) => state.toggleCategory)

  // Session Store
  const setSession = useRoomSessionStore((state) => state.setSession)

  const canCreate = selectedCategories.length > 0

  const handleCreateRoom = async () => {
    if (!canCreate || isCreating) return

    const state = useCreateRoomStore.getState()
    try {
      setIsCreating(true)
      const user = await ensureAnonUser()
      const { room, participant } = await createRoomAction({
        userId: user.id,
        hostName: state.hostName,
        roomName: state.roomName,
        maxParticipants: state.maxParticipants,
        maxOptions: state.maxOptions,
        selectedCategoriesbyNames: state.selectedCategoriesbyNames,
        budget: state.budget,
        locationStatus: state.locationStatus,
        address: state.address,
        latitude: state.latitude!,
        longitude: state.longitude!,
        radius: state.radius,
      })

      setSession({
        roomId: room.room_id,
        roomCode: room.room_code,
        participantId: participant.participant_id,
        isHost: participant.is_host,
      })

      router.replace(`/room/${room.room_code}/lobby`)

      useCreateRoomStore.getState().reset()
      useCreateRoomStore.persist.clearStorage()
    } catch (error) {
      console.error(error)
      setErrorMessage("Error Creating a Room. Please try again.")
      setIsErrorOpen(true)
    } finally {
      setIsCreating(false)
    }
  }

  // Loading Message Cycle
  useEffect(() => {
    if (!isCreating) return

    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length
      setLoadingMessage(loadingMessages[index])
    }, 1500)

    return () => clearInterval(interval)
  }, [isCreating])

  return (
    <>
      <div className="flex min-h-dvh flex-col justify-between px-3.5 sm:px-6 md:px-8 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-md sm:max-w-lg space-y-4 sm:space-y-5">
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

          {/* BACK ACTION & PROGRESS BAR */}
          <div className="space-y-2.5">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => router.replace("/create/room")}
              disabled={isCreating}
              className="rounded-xl px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors -ml-1 h-8"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Back to Room Setup
            </Button>

            <SetupProgress step={3} total={3} />
          </div>

          {/* MAIN FORM CARD */}
          <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
            <CardContent className="p-5 sm:p-7 md:p-8 space-y-6">
              <RoomPreferenceHeader />

              <div className="space-y-5 sm:space-y-6">
                {/* Category Selection */}
                <PreferenceCategorySelector
                  value={selectedCategories}
                  onChange={toggleCategory}
                />

                {/* Budget Preference */}
                <PreferenceBudgetSelector
                  value={selectedBudget}
                  onChange={setSelectedBudget}
                />

                {/* Location Radius */}
                <PreferenceLocationCard />
              </div>

              {/* CREATE ROOM CTA */}
              <div className="space-y-2.5 pt-1">
                <Button
                  type="button"
                  className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
                  size="lg"
                  disabled={!canCreate || isCreating}
                  onClick={handleCreateRoom}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="truncate">{loadingMessage}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 fill-white" />
                      <span>Create Room</span>
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {canCreate
                    ? "Places will be discovered with Google Places."
                    : "Select at least 1 category above to continue."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ERROR DIALOG */}
      <ErrorDialog
        open={isErrorOpen}
        title="Creating Room Failed"
        message={errorMessage}
        onClose={() => setIsErrorOpen(false)}
      />
    </>
  )
}
