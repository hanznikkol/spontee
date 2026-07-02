export type OptionSource = "manual" | "nearby" | "ai"

export type DefaultCategory =
  | "food"
  | "movies"
  | "games"
  | "travel"
  | "activities"
  | "shopping"
  | "study"
  | "anything"

export type DefaultCategoryItem = {
  category: DefaultCategory
  label: string
  emoji: string
}

export type SuggestedOption = {
  title: string
  category: DefaultCategory
  source: OptionSource
}

export type OptionTemplate = {
  id: string
  title: string
  description: string
  category: DefaultCategory
  options: string[]
}

export type RoomOption = {
  option_id: string
  title: string
  description?: string
  category?: DefaultCategory
  source: OptionSource
  imageUrl?: string
}