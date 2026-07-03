import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function HomeNavigation() {
  return (
    <header className="relative z-10 border-b bg-background/40 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* BRAND */}
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <span>
            Spont<span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 via-purple-500 to-blue-500">ee
            </span>
          </span>
        </h1>
        {/* ACTIONS */}
        <div className="flex items-center gap-2">

          <Button 
            variant="ghost" 
            asChild 
            className="rounded-xl hover:bg-muted/60 transition"
          >
            <Link href="/feedback">Feedback</Link>
          </Button>

          <Button 
            variant="ghost" 
            asChild 
            className="rounded-xl hover:bg-muted/60 transition"
          >
            <Link href="/join">Join Room</Link>
          </Button>

          <Button 
            asChild 
            className="rounded-xl bg-linear-to-r from-pink-500 to-blue-500 text-white shadow-md shadow-pink-500/20 hover:scale-[1.03] transition"
          >
            <Link href="/create/host">Create Room</Link>
          </Button>

        </div>
      </div>
    </header>
  )
}