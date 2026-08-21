import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export const useRoomSessionStore = create<RoomSessionStore>()(
  persist(
    (set) => ({
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
  }),

  {
    name: "spontee-room-session"
  }
));