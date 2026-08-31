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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5 shadow-md shadow-pink-500/20 group-hover:shadow-pink-500/35 transition-all">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-background">
              <Sparkles className="h-4 w-4 text-pink-500 transition-transform group-hover:rotate-12" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Spont
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              ee
            </span>
          </span>
        </Link>
      </div>

      {/* Context Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 px-3.5 py-1 text-xs font-semibold text-pink-600 dark:text-pink-400 backdrop-blur-md shadow-xs">
          <Users className="h-3.5 w-3.5 text-pink-500" />
          <span>Guest join flow</span>
        </div>
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

