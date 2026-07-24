export const PARTICIPANT_STATUS = {
  WAITING: "waiting",
  VOTING: "voting",
  FINISHED: "finished",
} as const

export type ParticipantStatus = typeof PARTICIPANT_STATUS[keyof typeof PARTICIPANT_STATUS]

export type Participants = {
  participant_id: string
  user_id: string
  display_name: string
  session_id: string
  is_host: boolean
  status: ParticipantStatus
  joined_at: string
}