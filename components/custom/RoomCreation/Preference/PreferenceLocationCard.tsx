"use client"

import { CheckCircle2, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PreferenceLocationCardProps {
  enabled: boolean
  latitude?: number
  longitude?: number
  onEnable: () => void
}

export function PreferenceLocationCard({
  enabled,
  latitude,
  longitude,
  onEnable,
}: PreferenceLocationCardProps) {
  return (
    <section className="space-y-3" aria-labelledby="preference-location-title">
      <div className="space-y-1">
        <h2 id="preference-location-title" className="text-base font-semibold">
          Location
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use your current location to find nearby places.
        </p>
      </div>

      <div className="rounded-2xl border bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {enabled ? (
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <MapPin className="h-5 w-5" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <Badge variant={enabled ? "default" : "outline"}>
                {enabled ? "Current location ready" : "Location not selected"}
              </Badge>
              {enabled && latitude && longitude && (
                <p className="text-xs text-muted-foreground">
                  Mock coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant={enabled ? "secondary" : "outline"}
              size="sm"
              className="w-full rounded-xl"
              onClick={onEnable}
            >
              {enabled ? "Location ready" : "Enable location"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
