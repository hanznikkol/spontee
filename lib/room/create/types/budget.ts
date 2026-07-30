  // FOR UI
  export type PreferenceBudget = "any" | "low" | "medium" | "high"

  export const budgetChoices: Array<{ value: PreferenceBudget; label: string }> = [
    { value: "any", label: "Any" },
    { value: "low", label: "₱" },
    { value: "medium", label: "₱₱" },
    { value: "high", label: "₱₱₱" },
  ]

  // Google Response
  export type GooglePriceLevel = 
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE"