import { MapPin, Navigation, Star } from 'lucide-react'
import { RoomOption } from '@/lib/room/create/types/option-types'
import { formatDistance } from '@/lib/room/create/utils/geo.utils'

type CardInfoProps = {
  option: RoomOption
}

export default function CardInfo({ option }: CardInfoProps) {
  const { title, rating, category, address, priceLevel, totalReviews, description, distanceMeters } = option

  function formatPriceLevel(level?: number) {
    if (!level) return ''
    return '₱'.repeat(level)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-5 sm:p-6 text-white">
      {/* Category, Rating, Price, Distance Badges */}
      <div className="mb-1.5 sm:mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
        {category && (
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium capitalize text-white backdrop-blur-md border border-white/10 text-[11px] sm:text-xs">
            {String(category).replace('_', ' ')}
          </span>
        )}

        {rating && (
          <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 font-semibold text-amber-300 backdrop-blur-md border border-amber-400/20 text-[11px] sm:text-xs">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {rating}
            {totalReviews ? ` (${totalReviews})` : ''}
          </span>
        )}

        {priceLevel && (
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium tracking-widest text-white backdrop-blur-md border border-white/10 text-[11px] sm:text-xs">
            {formatPriceLevel(priceLevel)}
          </span>
        )}

        {distanceMeters != null && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-medium text-white backdrop-blur-md border border-white/10 text-[11px] sm:text-xs">
            <Navigation className="h-3 w-3 text-cyan-300 fill-cyan-300/30" />
            {formatDistance(distanceMeters)}
          </span>
        )}
      </div>

      {/* Place Title */}
      <h3 className="line-clamp-2 wrap-break-word text-xl sm:text-2xl font-bold leading-tight tracking-tight text-white">
        {title}
      </h3>

      {/* Description / Highlight if available in real data */}
      {description && (
        <p className="mt-1 line-clamp-1 text-[11px] sm:text-xs text-white/85">
          {description}
        </p>
      )}

      {/* Place Address */}
      {address && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[11px] sm:text-xs text-white/85 line-clamp-1">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-400" />
          <span className="truncate">{address}</span>
        </p>
      )}
    </div>
  )
}