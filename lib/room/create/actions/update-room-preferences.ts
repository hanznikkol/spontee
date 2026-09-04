"use server"

import { createClient } from "@/lib/supabase/server"
import { generate } from "../services/option.service"
import { createOptions } from "../services/room.service"
import { PreferenceBudget } from "../types/budget"
import { MAX_SELECTED_CATEGORIES } from "../types/categories"
import { MAX_OPTIONS_VALUES } from "../types/constants/max-options-const"

export interface UpdateRoomPreferencesPayload {
  roomId: string
  source: "lobby" | "result"
  preferences: {
    categoryNames: string[]
    budget?: PreferenceBudget
    latitude: number
    longitude: number
    address: string
    radius: number
    maxOptions: number
  }
}

export async function updateRoomPreferencesAction({
  roomId,
  source,
  preferences,
}: UpdateRoomPreferencesPayload) {
  try {
    const supabase = await createClient()

    // 1. Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Unauthorized. Please ensure you have an active session.")
    }

    // 2. Verify participant belongs to the room and is host (Strict Server-Side Authorization)
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("participant_id, is_host")
      .eq("room_id", roomId)
      .eq("user_id", user.id)
      .single()

    if (participantError || !participant) {
      throw new Error("You are not a participant in this room.")
    }

    if (!participant.is_host) {
      throw new Error("Only the room host can update room preferences.")
    }

    // 3. Inspect room status and enforce lifecycle rules
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("status, max_options")
      .eq("room_id", roomId)
      .single()

    if (roomError || !room) {
      throw new Error("Room could not be loaded.")
    }

    if (room.status === "active" && source === "lobby") {
      throw new Error(
        "Preferences cannot be updated while voting is actively in progress."
      )
    }

    // 4. Validate preferences payload
    if (
      !preferences.categoryNames ||
      preferences.categoryNames.length === 0 ||
      preferences.categoryNames.length > MAX_SELECTED_CATEGORIES
    ) {
      throw new Error(
        `Please select between 1 and ${MAX_SELECTED_CATEGORIES} categories.`
      )
    }

    if (
      preferences.latitude == null ||
      preferences.longitude == null ||
      isNaN(preferences.latitude) ||
      isNaN(preferences.longitude)
    ) {
      throw new Error("A valid location must be selected.")
    }

    if (!preferences.radius || preferences.radius < 500 || preferences.radius > 10000) {
      throw new Error("Radius must be between 500m and 10km.")
    }

    if (
      !preferences.maxOptions ||
      !(MAX_OPTIONS_VALUES as readonly number[]).includes(preferences.maxOptions)
    ) {
      throw new Error(
        `Places to vote on must be one of: ${MAX_OPTIONS_VALUES.join(", ")}.`
      )
    }

    // 5. Update room-level settings (max_options)
    const { error: roomUpdateError } = await supabase
      .from("rooms")
      .update({
        max_options: preferences.maxOptions,
      })
      .eq("room_id", roomId)

    if (roomUpdateError) {
      throw new Error("Failed to update room settings.")
    }

    // 6. Update room_preferences record
    const { error: prefUpdateError } = await supabase
      .from("room_preferences")
      .update({
        budget: preferences.budget ?? "any",
        address: preferences.address || "",
        latitude: preferences.latitude,
        longitude: preferences.longitude,
        radius: preferences.radius,
      })
      .eq("room_id", roomId)

    if (prefUpdateError) {
      throw new Error("Failed to update room preferences.")
    }

    // 7. Update room_categories associations
    const { data: categories, error: catFetchError } = await supabase
      .from("categories")
      .select("category_id, name")
      .in("name", preferences.categoryNames)

    if (catFetchError) {
      throw new Error("Failed to verify category associations.")
    }

    // Delete existing categories for this room
    const { error: catDeleteError } = await supabase
      .from("room_categories")
      .delete()
      .eq("room_id", roomId)

    if (catDeleteError) {
      console.error("Failed to delete existing room categories:", catDeleteError)
    }

    if (categories && categories.length > 0) {
      const roomCategories = categories.map((cat) => ({
        room_id: roomId,
        category_id: cat.category_id,
      }))
      const { error: catInsertError } = await supabase
        .from("room_categories")
        .upsert(roomCategories, { onConflict: "room_id,category_id" })

      if (catInsertError) {
        console.error("Failed to insert room categories:", catInsertError)
        throw new Error("Failed to update room categories.")
      }
    }

    // 8. Determine excludePlaceIds for option regeneration
    let excludePlaceIds: string[] = []
    if (source === "result") {
      const { data: existingOptions } = await supabase
        .from("options")
        .select("google_place_id")
        .eq("room_id", roomId)

      excludePlaceIds = (existingOptions ?? [])
        .map((opt) => opt.google_place_id)
        .filter((id): id is string => Boolean(id))
    }

    // 9. Regenerate fresh candidates with Google Places & closed place filtering
    const freshCandidates = await generate({
      categoryNames: preferences.categoryNames,
      latitude: preferences.latitude,
      longitude: preferences.longitude,
      radius: preferences.radius,
      budget: preferences.budget ?? "any",
      maxOptions: preferences.maxOptions,
      excludePlaceIds: excludePlaceIds.length > 0 ? excludePlaceIds : undefined,
    })

    if (!freshCandidates || freshCandidates.length === 0) {
      throw new Error(
        "No open venues found nearby matching these preferences. Try expanding your search radius or changing categories."
      )
    }

    // 10. Persist fresh candidate options
    if (source === "lobby") {
      // In lobby, check if any swipes exist; if none, clean up previous unvoted options
      const { count: swipeCount } = await supabase
        .from("swipes")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId)

      if (!swipeCount || swipeCount === 0) {
        await supabase.from("options").delete().eq("room_id", roomId)
      }
    }

    await createOptions(supabase, roomId, freshCandidates)

    // 11. Handle state transitions based on source
    if (source === "result") {
      // When updated from Result / Retry, activate room for a fresh voting round
      const { error: activateError } = await supabase
        .from("rooms")
        .update({
          status: "active",
          result_option_id: null,
        })
        .eq("room_id", roomId)

      if (activateError) {
        throw new Error("Failed to activate room for voting.")
      }

      // Reset host participant status to "voting"
      await supabase
        .from("participants")
        .update({ status: "voting" })
        .eq("participant_id", participant.participant_id)
    }
    // Note: If source === "lobby", room status remains "lobby" so host can review before starting

    return {
      success: true,
      optionsCreated: freshCandidates.length,
      source,
    }
  } catch (error) {
    console.error("UPDATE ROOM PREFERENCES ACTION ERROR:", error)
    throw error
  }
}
