"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { PreferencesHeader } from "@/components/custom/RoomCreation/Preferences/PreferencesHeader"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import { SetupProgress } from "@/components/custom/RoomCreation/Preferences/SetupProgress"
import { RoomMaxOptions } from "@/components/custom/RoomCreation/Preferences/RoomMaxOptions"
import { PreferenceCategorySelector } from "@/components/custom/RoomCreation/Preferences/PreferenceCategorySelector"
import { PreferenceBudgetSelector } from "@/components/custom/RoomCreation/Preferences/PreferenceBudgetSelector"

export default function PreferencesPage() {
  const router = useRouter()

  // Zustand Store
  const selectedCategories = useCreateRoomStore(
    (state) => state.selectedCategoriesbyNames
  )
  const toggleCategory = useCreateRoomStore((state) => state.toggleCategory)
  const selectedBudget = useCreateRoomStore((state) => state.budget)
  const setSelectedBudget = useCreateRoomStore((state) => state.setBudget)
  const maxOptions = useCreateRoomStore((state) => state.maxOptions)
  const setMaxOptions = useCreateRoomStore((state) => state.setMaxOptions)

  const canContinue = selectedCategories.length > 0

  const handleNext = () => {
    if (!canContinue) return
    router.replace("/create/location")
  }

  const handleBack = () => {
    router.replace("/create/room")
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between px-3.5 sm:px-6 md:px-8 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md sm:max-w-lg space-y-4 sm:space-y-5">
        {/* BRAND WORDMARK */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 transition-transform active:scale-95"
          >
            <span className="text-xl font-bold tracking-tight text-foreground">
              Spont
              <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
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
            onClick={handleBack}
            className="rounded-xl px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors -ml-1 h-8"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Room
          </Button>

          <SetupProgress step={2} total={3} />
        </div>

        {/* MAIN FORM CARD */}
        <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
          <CardContent className="p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
            <PreferencesHeader />

            <div className="space-y-5 sm:space-y-6">
              {/* CATEGORY SELECTOR */}
              <PreferenceCategorySelector
                value={selectedCategories}
                onChange={toggleCategory}
              />

              {/* BUDGET SELECTOR */}
              <PreferenceBudgetSelector
                value={selectedBudget}
                onChange={setSelectedBudget}
              />

              {/* PLACES TO SWIPE */}
              <RoomMaxOptions
                maxOptions={maxOptions}
                onChange={setMaxOptions}
              />
            </div>

            {/* CONTINUE CTA */}
            <div className="space-y-2.5 pt-1">
              <Button
                className="w-full h-11 sm:h-12 rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
                size="lg"
                onClick={handleNext}
                disabled={!canContinue}
              >
                Continue to Location
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {canContinue
                  ? "Next: Set your search area and location."
                  : "Select at least 1 category above to continue."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
