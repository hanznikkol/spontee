import { supabase } from "@/lib/supabase/client"
import { CalculateResult, OptionVoteTally, ResultType, RoomResult, RoomPreferenceContext, WinnerReason } from "../result.types"
import { RoomOption } from "@/lib/room/create/types/option-types"

/**
 * Returns options belonging to the most recent batch/round based on created_at.
 */
export function getCurrentRoundOptions<T extends { created_at?: string | null }>(
  options: T[]
): T[] {
  if (options.length <= 1) return options

  const timestamps = options
    .map((o) => (o.created_at ? new Date(o.created_at).getTime() : 0))
    .filter((t) => t > 0)

  if (timestamps.length === 0) return options

  const latestTime = Math.max(...timestamps)
  const BATCH_THRESHOLD_MS = 10000

  return options.filter((o) => {
    if (!o.created_at) return true
    const t = new Date(o.created_at).getTime()
    return Math.abs(latestTime - t) <= BATCH_THRESHOLD_MS
  })
}

export async function calculateRoomResult({
  roomId,
}: CalculateResult): Promise<RoomResult> {
  // 1. Get participants
  const { data: participants, error: participantsError } =
    await supabase
      .from("participants")
      .select("participant_id, status")
      .eq("room_id", roomId)

  if (participantsError) {
    throw participantsError
  }

  // Make sure everyone finished voting
  const everyoneFinished = participants.every(
    (participant) => participant.status === "finished"
  )

  if (!everyoneFinished) {
    throw new Error("Not all participants have finished voting.")
  }

  // 2. Get options
  const { data: options, error: optionsError } =
    await supabase
      .from("options")
      .select(
        "option_id, title, rating, total_reviews, latitude, longitude, image_urls, price_level, address, created_at"
      )
      .eq("room_id", roomId)

  if (optionsError) {
    throw optionsError
  }

  // 3. Get votes
  const { data: swipes, error: swipesError } =
    await supabase
      .from("swipes")
      .select("option_id, participant_id, vote")
      .eq("room_id", roomId)

  if (swipesError) {
    throw swipesError
  }

  // Filter options to the active round
  const currentOptions = getCurrentRoundOptions(options ?? [])

  // 4. Count Go and Pass votes
  const scoredOptions = currentOptions.map((option) => {
    const goCount = swipes.filter(
      (swipe) =>
        swipe.option_id === option.option_id &&
        swipe.vote === "go"
    ).length

    const passCount = swipes.filter(
      (swipe) =>
        swipe.option_id === option.option_id &&
        swipe.vote === "pass"
    ).length

    return {
      ...option,
      goCount,
      passCount,
    }
  })

  // 5. Find highest score
  const highestScore = scoredOptions.length > 0
    ? Math.max(...scoredOptions.map((option) => option.goCount))
    : 0

  // 6. Nobody selected Go on anything -> RETRY state (Never pick a winner for zero-Go)
  if (highestScore === 0) {
    const tally: OptionVoteTally[] = scoredOptions
      .slice()
      .sort((a, b) => {
        if (b.goCount !== a.goCount) return b.goCount - a.goCount
        if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0)
        if ((b.total_reviews ?? 0) !== (a.total_reviews ?? 0)) {
          return (b.total_reviews ?? 0) - (a.total_reviews ?? 0)
        }
        return a.option_id.localeCompare(b.option_id)
      })
      .map((opt) => ({
        optionId: opt.option_id,
        title: opt.title,
        goCount: opt.goCount,
        passCount: opt.passCount,
        rating: opt.rating,
        totalReviews: opt.total_reviews,
        priceLevel: opt.price_level,
        imageUrl: opt.image_urls?.[0] ?? null,
        address: opt.address ?? null,
        isWinner: false,
      }))

    return {
      type: "retry",
      optionId: null,
      winnerGoCount: 0,
      tally,
    }
  }

  const participantCount = participants.length

  // 7. Get all options tied for highest score
  const candidates = scoredOptions.filter(
    (option) => option.goCount === highestScore
  )

  // 8. Determine result type
  const type: ResultType =
    highestScore === participantCount
      ? "consensus"
      : "compromise"

  // 9. Deterministic tie-break: Rating -> Review Confidence -> Stable option_id
  const { winner, reason: winnerReason } = breakTie(candidates)

  // 10. Generate sorted tally (winner first, then sorted by goCount desc, rating desc, reviews desc, option_id localeCompare)
  const tally: OptionVoteTally[] = scoredOptions
    .slice()
    .sort((a, b) => {
      if (a.option_id === winner.option_id) return -1
      if (b.option_id === winner.option_id) return 1
      if (b.goCount !== a.goCount) return b.goCount - a.goCount
      if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0)
      if ((b.total_reviews ?? 0) !== (a.total_reviews ?? 0)) {
        return (b.total_reviews ?? 0) - (a.total_reviews ?? 0)
      }
      return a.option_id.localeCompare(b.option_id)
    })
    .map((opt) => ({
      optionId: opt.option_id,
      title: opt.title,
      goCount: opt.goCount,
      passCount: opt.passCount,
      rating: opt.rating,
      totalReviews: opt.total_reviews,
      priceLevel: opt.price_level,
      imageUrl: opt.image_urls?.[0] ?? null,
      address: opt.address ?? null,
      isWinner: opt.option_id === winner.option_id,
    }))

  return {
    type,
    optionId: winner.option_id,
    winnerGoCount: highestScore,
    winnerReason,
    tally,
  }
}

export interface CandidateOption {
  option_id: string
  rating: number | null
  total_reviews?: number | null
  latitude?: number | null
  longitude?: number | null
}

/**
 * Deterministically resolves a tie among candidates with equal Go votes:
 * 1. Highest Google rating
 * 2. Highest review count (confidence)
 * 3. Stable option_id string comparison (guarantees cross-device identity)
 *
 * NEVER uses Math.random().
 */
export function breakTie(candidates: CandidateOption[]): {
  winner: CandidateOption
  reason: WinnerReason
} {
  if (candidates.length === 0) {
    throw new Error("No candidates provided for tie break.")
  }

  if (candidates.length === 1) {
    return { winner: candidates[0], reason: "shared_go" }
  }

  // 1. Highest rating
  const highestRating = Math.max(
    ...candidates.map((option) => option.rating ?? 0)
  )

  const ratingCandidates = candidates.filter(
    (option) => (option.rating ?? 0) === highestRating
  )

  if (ratingCandidates.length === 1) {
    return { winner: ratingCandidates[0], reason: "highest_rating" }
  }

  // 2. Highest review count
  const highestReviews = Math.max(
    ...ratingCandidates.map((option) => option.total_reviews ?? 0)
  )

  const reviewCandidates = ratingCandidates.filter(
    (option) => (option.total_reviews ?? 0) === highestReviews
  )

  if (reviewCandidates.length === 1) {
    return { winner: reviewCandidates[0], reason: "most_reviews" }
  }

  // 3. Stable deterministic fallback via option_id
  const sorted = [...reviewCandidates].sort((a, b) =>
    a.option_id.localeCompare(b.option_id)
  )

  return { winner: sorted[0], reason: "stable_tiebreak" }
}

export async function getOptionById(optionId: string): Promise<RoomOption | null> {
  const { data, error } = await supabase
    .from("options")
    .select("*")
    .eq("option_id", optionId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    option_id: data.option_id,
    title: data.title,
    description: data.description ?? undefined,
    googlePlaceId: data.google_place_id ?? undefined,
    address: data.address ?? undefined,
    latitude: data.latitude ?? undefined,
    longitude: data.longitude ?? undefined,
    rating: data.rating ?? undefined,
    totalReviews: data.total_reviews ?? undefined,
    imageUrls: data.image_urls ?? [],
    priceLevel: data.price_level ?? undefined,
    distanceMeters: data.distance_meters ?? undefined,
  }
}

export async function getParticipantCount(roomId: string): Promise<number> {
  const { count, error } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)

  if (error) {
    throw error
  }

  return count ?? 0
}

export async function getOptionCount(roomId: string): Promise<number> {
  const { count, error } = await supabase
    .from("options")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)

  if (error) {
    throw error
  }

  return count ?? 0
}

export async function getRoomPreferences(roomId: string): Promise<RoomPreferenceContext | null> {
  const [prefRes, catRes] = await Promise.all([
    supabase
      .from("room_preferences")
      .select("address, budget, radius, latitude, longitude")
      .eq("room_id", roomId)
      .maybeSingle(),
    supabase
      .from("room_categories")
      .select("category_id, categories(name)")
      .eq("room_id", roomId),
  ])

  const pref = prefRes.data
  const catNames: string[] = []
  if (catRes.data) {
    for (const item of catRes.data) {
      const cat = item.categories as unknown
      if (Array.isArray(cat)) {
        for (const c of cat) {
          if (c && typeof (c as { name?: unknown }).name === "string") {
            catNames.push((c as { name: string }).name)
          }
        }
      } else if (cat && typeof (cat as { name?: unknown }).name === "string") {
        catNames.push((cat as { name: string }).name)
      }
    }
  }

  if (!pref && catNames.length === 0) {
    return null
  }

  return {
    address: pref?.address ?? null,
    budget: pref?.budget ?? null,
    radius: pref?.radius ?? null,
    latitude: pref?.latitude ?? null,
    longitude: pref?.longitude ?? null,
    categoryNames: catNames,
  }
}


