"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, MapPin, Layers, Banknote, Sparkles } from "lucide-react"
import { budgetChoices } from "@/lib/room/create/types/budget"
import { categories as categoryDefs } from "@/lib/room/create/types/categories"
import { RoomPreferenceContext } from "@/lib/room/result/result.types"

interface LobbyPreferencesCardProps {
  preferences: RoomPreferenceContext | null
  maxOptions: number
  isHost: boolean
  isLobby: boolean
  onEditPreferences: () => void
}

export function LobbyPreferencesCard({
  preferences,
  maxOptions,
  isHost,
  isLobby,
  onEditPreferences,
}: LobbyPreferencesCardProps) {
  if (!preferences) return null

  const categoryNames = preferences.categoryNames ?? []
  const categoryLabels = categoryNames
    .map((name) => {
      const found = categoryDefs.find((c) => c.name === name)
      return found ? `${found.emoji} ${found.label}` : name
    })
    .join(" · ")

  const budgetChoice = budgetChoices.find(
    (b) => b.value === preferences.budget
  )
  const budgetLabel = budgetChoice ? budgetChoice.label : "Any Budget"

  const radiusKm = preferences.radius
    ? preferences.radius >= 1000
      ? `${(preferences.radius / 1000).toFixed(1).replace(".0", "")} km`
      : `${preferences.radius} m`
    : "3 km"

  const shortAddress = preferences.address
    ? preferences.address.split(",")[0].trim()
    : "Nearby"

  return (
    <Card className="rounded-2xl sm:rounded-3xl border-border/70 bg-card/60 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Room Preferences</h3>
            <p className="text-[11px] text-muted-foreground">
              Criteria used to discover candidate places
            </p>
          </div>
        </div>

        {isHost && isLobby && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEditPreferences}
            className="h-8 px-3 rounded-xl text-xs font-semibold hover:bg-pink-500/10 hover:text-pink-600 hover:border-pink-500/30 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="h-3 w-3 mr-1.5" />
            Edit
          </Button>
        )}
      </div>

      {/* PILLS SUMMARY */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
        {categoryLabels && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-700 dark:text-pink-300 text-xs font-medium">
            <Layers className="h-3 w-3" />
            {categoryLabels}
          </span>
        )}

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-medium">
          <Banknote className="h-3 w-3" />
          {budgetLabel}
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-medium truncate max-w-[200px]">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{shortAddress} ({radiusKm})</span>
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          {maxOptions} spots
        </span>
      </div>
    </Card>
  )
}
