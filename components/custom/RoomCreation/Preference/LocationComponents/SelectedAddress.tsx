import { MapPin, CheckCircle2, AlertCircle } from "lucide-react"
import { LocationStatus } from "@/lib/room/create/types/location"
import { cn } from "@/lib/utils"

export function SelectedAddress({
  status,
  address,
}: {
  status: LocationStatus
  address?: string
}) {
  const isSelected = status === "current" || status === "custom"

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/50 p-3.5 transition-all">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500/15 to-purple-500/15 text-pink-500 ring-1 ring-pink-500/20">
        <MapPin className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              status === "current" &&
                "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              status === "custom" &&
                "bg-purple-500/15 text-purple-600 dark:text-purple-400",
              status === "required" &&
                "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            )}
          >
            {isSelected ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {status === "current"
              ? "Current Geolocation"
              : status === "custom"
                ? "Selected Search Location"
                : "Location Required"}
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-foreground leading-snug line-clamp-2">
          {address && address.trim().length > 0
            ? address
            : "No location chosen yet. Tap the map or search above."}
        </p>
      </div>
    </div>
  )
}
