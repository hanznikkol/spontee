// THIS IS FOR UI
export type PreferenceCategory = {
  name: string
  label: string
  emoji: string
}

export const categories: PreferenceCategory[] = [
  { name: "food", label: "Food", emoji: "🍔" },
  { name: "coffee", label: "Coffee", emoji: "☕" },
  { name: "dessert", label: "Dessert", emoji: "🍰" },
  { name: "drinks", label: "Drinks", emoji: "🍹" },
  { name: "entertainment", label: "Entertainment", emoji: "🎳" },
  { name: "shopping", label: "Shopping", emoji: "🛍️" },
  { name: "parks", label: "Parks", emoji: "🌳" },
  { name: "bars", label: "Bars", emoji: "🍻" },
  { name: "karaoke", label: "Karaoke", emoji: "🎤" },
  { name: "sports", label: "Sports", emoji: "⚽" },
  { name: "wellness", label: "Wellness", emoji: "🧘" },
]