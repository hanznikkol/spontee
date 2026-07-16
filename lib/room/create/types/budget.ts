export type PreferenceBudget = "any" | "low" | "medium" | "high"

export const budgetChoices: Array<{ value: PreferenceBudget; label: string }> = [
  { value: "any", label: "Any" },
  { value: "low", label: "₱" },
  { value: "medium", label: "₱₱" },
  { value: "high", label: "₱₱₱" },
]