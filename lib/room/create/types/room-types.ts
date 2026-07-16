import { RoomOption } from "./option-types"

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
  status: RoomStatus
  ends_at: string | null

  visibility: RoomVisibilityTypes
  created_at: string
  options: RoomOption[]
}


