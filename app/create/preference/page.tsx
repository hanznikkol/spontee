"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RoomPreferenceHeader } from "@/components/custom/RoomCreation/Preference/RoomPreferenceHeader"
import { SetupProgress } from "@/components/custom/RoomCreation/RoomSetupProgress"
import { PreferenceCategorySelector } from "@/components/custom/RoomCreation/Preference/PreferenceCategorySelector"
import { PreferenceBudgetSelector } from "@/components/custom/RoomCreation/Preference/PreferenceBudgetSelector"
import { PreferenceLocationCard } from "@/components/custom/RoomCreation/Preference/PreferenceLocationCard"
import { PreferenceBudget } from "@/lib/room/create/preference/budget"

function RoomPreferencePage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [selectedBudget, setSelectedBudget] = useState<PreferenceBudget>()
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [latitude, setLatitude] = useState<number>()
  const [longitude, setLongitude] = useState<number>()

  const canCreate = Boolean(selectedCategory)

  const handleEnableLocation = () => {
    setLocationEnabled(true)
    setLatitude(14.5995)
    setLongitude(120.9842)
  }

  const handleCreateRoom = () => {
    if (!canCreate) return
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
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
              <PreferenceBudgetSelector
                value={selectedBudget}
                onChange={setSelectedBudget}
              />
              <PreferenceLocationCard
                enabled={locationEnabled}
                latitude={latitude}
                longitude={longitude}
                onEnable={handleEnableLocation}
              />
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
