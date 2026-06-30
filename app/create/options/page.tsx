"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { OptionCategories } from "@/components/custom/RoomCreation/Options/OptionCategories"
import { OptionHeader } from "@/components/custom/RoomCreation/Options/OptionHeader"
import { OptionInput } from "@/components/custom/RoomCreation/Options/OptionInput"
import { OptionList } from "@/components/custom/RoomCreation/Options/OptionList"
import { QuickSuggestions } from "@/components/custom/RoomCreation/Options/QuickSuggestions"
import { optionCategories, quickSuggestionGroups } from "@/lib/room/create/options/mock-data"
import type { OptionCategoryId, OptionSource, RoomOption } from "@/lib/room/create/options/option-types"
import { SetupProgress } from "@/components/custom/RoomCreation/RoomSetupProgress"

function createOptionId(title: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`
}

function OptionPage() {
  const router = useRouter()
  const [selectedCategories, setSelectedCategories] = useState<OptionCategoryId[]>([])
  const [optionTitle, setOptionTitle] = useState("")
  const [options, setOptions] = useState<RoomOption[]>([])
  const [error, setError] = useState<string>()

  const canContinue = options.length >= 2
  const activeCategoryLabel = useMemo(() => {
    const firstSelected = optionCategories.find((category) =>
      selectedCategories.includes(category.category_id)
    )

    return firstSelected?.label ?? "Anything"
  }, [selectedCategories])

  const optionExists = (title: string, ignoredId?: string) =>
    options.some(
      (option) =>
        option.option_id !== ignoredId &&
        option.title.trim().toLowerCase() === title.trim().toLowerCase()
    )

  const addOption = (
    title: string,
    category = activeCategoryLabel,
    source: OptionSource = "manual"
  ) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError("Add a name before saving this option.")
      return false
    }

    if (optionExists(trimmedTitle)) {
      setError("That option is already in your list.")
      return false
    }

    setOptions((currentOptions) => [
      ...currentOptions,
      {
        option_id: createOptionId(trimmedTitle),
        title: trimmedTitle,
        description:
          source === "manual"
            ? "Added manually from your group idea."
            : "Pulled from quick suggestions.",
        category,
        source,
      },
    ])
    setOptionTitle("")
    setError(undefined)
    return true
  }

  const handleToggleCategory = (categoryId: OptionCategoryId) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(categoryId)
        ? currentCategories.filter((id) => id !== categoryId)
        : [...currentCategories, categoryId]
    )
  }

  const handleDeleteOption = (id: string) => {
    setOptions((currentOptions) =>
      currentOptions.filter((option) => option.option_id !== id)
    )
  }

  const handleEditOption = (id: string, title: string) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError("Options need a visible name.")
      return false
    }

    if (optionExists(trimmedTitle, id)) {
      setError("That option is already in your list.")
      return false
    }

    setOptions((currentOptions) =>
      currentOptions.map((option) =>
        option.option_id === id ? { ...option, title: trimmedTitle } : option
      )
    )
    setError(undefined)
    return true
  }

  return (
    <main className="relative overflow-hidden px-4 py-6 md:py-10">
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
            <OptionHeader />

            <div className="space-y-6">
              <OptionCategories
                categories={optionCategories}
                selected={selectedCategories}
                onToggle={handleToggleCategory}
              />

              <QuickSuggestions
                groups={quickSuggestionGroups}
                onAddSuggestion={addOption}
              />

              <OptionInput
                value={optionTitle}
                error={error}
                onChange={(value) => {
                  setOptionTitle(value)
                  if (error) setError(undefined)
                }}
                onAdd={() => addOption(optionTitle)}
              />

              <OptionList
                options={options}
                onDelete={handleDeleteOption}
                onEdit={handleEditOption}
              />
            </div>

            <Button
              type="button"
              className="w-full rounded-2xl"
              size="lg"
              disabled={!canContinue}
            >
              Create
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Add at least two options so everyone has something to compare.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default OptionPage
