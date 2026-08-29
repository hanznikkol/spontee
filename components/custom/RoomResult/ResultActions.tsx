import { Navigation, Share2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { RoomOption } from '@/lib/room/create/types/option-types'
import { useState } from 'react'

interface ResultActionsProps {
  option: RoomOption
}

export default function ResultActions({ option }: ResultActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `We're going to ${option.title}!`,
          text: `We decided on ${option.title} on Spontee.`,
          url: window.location.href,
        })
        .catch(() => {
          // Fallback to clipboard if share was cancelled or failed
          navigator.clipboard.writeText(window.location.href)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getDirectionsUrl = () => {
    if (!option.address && !option.title) return 'https://maps.google.com'
    const query = encodeURIComponent(`${option.title} ${option.address || ''}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full">
      {/* Primary Action: Get Directions */}
      <Button
        className="w-full sm:w-auto sm:flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        asChild
      >
        <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
          <Navigation className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span>Get Directions</span>
        </a>
      </Button>

      {/* Secondary Actions Row */}
      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
        <Button
          variant="outline"
          className="flex-1 sm:flex-none h-11 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border-border hover:bg-muted transition-all active:scale-[0.98]"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-4 w-4" />
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </Button>

        <Button
          variant="outline"
          className="h-11 sm:h-14 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-[0.98]"
          asChild
          title="Return to Home"
        >
          <Link href="/">
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Home</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
