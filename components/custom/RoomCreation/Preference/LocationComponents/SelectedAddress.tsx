import { Badge } from "@/components/ui/badge"
import { LocationStatus } from "@/lib/room/create/types/location"
import { MapPin } from "lucide-react"

export function SelectedAddress({ status, address, }: { status: LocationStatus, address?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-background p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <MapPin className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Badge variant={status === "required" ? "outline" : "default"}>
          {status === "current"
            ? "Current Location"
            : status === "custom"
              ? "Custom Location"
              : "Location Required"}
        </Badge>
        <p className="whitespace-pre-line text-sm leading-relaxed">
          {address ?? "Location not selected"}
        </p>
      </div>
    </div>
  )
}
