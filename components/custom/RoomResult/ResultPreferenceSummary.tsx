import { MapPin, Sparkles, Navigation, Coins } from 'lucide-react'
import { RoomPreferenceContext } from '@/lib/room/result/result.types'
import { categories } from '@/lib/room/create/types/categories'
import { budgetChoices, PreferenceBudget } from '@/lib/room/create/types/budget'
import { formatDistance } from '@/lib/room/create/utils/geo.utils'

interface ResultPreferenceSummaryProps {
  preferences: RoomPreferenceContext
}

export default function ResultPreferenceSummary({
  preferences,
}: ResultPreferenceSummaryProps) {
  const { address, budget, radius, categoryNames } = preferences

  // Map category names to catalog emojis and labels
  const categoryItems = (categoryNames ?? []).map((name) => {
    const found = categories.find((c) => c.name.toLowerCase() === name.toLowerCase())
    return {
      name,
      label: found?.label ?? name.charAt(0).toUpperCase() + name.slice(1),
      emoji: found?.emoji ?? '📍',
    }
  })

  // Map budget value to display label
  const budgetItem = budget
    ? budgetChoices.find((b) => b.value === (budget.toLowerCase() as PreferenceBudget))
    : null
  const budgetLabel = budgetItem?.label ?? (budget ? budget.toUpperCase() : null)

  // Short location display
  const shortAddress = address
    ? address.split(',')[0].trim() || address
    : null

  // Radius label
  const radiusLabel = radius ? formatDistance(radius) : null

  const hasAnyPreference =
    categoryItems.length > 0 || budgetLabel || shortAddress || radiusLabel

  if (!hasAnyPreference) return null

  return (
    <div className="w-full flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-border/70 bg-muted/30 backdrop-blur-xs">
      {/* Contextual Subtitle */}
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
        <span>Based on your room preferences</span>
      </div>

      {/* Responsive Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Selected Categories */}
        {categoryItems.map((cat) => (
          <span
            key={cat.name}
            className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs"
          >
            <span className="text-sm leading-none">{cat.emoji}</span>
            <span>{cat.label}</span>
          </span>
        ))}

        {/* Budget tier */}
        {budgetLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs">
            <Coins className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>{budgetLabel === 'Any' ? 'Any Budget' : budgetLabel}</span>
          </span>
        )}

        {/* Target Location / Area */}
        {shortAddress && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs max-w-full"
            title={address || ''}
          >
            <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
            <span className="truncate max-w-44 sm:max-w-64">{shortAddress}</span>
          </span>
        )}

        {/* Search Radius */}
        {radiusLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border/80 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
            <Navigation className="h-3 w-3 text-cyan-500 shrink-0" />
            <span>Within {radiusLabel}</span>
          </span>
        )}
      </div>
    </div>
  )
}
