import { RoomMode } from "./room-types";

export const PRESET_TIME = {
  couple: {
    rush: 120, //2m
    default: 300, //5m
    chill: 900, // 15m
    lazy: 86400, // 24h
  },
  group: {
    rush: 300,
    default: 600,
    chill: 1800,
    lazy: 86400,
  },
} as const

export const PRESET_UI: Record<
  RoomMode,
  { key: TimePreset; label: string }[]
> = {
  couple: [
    { key: "rush", label: "⚡ Rush (2m)" },
    { key: "default", label: "💙 Sponty (5m)" },
    { key: "chill", label: "🌿 Chill (15m)" },
    { key: "lazy", label: "📅 Planning (24h)" },
  ],
  group: [
    { key: "rush", label: "⚡ Fast Vote (5m)" },
    { key: "default", label: "🎯 Sponty (10m)" },
    { key: "chill", label: "🧠 Think (30m)" },
    { key: "lazy", label: "📅 Lazy (24h)" },
  ],
}

export type TimePreset = keyof typeof PRESET_TIME["couple"]