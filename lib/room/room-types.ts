import { Option } from "../options/option-types"
import { PRESET_TIME, TimePreset } from "./time-limits"

export const ROOM_STATUS = {
  LOBBY: "lobby",
  ACTIVE: "active",
  FINISHED: "finished",
} as const

export type RoomStatus = typeof ROOM_STATUS[keyof typeof ROOM_STATUS]

export interface Room {
  room_id: string
  name: string
  mode: RoomMode
  status: RoomStatus

  time_preset: TimePreset
  duration_seconds: number
  ends_at: string | null

  created_at: string
  options: Option[]
}

export type RoomMode = keyof typeof PRESET_TIME
