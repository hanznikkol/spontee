import {
  MapPin,
  LocateFixed,
  Wallet,
  Utensils,
  Coffee,
  Cake,
  Wine,
  Beer,
  Gamepad2,
  ShoppingBag,
  Trees,
  Mic,
  Dumbbell,
  HeartPulse,
  Tag,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { RoomPreferenceContext } from '@/lib/room/result/result.types'
import { categories } from '@/lib/room/create/types/categories'
import { budgetChoices, PreferenceBudget } from '@/lib/room/create/types/budget'
import { formatDistance } from '@/lib/room/create/utils/geo.utils'

interface ResultPreferenceSummaryProps {
  preferences: RoomPreferenceContext
  explanation?: string | null
}

function getCategoryIcon(name: string) {
  switch (name.toLowerCase()) {
    case 'food':
      return Utensils
    case 'coffee':
      return Coffee
    case 'dessert':
      return Cake
    case 'drinks':
      return Wine
    case 'bars':
      return Beer
    case 'entertainment':
      return Gamepad2
    case 'shopping':
      return ShoppingBag
    case 'parks':
      return Trees
    case 'karaoke':
      return Mic
    case 'sports':
      return Dumbbell
    case 'wellness':
      return HeartPulse
    default:
      return Tag
  }
}

export default function ResultPreferenceSummary({
  preferences,
  explanation,
}: ResultPreferenceSummaryProps) {
  const { address, budget, radius, categoryNames } = preferences

  // Map category names to clean Lucide icons and labels
  const categoryItems = (categoryNames ?? []).map((name) => {
    const found = categories.find((c) => c.name.toLowerCase() === name.toLowerCase())
    return {
      name,
      label: found?.label ?? name.charAt(0).toUpperCase() + name.slice(1),
      Icon: getCategoryIcon(name),
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

  if (!explanation && !hasAnyPreference) return null

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-xs p-4 sm:p-5 space-y-3.5">
      {/* AI Explanation Callout */}
      {explanation && (
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Why this recommendation?
            </p>
            <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>
      )}

      {/* Room Preferences Chips */}
      {hasAnyPreference && (
        <div className={explanation ? 'pt-3 border-t border-border/60 space-y-2' : 'space-y-2'}>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Based on room preferences</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Category Chips */}
            {categoryItems.map((cat) => {
              const IconComponent = cat.Icon
              return (
                <span
                  key={cat.name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs"
                >
                  <IconComponent className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{cat.label}</span>
                </span>
              )
            })}

            {/* Budget Chip */}
            {budgetLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs">
                <Wallet className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>{budgetLabel === 'Any' ? 'Any Budget' : budgetLabel}</span>
              </span>
            )}

            {/* Target Location / Area */}
            {shortAddress && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs max-w-full"
                title={address || ''}
              >
                <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                <span className="truncate max-w-44 sm:max-w-64">{shortAddress}</span>
              </span>
            )}

            {/* Search Radius */}
            {radiusLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/80 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
                <LocateFixed className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>Within {radiusLabel}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
