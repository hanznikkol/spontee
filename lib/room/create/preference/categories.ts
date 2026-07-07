export type PreferenceCategory = {
  category: string
  label: string
  emoji: string
}

export const categories: PreferenceCategory[] = [
  { category: "food", label: "Food", emoji: "🍔" },
  { category: "coffee", label: "Coffee", emoji: "☕" },
  { category: "dessert", label: "Dessert", emoji: "🍰" },
  { category: "drinks", label: "Drinks", emoji: "🍹" },
  { category: "movies", label: "Movies", emoji: "🎬" },
  { category: "activities", label: "Activities", emoji: "🎳" },
  { category: "shopping", label: "Shopping", emoji: "🛍" },
  { category: "parks", label: "Parks", emoji: "🌳" },
  { category: "bars", label: "Bars", emoji: "🍻" },
  { category: "karaoke", label: "Karaoke", emoji: "🎤" },
  { category: "gaming", label: "Gaming", emoji: "🎮" },
  { category: "wellness", label: "Wellness", emoji: "🧘" },
]