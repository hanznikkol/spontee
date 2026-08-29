import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ResultNoMatchCard() {
  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-8 w-full">
      <Card className="w-full max-w-lg mx-auto rounded-2xl sm:rounded-3xl md:rounded-[32px] border-border/80 bg-linear-to-b from-card/90 to-card/50 backdrop-blur-2xl shadow-xl sm:shadow-2xl p-5 sm:p-8 md:p-10 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-red-500/10 blur-[50px] sm:blur-[64px] rounded-full pointer-events-none" />

        <div className="relative flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 sm:mb-6 text-red-500 shadow-inner">
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 sm:mb-3 text-foreground">
            No Match Found
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-sm mx-auto mb-6 sm:mb-8 leading-relaxed">
            We couldn&apos;t find an option that works for everyone. Don&apos;t worry, start fresh with new picks!
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full">
            <Button
              className="w-full sm:w-auto h-12 sm:h-13 px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold shadow-md active:scale-[0.98] transition-all"
              asChild
            >
              <Link href="/">
                <RotateCcw className="mr-2 h-4 w-4" />
                Start New Session
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 sm:h-13 px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold active:scale-[0.98] transition-all"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
