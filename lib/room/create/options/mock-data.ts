import type { OptionCategory, SuggestionGroup } from "./option-types"

export const optionCategories: OptionCategory[] = [
  { category_id: "food", label: "Food", emoji: "🍔" },
  { category_id: "movies", label: "Movies", emoji: "🎬" },
  { category_id: "games", label: "Games", emoji: "🎮" },
  { category_id: "travel", label: "Travel", emoji: "✈️" },
  { category_id: "activities", label: "Activities", emoji: "🎯" },
  { category_id: "shopping", label: "Shopping", emoji: "🛍️" },
  { category_id: "study", label: "Study", emoji: "📚" },
  { category_id: "anything", label: "Anything", emoji: "🎉" },
]

export const quickSuggestionGroups: SuggestionGroup[] = [
  {
    title: "Templates",
    description: "Ready-made sets for common rooms.",
    source: "template",
    options: [
      { title: "Fast Food", category: "Food" },
      { title: "Movie Night", category: "Movies" },
      { title: "Weekend Trip", category: "Travel" },
    ],
  },
  {
    title: "Popular",
    description: "Fast picks people often vote on.",
    source: "manual",
    options: [
      { title: "Pizza", category: "Food" },
      { title: "Coffee", category: "Food" },
      { title: "Arcade", category: "Games" },
    ],
  },
]
