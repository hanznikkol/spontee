"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { OptionVoteTally, ResultType, RoomPreferenceContext } from '../result.types'
import { RoomOption } from '../../create/types/option-types'
import {
  calculateRoomResult,
  getOptionById,
  getParticipantCount,
  getOptionCount,
  getRoomPreferences,
} from '../service/result.service'
import { getRoom } from '../../lobby/service/lobby.service'

export function useResult() {
  const params = useParams()
  const code = typeof params?.code === 'string' ? params.code.toUpperCase() : ''

  const [resultType, setResultType] = useState<ResultType | null>(null)
  const [option, setOption] = useState<RoomOption | null>(null)
  const [preferences, setPreferences] = useState<RoomPreferenceContext | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [totalOptions, setTotalOptions] = useState(0)
  const [winnerGoCount, setWinnerGoCount] = useState(0)
  const [tally, setTally] = useState<OptionVoteTally[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

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

        // 2. Calculate the room result
        const result = await calculateRoomResult({
          roomId: roomData.room_id,
        })

        if (isCancelled) return

        setResultType(result.type)
        setWinnerGoCount(result.winnerGoCount)
        setTally(result.tally)

        // 3. Fetch winning option if one exists
        if (result.type === 'no_match' || !result.optionId) {
          setOption(null)
        } else {
          const winningOption = await getOptionById(result.optionId)
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
        setTotalOptions(oCount)
        setPreferences(prefData)
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
    }
  }, [code])

  return {
    code,
    resultType,
    option,
    preferences,
    participantCount,
    totalOptions,
    winnerGoCount,
    tally,
    isLoading,
    error,
  }
}


