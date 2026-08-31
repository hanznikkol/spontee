import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface JoinFooterProps {
  onGoToCreate: () => void
}

export function JoinFooter({ onGoToCreate }: JoinFooterProps) {
  return (
    <div className="text-center space-y-3 text-xs text-muted-foreground">
      <p>
        Need to host instead?{" "}
        <button
          type="button"
          onClick={onGoToCreate}
          className="font-semibold text-foreground underline underline-offset-4 hover:text-pink-500 hover:cursor-pointer transition-colors duration-150"
        >
          Go to create
        </button>
      </p>

      <div className="pt-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to home</span>
        </Link>
      </div>
    </div>
  )
}

