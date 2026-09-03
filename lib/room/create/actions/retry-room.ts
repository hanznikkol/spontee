"use server"

import { createClient } from "@/lib/supabase/server"
import { generate } from "../services/option.service"
import { createOptions } from "../services/room.service"
import { PreferenceBudget } from "../types/budget"

interface RetryRoomPayload {
  roomId: string
}

export async function retryRoomAction({ roomId }: RetryRoomPayload) {
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

    // 2. Verify participant belongs to the room and is host
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
      throw new Error("Only the host can start a retry round.")
    }

    // 3. Fetch previously presented options for this room to avoid duplicates
    const { data: existingOptions, error: optionsError } = await supabase
      .from("options")
      .select("google_place_id")
      .eq("room_id", roomId)

    if (optionsError) {
      throw new Error("Failed to inspect previous options.")
    }

    const excludePlaceIds = (existingOptions ?? [])
      .map((opt) => opt.google_place_id)
      .filter((id): id is string => Boolean(id))

    // 4. Fetch room metadata, preferences, and categories
    const [roomRes, prefRes, catRes] = await Promise.all([
      supabase
        .from("rooms")
        .select("max_options, status")
        .eq("room_id", roomId)
        .single(),
      supabase
        .from("room_preferences")
        .select("latitude, longitude, radius, budget")
        .eq("room_id", roomId)
        .single(),
      supabase
        .from("room_categories")
        .select("categories(name)")
        .eq("room_id", roomId),
    ])

    if (roomRes.error || !roomRes.data) {
      throw new Error("Room could not be loaded.")
    }

    if (prefRes.error || !prefRes.data) {
      throw new Error("Room preferences could not be loaded.")
    }

    const pref = prefRes.data
    const categoryNames: string[] = []

    if (catRes.data) {
      for (const item of catRes.data) {
        const cat = item.categories as unknown
        if (Array.isArray(cat)) {
          for (const c of cat) {
            if (c && typeof (c as { name?: unknown }).name === "string") {
              categoryNames.push((c as { name: string }).name)
            }
          }
        } else if (cat && typeof (cat as { name?: unknown }).name === "string") {
          categoryNames.push((cat as { name: string }).name)
        }
      }
    }

    if (pref.latitude == null || pref.longitude == null) {
      throw new Error("Room location coordinates are missing.")
    }

    // 5. Generate fresh candidates excluding previously presented venues
    const freshCandidates = await generate({
      categoryNames,
      latitude: pref.latitude,
      longitude: pref.longitude,
      radius: pref.radius ?? 3000,
      budget: (pref.budget as PreferenceBudget) ?? "any",
      maxOptions: roomRes.data.max_options ?? 10,
      excludePlaceIds,
    })

    if (!freshCandidates || freshCandidates.length === 0) {
      throw new Error(
        "No more open venues available nearby for your preferences. Try changing preferences."
      )
    }

    // 6. Insert new options for the new round
    await createOptions(supabase, roomId, freshCandidates)

    // 7. Transition room status to "active" and reset result_option_id
    const { error: roomUpdateError } = await supabase
      .from("rooms")
      .update({
        status: "active",
        result_option_id: null,
      })
      .eq("room_id", roomId)

    if (roomUpdateError) {
      throw new Error("Failed to activate room for retry.")
    }

    // 8. Update the host participant's status to "voting"
    await supabase
      .from("participants")
      .update({ status: "voting" })
      .eq("participant_id", participant.participant_id)

    return {
      success: true,
      optionsCreated: freshCandidates.length,
    }
  } catch (error) {
    console.error("RETRY ROOM ACTION ERROR:", error)
    throw error
  }
}
