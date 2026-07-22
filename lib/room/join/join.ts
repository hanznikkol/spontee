export function extractRoomCode(value: string, baseUrl: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  try {
    const parsedUrl = new URL(trimmed, baseUrl)
    const queryRoom = parsedUrl.searchParams.get("room")
    if (queryRoom) return queryRoom

    const segments = parsedUrl.pathname.split("/").filter(Boolean)
    const roomIndex = segments.indexOf("room")
    if (roomIndex !== -1 && segments[roomIndex + 1]) {
      return segments[roomIndex + 1]
    }
  } catch {
  }

  return trimmed.replace(/^\/+/, "")
}