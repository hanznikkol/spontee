export type Phase = 'swiping' | 'result'
export type SwipeDirection = 'left' | 'right'
export type Vote = 'go' | 'pass'
export type VoteFilter = 'all' | 'go' | 'pass'

export interface Swipe {
  swipe_id: string
  room_id: string
  option_id: string
  participant_id: string | null
  vote: Vote
  swiped_at: string
}

export interface UserVote {
  swipe_id?: string
  option_id: string
  title: string
  address?: string | null
  rating?: number | null
  price_level?: number | null
  image_urls?: string[]
  vote: Vote
  swiped_at?: string
}

export interface MyVotesSummary {
  total: number
  goCount: number
  passCount: number
}