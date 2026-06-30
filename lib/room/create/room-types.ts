import { RoomOption } from "../options/types"
import { PRESET_TIME, TimePreset } from "./time-limits"

export const ROOM_STATUS = {
  LOBBY: "lobby",
  SWIPING: "swiping",
  RESULT: "result",
} as const

export type RoomVisibilityTypes = "public" | "private"

export type RoomStatus =typeof ROOM_STATUS[keyof typeof ROOM_STATUS]

export interface Room {
  room_id: string
  room_code: string
  room_name: string
  mode: RoomMode
  status: RoomStatus

  time_preset: TimePreset
  duration_seconds: number
  ends_at: string | null

  visibility: RoomVisibilityTypes
  created_at: string
  options: RoomOption[]
}

export type RoomMode = keyof typeof PRESET_TIME
