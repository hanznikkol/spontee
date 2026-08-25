export type Phase = 'swiping' | 'result'
export type SwipeDirection = 'left' | 'right'
export type Vote = 'go' | 'pass'

export interface Swipe {
  swipe_id: string
  room_id: string
  option_id: string
  participant_id: string | null
  vote: Vote
  swiped_at: string
}