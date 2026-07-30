import { RoomOption } from '@/lib/room/create/types/option-types'

type CardInfoProps = {
  option: RoomOption
}

function CardInfo({ option }: CardInfoProps) {
  const { title, rating, address, priceLevel} = option

  function formatPriceLevel(level?: number) {
    if (!level) return "";

    return "₱".repeat(level);
  }
  
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">

      <h2 className="text-2xl font-bold leading-tight">
        {title}
      </h2>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">

        {rating && (
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            ⭐ {rating}
          </span>
        )}

        {/* {category && (
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            {category}
          </span>
        )} */}

        {priceLevel && (
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            {formatPriceLevel(priceLevel)}
          </span>
        )}

      </div>

      {address && (
        <p className="mt-3 text-sm text-white/75">
          📍 {address}
        </p>
      )}

    </div>
  )
}

export default CardInfo