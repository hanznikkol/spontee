import Link from "next/link"
import { Users, Sparkles } from "lucide-react"

export function JoinHeader() {
  return (
    <div className="text-center space-y-4">
      {/* Brand Icon / Link */}
      <div className="flex justify-center">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 transition-transform active:scale-95"
        >
          <span className="text-xl font-bold tracking-tight">
            Spont
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              ee
            </span>
          </span>
        </Link>
      </div>
      
      {/* Title & Description */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Join a host’s{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            room
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Enter your name and join the room through the host&apos;s invite.
        </p>
      </div>
    </div>
  )
}

