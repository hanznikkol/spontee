import { useEffect, useMemo, useState } from "react"
import { UserVote, VoteFilter } from "../types/vote.types"
import { getParticipantVotes } from "../service/vote.service"

interface UseMyVotesProps {
  roomId?: string
  participantId?: string
  initialVotes?: UserVote[]
  isOpen?: boolean
}

export function useMyVotes({
  roomId,
  participantId,
  initialVotes,
  isOpen = false,
}: UseMyVotesProps) {
  const [fetchedVotes, setFetchedVotes] = useState<UserVote[]>([])
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<VoteFilter>("all")

  // If initialVotes are passed (e.g. from useVoting during active voting), use them.
  // Otherwise, use fetchedVotes (e.g. on Waiting page).
  const isUsingInitialVotes = initialVotes !== undefined

  const votes = useMemo(() => {
    return isUsingInitialVotes ? initialVotes : fetchedVotes
  }, [isUsingInitialVotes, initialVotes, fetchedVotes])

  const targetKey = roomId && participantId ? `${roomId}:${participantId}` : null

  // Fetch when opened or when IDs change, if not using initial votes
  useEffect(() => {
    let cancelled = false

    if (!isOpen || isUsingInitialVotes || !roomId || !participantId) return

    getParticipantVotes(roomId, participantId)
      .then((data) => {
        if (!cancelled) {
          setFetchedVotes(data)
          setLoadedFor(`${roomId}:${participantId}`)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load user votes:", err)
          setError("Failed to load your votes. Please try again.")
          setLoadedFor(`${roomId}:${participantId}`)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, isUsingInitialVotes, roomId, participantId])

  const loading = !isUsingInitialVotes && Boolean(isOpen && targetKey && loadedFor !== targetKey && !error)

  // Compute counts
  const goCount = useMemo(() => votes.filter((v) => v.vote === "go").length, [votes])
  const passCount = useMemo(() => votes.filter((v) => v.vote === "pass").length, [votes])
  const totalCount = votes.length

  // Filtered list based on active tab
  const filteredVotes = useMemo(() => {
    if (filter === "go") return votes.filter((v) => v.vote === "go")
    if (filter === "pass") return votes.filter((v) => v.vote === "pass")
    return votes
  }, [votes, filter])

  const refetch = () => {
    if (!roomId || !participantId || isUsingInitialVotes) return
    setLoadedFor(null)
  }

  return {
    votes,
    filteredVotes,
    filter,
    setFilter,
    loading,
    error,
    goCount,
    passCount,
    totalCount,
    refetch,
  }
}
