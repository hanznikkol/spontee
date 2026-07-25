import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

function HeroSection() {
  return (
    <section className="relative z-10 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="text-center max-w-2xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            ⚡ Swipe. Vote. Decide.
            </div>

            <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            No more “where should we go?”
            <span className="bg-linear-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                {" "}Just Spontee it.
            </span>
            </h2>

            <p className="text-muted-foreground text-base md:text-lg">
            For couples, families, and friends who can’t decide where to go, what to eat, or what to do next.
            </p>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Button asChild size="lg" className="w-full rounded-2xl">
                <Link href="/create/host">🛠️ I’m the host</Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="w-full rounded-2xl">
                <Link href="/join">🔗 I’m a guest</Link>
            </Button>
            </div>
        </div>
    </section>
  )
}

export default HeroSection