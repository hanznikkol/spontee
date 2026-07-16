"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RoomPreferenceHeader } from "@/components/custom/RoomCreation/Preference/RoomPreferenceHeader"
import { SetupProgress } from "@/components/custom/RoomCreation/RoomSetupProgress"
import { PreferenceCategorySelector } from "@/components/custom/RoomCreation/Preference/PreferenceCategorySelector"
import { PreferenceBudgetSelector } from "@/components/custom/RoomCreation/Preference/PreferenceBudgetSelector"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import PreferenceLocationCard from "@/components/custom/RoomCreation/Preference/PreferenceLocationCard"

function RoomPreferencePage() {
  const router = useRouter()
  const selectedBudget = useCreateRoomStore((state) => state.budget)
  const setSelectedBudget = useCreateRoomStore((state) => state.setBudget)

  const selectedCategories = useCreateRoomStore((state) => state.selectedCategoriesbyNames)
  const toggleCategory = useCreateRoomStore((state) => state.toggleCategory)
  
  const canCreate = selectedCategories.length > 0

  const handleCreateRoom = () => {
    if (!canCreate) return

    const store = useCreateRoomStore.getState()

    console.log(
      JSON.stringify(store, null, 2)
    )
  }

  return (
    <main className="relative overflow-hidden px-4 py-6 md:py-10 min-h-dvh">
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
              <PreferenceCategorySelector
                value={selectedCategories}
                onChange={toggleCategory}
              />
              <PreferenceBudgetSelector
                value={selectedBudget}
                onChange={setSelectedBudget}
              />
              <PreferenceLocationCard />
            </div>

            <Button
              type="button"
              className="w-full rounded-2xl"
              size="lg"
              disabled={!canCreate}
              onClick={handleCreateRoom}
            >
              Create
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default RoomPreferencePage
