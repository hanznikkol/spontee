export type SwipeDirection = 'left' | 'right'

export interface Swipe {
  swipe_id: string
  room_id: string
  option_id: string
  user_id: string | null
  direction: SwipeDirection
  swiped_at: string
}