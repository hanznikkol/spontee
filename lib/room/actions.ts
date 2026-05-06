import { Room } from "./room-types"

export function saveRoom(room: Room) {
  localStorage.setItem(`room:${room.room_id}`, JSON.stringify(room))
}

export function getRoom(roomId: string): Room | null {
  const raw = localStorage.getItem(`room:${roomId}`)
  if (!raw) return null
  return JSON.parse(raw)
}