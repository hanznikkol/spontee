import { useState } from 'react'
import { Users, MapPin, Layers, Check, Copy } from 'lucide-react'
import { RoomOption } from '@/lib/room/create/types/option-types'
import { Card } from '@/components/ui/card'

interface ResultDetailsGridProps {
  option: RoomOption
  participantCount: number
  totalOptions: number
  roomCode: string
}

export default function ResultDetailsGrid({
  option,
  participantCount,
  totalOptions,
}: ResultDetailsGridProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    if (!option.address) return
    navigator.clipboard.writeText(option.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
      {/* Participants count */}
      <Card className="flex flex-col justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/80 shadow-2xs gap-0.5">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>Participants</span>
        </div>
        <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          {participantCount}
        </p>
      </Card>

      {/* Options evaluated */}
      <Card className="flex flex-col justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/80 shadow-2xs gap-0.5">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
          <Layers className="h-3.5 w-3.5 text-purple-500 shrink-0" />
          <span>Options</span>
        </div>
        <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          {totalOptions}
        </p>
      </Card>

      {/* Location & Address card (full-width on mobile, 3rd column on tablet/desktop) */}
      <Card className="col-span-2 sm:col-span-1 flex flex-col justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/80 shadow-2xs gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
            <span>Location</span>
          </div>
          {option.address && (
            <button
              type="button"
              onClick={handleCopyAddress}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 p-0.5 transition-colors cursor-pointer"
              title="Copy Address"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
        <p
          className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-snug break-words"
          title={option.address}
        >
          {option.address || 'Address available upon navigation'}
        </p>
      </Card>
    </div>
  )
}

