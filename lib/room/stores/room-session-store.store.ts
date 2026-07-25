import { create } from "zustand";

interface RoomSessionStore {
  roomId?: string
  roomCode?: string
  participantId?: string
  isHost: boolean

  setSession: (session: {
    roomId: string
    roomCode?: string
    participantId: string
    isHost: boolean
  }) => void

  clearSession: () => void
}

export const useRoomSessionStore = create<RoomSessionStore>((set) => ({
  roomId: undefined,
  roomCode: undefined,
  participantId: undefined,
  isHost: false,

  setSession:(session) =>
    set({
        roomId: session.roomId,
        roomCode: session.roomCode,
        participantId: session.participantId,
        isHost: session.isHost,
    }),

  clearSession: () =>
    set({
      roomId: undefined,
      roomCode: undefined,
      participantId: undefined,
      isHost: false,
    }),
}));