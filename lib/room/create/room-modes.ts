import { RoomMode } from "./room-types";

type Modes = {
    id: RoomMode,
    emoji: string,
    label: string,
    desc: string
}

export const MODES: Modes[] = [
  {
    id: 'couple',
    emoji: '👩‍❤️‍👨',
    label: 'For Two',
    desc: 'Perfect for dates & couples',
  },
  {
    id: 'group',
    emoji: '👯',
    label: 'For Group',
    desc: 'Barkada, family & friends',
  },
]