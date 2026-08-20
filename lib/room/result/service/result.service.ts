import { supabase } from "@/lib/supabase/client"
import { CalculateResult, ResultType, RoomResult } from "../result.types"

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
        "option_id, rating, latitude, longitude"
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

  // 4. Count Go votes
  const scoredOptions = options.map((option) => {
    const goCount = swipes.filter(
      (swipe) =>
        swipe.option_id === option.option_id &&
        swipe.vote === "GO"
    ).length

    return {
      ...option,
      goCount,
    }
  })

  // 5. Find highest score
  const highestScore = Math.max(
    ...scoredOptions.map((option) => option.goCount)
  )

  // 6. Nobody wants anything
  if (highestScore === 0) {
    return {
      type: "no_match",
      optionId: null,
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

  return {
    type,
    optionId: winner.option_id,
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