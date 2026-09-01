import { supabase } from "@/lib/supabase/client"
import { CalculateResult, OptionVoteTally, ResultType, RoomResult, RoomPreferenceContext } from "../result.types"
import { RoomOption } from "@/lib/room/create/types/option-types"

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
        "option_id, title, rating, latitude, longitude, image_urls, price_level, address"
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

  // 4. Count Go and Pass votes
  const scoredOptions = options.map((option) => {
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
  const highestScore = Math.max(
    ...scoredOptions.map((option) => option.goCount)
  )

  // 6. Nobody wants anything
  if (highestScore === 0) {
    const tally: OptionVoteTally[] = scoredOptions
      .slice()
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .map((opt) => ({
        optionId: opt.option_id,
        title: opt.title,
        goCount: opt.goCount,
        passCount: opt.passCount,
        rating: opt.rating,
        priceLevel: opt.price_level,
        imageUrl: opt.image_urls?.[0] ?? null,
        address: opt.address ?? null,
        isWinner: false,
      }))

    return {
      type: "no_match",
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

  // 9. Tie-break
  const winner = breakTie(candidates)

  // 10. Generate sorted tally (winner first, then sorted by goCount desc, then rating desc)
  const tally: OptionVoteTally[] = scoredOptions
    .slice()
    .sort((a, b) => {
      if (a.option_id === winner.option_id) return -1
      if (b.option_id === winner.option_id) return 1
      if (b.goCount !== a.goCount) return b.goCount - a.goCount
      return (b.rating ?? 0) - (a.rating ?? 0)
    })
    .map((opt) => ({
      optionId: opt.option_id,
      title: opt.title,
      goCount: opt.goCount,
      passCount: opt.passCount,
      rating: opt.rating,
      priceLevel: opt.price_level,
      imageUrl: opt.image_urls?.[0] ?? null,
      address: opt.address ?? null,
      isWinner: opt.option_id === winner.option_id,
    }))

  return {
    type,
    optionId: winner.option_id,
    winnerGoCount: highestScore,
    tally,
  }
}


function breakTie(
  candidates: Array<{
    option_id: string
    rating: number | null
    latitude: number | null
    longitude: number | null
  }>
) {
  if (candidates.length === 1) {
    return candidates[0]
  }

  // Highest rating
  const highestRating = Math.max(
    ...candidates.map((option) => option.rating ?? 0)
  )

  const ratingCandidates = candidates.filter(
    (option) => (option.rating ?? 0) === highestRating
  )

  if (ratingCandidates.length === 1) {
    return ratingCandidates[0]
  }

  // TODO:
  // Distance tie-breaker

  // Final fallback
  const randomIndex = Math.floor(
    Math.random() * ratingCandidates.length
  )

  return ratingCandidates[randomIndex]
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
      .select("address, budget, radius")
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
    categoryNames: catNames,
  }
}


