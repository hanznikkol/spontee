import { Trophy, Sparkles } from 'lucide-react'
import { ResultType } from '@/lib/room/result/result.types'

interface ResultHeaderProps {
  type: ResultType
  participantCount: number
}

export default function ResultHeader({ type, participantCount }: ResultHeaderProps) {
  if (type === 'no_match') return null

  return (
    <div className="text-center space-y-2 sm:space-y-3">
      {/* Match Type Badge */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-xs ${
          type === 'consensus'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
        }`}
      >
        {type === 'consensus' ? (
          <>
            <Trophy className="h-3.5 w-3.5" />
            <span>Unanimous Consensus</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            <span>Top Group Compromise</span>
          </>
        )}
      </div>

      {/* Main Punchy Editorial Headline */}
      <div className="space-y-0.5 sm:space-y-1 max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
          Everyone decided.
          <span className="block bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent pb-0.5">
            Here's where you're going.
          </span>
        </h1>
      </div>

      {/* Reassuring Subtitle */}
      <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
        {type === 'consensus'
          ? `All ${participantCount} participants agreed on this pick!`
          : `Selected as the best match satisfying your group of ${participantCount}.`}
      </p>
    </div>
  )
}
