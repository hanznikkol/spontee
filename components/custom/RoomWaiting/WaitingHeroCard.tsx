import { CheckCircle2, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface WaitingHeroCardProps {
  isAllFinished?: boolean
}

export default function WaitingHeroCard({
  isAllFinished,
}: WaitingHeroCardProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative w-full max-w-sm">
        {/* Ambient aura glow */}
        <div className="absolute inset-0 bg-linear-to-br from-pink-400/25 via-fuchsia-400/15 to-blue-400/25 blur-3xl scale-105 rounded-[3rem]" />
        <div className="absolute -inset-px rounded-[2rem] bg-linear-to-br from-pink-400/30 via-transparent to-blue-400/30 opacity-70" />

        <Card className="relative rounded-[2rem] border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8 flex flex-col items-center text-center gap-6">

            {/* Status Icon */}
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            {/* Main status text */}
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight">
                {isAllFinished ? 'All Votes In!' : "You're All Set!"}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {isAllFinished
                  ? 'All participants have finished voting. Preparing the group match now.'
                  : 'Your choices have been submitted. Spontee is waiting for the rest of your group to finish swiping.'}
              </p>
            </div>

            {/* Live session reassuring state */}
            <div className="w-full rounded-2xl border bg-muted/40 p-4 space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Live Session
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>Automatic Sync</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAllFinished
                  ? 'Results are ready to be unveiled!'
                  : 'No need to refresh. Once everyone finishes, the top recommendation will automatically appear here.'}
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
