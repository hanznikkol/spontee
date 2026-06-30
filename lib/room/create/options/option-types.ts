export type OptionSource = "manual" | "template" | "ai" | "search" | "import"

export type OptionCategoryId =
  | "food"
  | "movies"
  | "games"
  | "travel"
  | "activities"
  | "shopping"
  | "study"
  | "anything"

export type OptionCategory = {
  category_id: OptionCategoryId
  label: string
  emoji: string
}

export type RoomOption = {
  option_id: string
  title: string
  description?: string
  category?: string
  source: OptionSource
  imageUrl?: string
}

export type SuggestionGroup = {
  title: string
  description: string
  source: OptionSource
  options: Array<{  
    title: string
    category: string
  }>
}
