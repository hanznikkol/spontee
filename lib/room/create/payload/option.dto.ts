import { PreferenceBudget } from "../types/budget"

export interface GenerateOptionsPayload {
  categoryNames: string[]
  budget?: PreferenceBudget
  latitude: number
  longitude: number
  radius: number
  maxOptions: number
  excludePlaceIds?: string[]
}