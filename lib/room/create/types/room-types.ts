import { RoomOption } from "./option-types"

export const ROOM_STATUS = {
  LOBBY: "lobby",     // Waiting for the host
  ACTIVE: "active",   // Room is open
  RESULT: "result",   // Everyone finished
  CLOSED: "closed",   // Room ended
} as const

export type RoomStatus =typeof ROOM_STATUS[keyof typeof ROOM_STATUS]

export interface Room {
  room_id: string
  room_code: string
  room_name: string
  status: RoomStatus
  ends_at: string | null
  created_at: string
  options: RoomOption[]
  max_participants: number
  max_options?: number
}


