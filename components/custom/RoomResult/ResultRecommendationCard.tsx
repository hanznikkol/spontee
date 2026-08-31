import Image from 'next/image'
import { MapPin, Star, Trophy, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { RoomOption } from '@/lib/room/create/types/option-types'
import { ResultType } from '@/lib/room/result/result.types'

interface ResultRecommendationCardProps {
  option: RoomOption
  type: ResultType
}

function formatPriceLevel(level?: number) {
  if (!level) return ''
  return '₱'.repeat(level)
}

export default function ResultRecommendationCard({
  option,
  type,
}: ResultRecommendationCardProps) {
  return (
    <Card className="relative w-full aspect-[16/11] sm:aspect-[16/10] md:aspect-video min-h-[260px] max-h-[420px] rounded-2xl sm:rounded-3xl md:rounded-[32px] overflow-hidden border-border/80 shadow-xl sm:shadow-2xl bg-card">
      {/* Background Hero Image */}
      <Image
        src={
          option.imageUrls?.[0] ??
          '/images/placeholder.png'
        }
        alt={option.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
        priority
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-black/10 pointer-events-none" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 md:p-8 text-white flex flex-col justify-end pointer-events-none">
        
        {/* Top pill badge */}
        <div className="mb-2 sm:mb-3 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] sm:text-xs font-semibold backdrop-blur-md border border-white/20 text-white shadow-xs">
            {type === 'consensus' ? (
              <>
                <Trophy className="h-3 w-3 text-emerald-400" />
                <span>100% Group Match</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span>Top Pick</span>
              </>
            )}
          </div>
        </div>

        {/* Category, Rating, Price Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2.5 text-xs sm:text-sm">
          {option.category && (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 font-medium backdrop-blur-md border border-white/10 text-white capitalize text-[11px] sm:text-xs">
              {String(option.category).replace('_', ' ')}
            </span>
          )}
          {option.rating && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold backdrop-blur-md border border-amber-400/20 text-[11px] sm:text-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {option.rating}
              {option.totalReviews ? ` (${option.totalReviews})` : ''}
            </span>
          )}
          {option.priceLevel && (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 font-medium backdrop-blur-md border border-white/10 text-white tracking-widest text-[11px] sm:text-xs">
              {formatPriceLevel(option.priceLevel)}
            </span>
          )}
        </div>

        {/* Place Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white line-clamp-2 break-words">
          {option.title}
        </h2>

        {/* Place Address */}
        {option.address && (
          <p className="flex items-start gap-1.5 text-xs sm:text-sm text-white/85 max-w-2xl mt-1 line-clamp-1 sm:line-clamp-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-400 mt-0.5" />
            <span className="truncate sm:whitespace-normal">{option.address}</span>
          </p>
        )}
      </div>
    </Card>
  )
}
