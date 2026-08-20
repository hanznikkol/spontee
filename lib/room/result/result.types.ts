export type ResultType = "consensus" | "compromise" | "no_match"

export interface CalculateResult {
  roomId: string
}

export interface RoomResult {
  type: ResultType
  optionId: string | null
}