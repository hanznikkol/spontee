"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ExplanationContext,
  OptionVoteTally,
  ResultType,
  RoomPreferenceContext,
  WinnerReason,
} from '../result.types'
import { RoomOption } from '../../create/types/option-types'
import {
  calculateRoomResult,
  getOptionById,
  getParticipantCount,
  getOptionCount,
  getRoomPreferences,
} from '../service/result.service'
import {
  fetchResultExplanation,
  getDeterministicExplanation,
} from '../service/result-explanation.service'
import { getRoom, subscribeRoom } from '../../lobby/service/lobby.service'
import { updateRoom } from '../../create/helpers/room-helper'
import { useRoomSessionStore } from '../../main/stores/room-session-store.store'
import { startVoting } from '../../lobby/service/participant.service'
import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useResult() {
  const params = useParams()
  const router = useRouter()
  const code = typeof params?.code === 'string' ? params.code.toUpperCase() : ''
  const participantId = useRoomSessionStore((state) => state.participantId)
  const isHost = useRoomSessionStore((state) => state.isHost)

  const [resultType, setResultType] = useState<ResultType | null>(null)
  const [winnerReason, setWinnerReason] = useState<WinnerReason | undefined>(undefined)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [option, setOption] = useState<RoomOption | null>(null)
  const [preferences, setPreferences] = useState<RoomPreferenceContext | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [totalOptions, setTotalOptions] = useState(0)
  const [winnerGoCount, setWinnerGoCount] = useState(0)
  const [tally, setTally] = useState<OptionVoteTally[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    let roomChannel: RealtimeChannel | null = null

    async function loadResult() {
      if (!code) {
        setError('No room code provided.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 1. Fetch the room by code
        const { data: roomData, error: roomError } = await getRoom(code)

        if (roomError || !roomData) {
          throw new Error('Room not found or could not be loaded.')
        }

        if (isCancelled) return
        setRoomId(roomData.room_id)

        // Subscribe to room changes (allows participants to automatically re-enter voting when retry happens)
        roomChannel = subscribeRoom(roomData.room_id, async (payload) => {
          if (isCancelled) return
          const updated = updateRoom(payload)
          if (updated.status === 'active') {
            if (participantId) {
              try {
                await startVoting(participantId)
              } catch {
                // Ignore if already active
              }
            }
            router.replace(`/room/${code}`)
          }
        })
        roomChannel.subscribe()

        // 2. Calculate the room result
        const result = await calculateRoomResult({
          roomId: roomData.room_id,
        })

        if (isCancelled) return

        setResultType(result.type)
        setWinnerReason(result.winnerReason)
        setWinnerGoCount(result.winnerGoCount)
        setTally(result.tally)

        // 3. Fetch winning option if one exists
        let winningOption: RoomOption | null = null
        if (result.type === 'no_match' || result.type === 'retry' || !result.optionId) {
          setOption(null)
        } else {
          winningOption = await getOptionById(result.optionId)
          if (isCancelled) return

          if (!winningOption) {
            throw new Error('Winning place option could not be loaded.')
          }

          setOption(winningOption)
        }

        // 4. Fetch participant and option counts, plus room preferences
        const [pCount, oCount, prefData] = await Promise.all([
          getParticipantCount(roomData.room_id),
          getOptionCount(roomData.room_id),
          getRoomPreferences(roomData.room_id),
        ])

        if (isCancelled) return

        setParticipantCount(pCount)
        setTotalOptions(result.tally.length || oCount)
        setPreferences(prefData)

        // 5. Generate human-readable explanation
        if (winningOption) {
          const explanationContext: ExplanationContext = {
            recommendation: {
              name: winningOption.title,
              goVotes: result.winnerGoCount,
              passVotes: Math.max(0, pCount - result.winnerGoCount),
              rating: winningOption.rating ?? null,
              priceLevel: winningOption.priceLevel ?? null,
            },
            room: {
              participantCount: pCount,
              preferences: {
                category: prefData?.categoryNames?.[0] ?? null,
                budget: prefData?.budget ?? null,
                location: prefData?.address
                  ? prefData.address.split(',')[0].trim()
                  : null,
              },
            },
            winnerReason: result.winnerReason,
            alternatives: result.tally
              ?.filter((item) => !item.isWinner)
              .slice(0, 2)
              .map((item) => ({
                name: item.title,
                goVotes: item.goCount,
              })),
          }

          // Immediately display deterministic explanation (0ms delay)
          const fallbackText = getDeterministicExplanation(explanationContext)
          setExplanation(fallbackText)

          // Progressively refine with AI without blocking UI
          fetchResultExplanation(explanationContext)
            .then((aiText) => {
              if (!isCancelled && aiText) {
                setExplanation(aiText)
              }
            })
            .catch(() => {
              // Silently retain deterministic fallback
            })
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading room result:', err)
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to calculate room results.'
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadResult()

    return () => {
      isCancelled = true
      if (roomChannel) {
        supabase.removeChannel(roomChannel)
      }
    }
  }, [code, participantId, router])

  return {
    code,
    roomId,
    isHost,
    resultType,
    winnerReason,
    option,
    preferences,
    explanation,
    participantCount,
    totalOptions,
    winnerGoCount,
    tally,
    isLoading,
    error,
  }
}



