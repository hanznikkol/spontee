/**
 * useRoom — stub hook for room data
 *
 * Currently reads from localStorage.
 * When Supabase is ready, swap the internals:
 *   - reads  → supabase.from('rooms').select(...)
 *   - writes → supabase.from('rooms').update(...)
 *   - realtime → supabase.channel('room:id').on('postgres_changes', ...)
 */

import { useState, useEffect } from 'react'
import { Option } from '@/lib/options/option-types'
import { RoomMode, RoomStatus } from '@/lib/room/room-types'

type RoomData = {
  name: string
  mode: RoomMode | null
  status: RoomStatus
  options: Option[]
}

export function useRoom(roomId: string): {
  room: RoomData | null
  isLoading: boolean
  setStatus: (status: RoomStatus) => void
} {
  const [room, setRoom] = useState<RoomData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // localStorage read — replace with Supabase query
    const name = localStorage.getItem(`room:${roomId}:name`) ?? 'Room'
    const mode = (localStorage.getItem(`room:${roomId}:mode`) as RoomMode) ?? null
    const status = (localStorage.getItem(`room:${roomId}:status`) as RoomStatus) ?? 'lobby'
    const raw = localStorage.getItem(`room:${roomId}:options`)

    let options: Option[] = []
    try { if (raw) options = JSON.parse(raw) } catch { /* noop */ }

    try{

    } catch {
        
    }

    setRoom({ name, mode, status, options })
    setIsLoading(false)
  }, [roomId])

  const setStatus = (status: RoomStatus) => {
    localStorage.setItem(`room:${roomId}:status`, status)
    setRoom(prev => prev ? { ...prev, status } : prev)
  }

  return { room, isLoading, setStatus }
}