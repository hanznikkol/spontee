export type ResultType = "consensus" | "compromise" | "no_match"

export interface OptionVoteTally {
  optionId: string
  title: string
  goCount: number
  passCount: number
  rating?: number | null
  priceLevel?: number | null
  imageUrl?: string | null
  address?: string | null
  isWinner: boolean
}

export interface CalculateResult {
  roomId: string
}

export interface RoomPreferenceContext {
  address?: string | null
  budget?: string | null
  radius?: number | null
  categoryNames?: string[]
}

export interface RoomResult {
  type: ResultType
  optionId: string | null
  winnerGoCount: number
  tally: OptionVoteTally[]
}

export interface ExplanationContext {
  recommendation: {
    name: string
    goVotes: number
    passVotes: number
    rating?: number | null
    priceLevel?: number | null
  }
  room: {
    participantCount: number
    preferences?: {
      category?: string | null
      budget?: string | null
      location?: string | null
    }
  }
  alternatives?: Array<{
    name: string
    goVotes: number
  }>
}

