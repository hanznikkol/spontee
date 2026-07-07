import { PreferenceCategory } from "./categories"

export type OptionSource = "manual" | "nearby" | "ai"

export type OptionTemplate = {
  id: string
  title: string
  description: string
  category: PreferenceCategory
  options: string[]
}

export type RoomOption = {
  option_id: string
  title: string
  description?: string
  category?: PreferenceCategory
  source: OptionSource
  imageUrl?: string
}