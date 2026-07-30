"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RoomPreferenceHeader } from "@/components/custom/RoomCreation/Preference/RoomPreferenceHeader"
import { SetupProgress } from "@/components/custom/RoomCreation/RoomSetupProgress"
import { PreferenceCategorySelector } from "@/components/custom/RoomCreation/Preference/PreferenceCategorySelector"
import { PreferenceBudgetSelector } from "@/components/custom/RoomCreation/Preference/PreferenceBudgetSelector"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import PreferenceLocationCard from "@/components/custom/RoomCreation/Preference/PreferenceLocationCard"
import { createRoomAction } from "@/lib/room/create/actions/create-room"
import { useEffect, useState } from "react"
import { ErrorDialog } from "@/components/custom/Modal/ErrorLogDialog"
import { ensureAnonUser } from "@/lib/user/services/auth.service"
import { useRoomSessionStore } from "@/lib/room/main/stores/room-session-store.store"

const loadingMessages = [
  "Creating your room...",
  "Saving your preferences...",
  "Finding nearby places...",
  "Generating recommendations...",
  "Almost ready..."
];

function RoomPreferencePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // For Room Creation
  const selectedBudget = useCreateRoomStore((state) => state.budget)
  const setSelectedBudget = useCreateRoomStore((state) => state.setBudget)
  const selectedCategories = useCreateRoomStore((state) => state.selectedCategoriesbyNames)
  const toggleCategory = useCreateRoomStore((state) => state.toggleCategory)
  // For Session
  const setSession = useRoomSessionStore(state => state.setSession)
  
  const canCreate = selectedCategories.length > 0

  const handleCreateRoom = async () => {
      if (!canCreate) return;
    
      // Get All Stored State
      const state = useCreateRoomStore.getState();
      try {
          setIsCreating(true)
          const user = await ensureAnonUser()
          const {room, participant}  = await createRoomAction({
            userId: user.id,
            hostName: state.hostName,
            roomName: state.roomName,
            roomVisibility: state.roomVisibility,
            roomPassword: state.roomPassword,
            maxParticipants: state.maxParticipants,
            selectedCategoriesbyNames: state.selectedCategoriesbyNames,
            budget: state.budget,
            locationStatus: state.locationStatus,
            address: state.address,
            latitude: state.latitude!,
            longitude: state.longitude!,
            radius: state.radius,
          });

          setSession({
            roomId: room.room_id,
            roomCode: room.room_code,
            participantId: participant.participant_id,
            isHost: participant.is_host,
          })
          router.push(`/room/${room.room_code}/lobby`);
      } catch (error) {
        console.error(error);
        setErrorMessage("Error Creating a Room. Please try again.");
        setIsErrorOpen(true);
      } finally {
        setIsCreating(false)
      }
  };

  // Loading Messages Generating
  useEffect(() => {
    if (!isCreating) return;

    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isCreating]);

  return (
    <>
    <main className="relative overflow-hidden px-4 py-6 md:py-10 min-h-dvh">
      {/* Progress Bar */}
      <div className="mx-auto w-full max-w-md space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit px-0"
          type="button"
          onClick={() => router.push("/create/room")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <SetupProgress step={3} total={3} />
      </div>

      <div className="mt-4 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl border bg-background/70 backdrop-blur">
          <CardContent className="space-y-6 p-6">
            <RoomPreferenceHeader />

            <div className="space-y-6">
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

            {/* Create Button */}
            <Button
              type="button"
              className="w-full rounded-2xl"
              size="lg"
              disabled={!canCreate || isCreating}
              onClick={handleCreateRoom}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingMessage}
                </>
              ) : (
                <>
                  Create
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>

    <ErrorDialog open={isErrorOpen} title="Creating Room Failed" message={errorMessage} onClose={() => setIsErrorOpen(false)}/>
  </>
  )
}

export default RoomPreferencePage
