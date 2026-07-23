import { Room } from "../../create/types/room-types"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export function updateRoom( payload: RealtimePostgresChangesPayload<Room> ): Room {
  return payload.new as Room
}

