"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, SlidersHorizontal, AlertCircle } from "lucide-react"
import { PreferenceCategorySelector } from "../RoomCreation/Preference/PreferenceCategorySelector"
import { PreferenceBudgetSelector } from "../RoomCreation/Preference/PreferenceBudgetSelector"
import { PreferenceLocationCard } from "../RoomCreation/Preference/PreferenceLocationCard"
import { RoomMaxOptions } from "../RoomCreation/Setup/RoomMaxOptions"
import { PreferenceBudget } from "@/lib/room/create/types/budget"
import { updateRoomPreferencesAction } from "@/lib/room/create/actions/update-room-preferences"
import { MAX_SELECTED_CATEGORIES } from "@/lib/room/create/types/categories"
import { MAX_OPTIONS_VALUES } from "@/lib/room/create/types/constants/max-options-const"

export interface UpdatePreferencesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
  source: "lobby" | "result"
  initialPreferences?: {
    categoryNames?: string[]
    budget?: PreferenceBudget
    latitude?: number | null
    longitude?: number | null
    address?: string | null
    radius?: number | null
    maxOptions?: number | null
  }
  onSuccess?: () => void
}

interface UpdatePreferencesFormProps {
  roomId: string
  source: "lobby" | "result"
  initialPreferences?: UpdatePreferencesModalProps["initialPreferences"]
  onClose: () => void
  onSuccess?: () => void
}

function UpdatePreferencesForm({
  roomId,
  source,
  initialPreferences,
  onClose,
  onSuccess,
}: UpdatePreferencesFormProps) {
  const [categories, setCategories] = useState<string[]>(() =>
    initialPreferences?.categoryNames && initialPreferences.categoryNames.length > 0
      ? initialPreferences.categoryNames
      : ["food"]
  )
  const [budget, setBudget] = useState<PreferenceBudget>(
    () => initialPreferences?.budget ?? "any"
  )
  const [latitude, setLatitude] = useState<number | undefined>(
    () => initialPreferences?.latitude ?? undefined
  )
  const [longitude, setLongitude] = useState<number | undefined>(
    () => initialPreferences?.longitude ?? undefined
  )
  const [address, setAddress] = useState<string>(
    () => initialPreferences?.address ?? ""
  )
  const [radius, setRadius] = useState<number>(
    () => initialPreferences?.radius ?? 3000
  )
  const [maxOptions, setMaxOptions] = useState<number>(() => {
    const init = initialPreferences?.maxOptions
    if (init && (MAX_OPTIONS_VALUES as readonly number[]).includes(init)) {
      return init
    }
    return 10
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCategoryToggle = (categoryName: string) => {
    setCategories((prev) => {
      if (prev.includes(categoryName)) {
        if (prev.length <= 1) return prev // Enforce at least 1 category selected
        return prev.filter((c) => c !== categoryName)
      }
      if (prev.length >= MAX_SELECTED_CATEGORIES) {
        return [prev[1], categoryName]
      }
      return [...prev, categoryName]
    })
  }

  const handleLocationChange = (data: {
    latitude: number
    longitude: number
    address: string
    radius: number
  }) => {
    setLatitude(data.latitude)
    setLongitude(data.longitude)
    setAddress(data.address)
    setRadius(data.radius)
  }

  const handleSave = async () => {
    if (isSaving || !roomId) return

    if (!categories || categories.length === 0) {
      setError("Please select at least 1 category.")
      return
    }

    if (latitude == null || longitude == null) {
      setError("Please choose a location to discover places.")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      await updateRoomPreferencesAction({
        roomId,
        source,
        preferences: {
          categoryNames: categories,
          budget,
          latitude,
          longitude,
          address,
          radius,
          maxOptions,
        },
      })

      onClose()
      onSuccess?.()
    } catch (err) {
      console.error("Update preferences failed:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update room preferences. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* HEADER */}
      <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2 text-pink-500">
          <SlidersHorizontal className="h-5 w-5" />
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Edit Room Preferences
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
          {source === "lobby"
            ? "Update preferences before starting voting. Fresh options will be generated."
            : "Try again with updated preferences. A new voting round will begin."}
        </DialogDescription>
      </DialogHeader>

      {/* SCROLLABLE FORM BODY */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Category Selector */}
        <PreferenceCategorySelector
          value={categories}
          onChange={handleCategoryToggle}
        />

        {/* 2. Budget Selector */}
        <PreferenceBudgetSelector
          value={budget}
          onChange={(next) => setBudget(next ?? "any")}
        />

        {/* 3. Location & Radius */}
        <PreferenceLocationCard
          latitude={latitude}
          longitude={longitude}
          address={address}
          radius={radius}
          onChange={handleLocationChange}
        />

        {/* 4. Places to Vote On (maxOptions) */}
        <RoomMaxOptions
          maxOptions={maxOptions}
          onChange={setMaxOptions}
        />

        {/* Contextual Closed-Place Notice */}
        <p className="text-center text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed px-2">
          We filter out places that are currently closed, so fewer options may be available.
        </p>
      </div>

      {/* STICKY FOOTER */}
      <DialogFooter className="p-4 sm:p-5 border-t border-border/60 bg-muted/30 flex-row items-center justify-end gap-2.5 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={onClose}
          className="rounded-xl sm:rounded-2xl h-10 sm:h-11 px-4 sm:px-5 text-xs sm:text-sm font-semibold cursor-pointer"
        >
          Cancel
        </Button>

        <Button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="rounded-xl sm:rounded-2xl h-10 sm:h-11 px-5 sm:px-6 text-xs sm:text-sm font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export function UpdatePreferencesModal({
  open,
  onOpenChange,
  roomId,
  source,
  initialPreferences,
  onSuccess,
}: UpdatePreferencesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:w-[calc(100%-2rem)] max-w-2xl max-h-[95dvh] sm:max-h-[90dvh] flex flex-col p-0 rounded-3xl overflow-hidden border-border/80 bg-card shadow-2xl">
        {open && (
          <UpdatePreferencesForm
            roomId={roomId}
            source={source}
            initialPreferences={initialPreferences}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
