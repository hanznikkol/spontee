export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

  const part = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("")

  return `${part()}-${part()}`
}

export function createOptionId(title: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`
}