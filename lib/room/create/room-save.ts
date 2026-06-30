import { RoomMode, RoomVisibilityTypes } from "./room-types"
import { TimePreset } from "./time-limits"

interface SaveRoomSetupParams {
  roomName: string
  roomVisibility: RoomVisibilityTypes
  roomPassword: string
  mode: RoomMode | null
  timePreset: TimePreset | null
}

export const saveHostName = (hostName: string) => {
  sessionStorage.setItem("hostName", hostName)
}

export const getHostName = () => {
  return sessionStorage.getItem("hostName") ?? ""
}

export const saveRoomSetup = ({
  roomName,
  roomVisibility,
  roomPassword,
  mode,
  timePreset,
}: SaveRoomSetupParams): void => {
  sessionStorage.setItem(
    "roomSetup",
    JSON.stringify({
      roomName,
      roomVisibility,
      roomPassword,
      mode,
      timePreset,
    })
  )
}
