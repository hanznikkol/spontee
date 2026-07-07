"use client"

import { useState } from "react"
import { LocateFixed, MapPin, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface PreferenceLocationCardProps {
  enabled: boolean
  latitude?: number
  longitude?: number
  onEnable: () => void
}

type LocationStatus = "required" | "current" | "custom"

const radiusValues = [500, 1000, 3000, 5000, 10000]

function formatRadius(radius: number) {
  if (radius < 1000) return `${radius} m`
  return `${radius / 1000} km`
}

function MockMapPreview({ onUseCurrent }: { onUseCurrent: () => void }) {
  return (
    <div className="relative h-60 overflow-hidden rounded-2xl bg-muted shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.72),transparent_26%)]" />
      <div className="absolute left-8 right-10 top-16 h-3 -rotate-12 rounded-full bg-background/70" />
      <div className="absolute bottom-20 left-10 right-6 h-3 rotate-6 rounded-full bg-background/75" />
      <div className="absolute bottom-8 top-10 left-1/3 w-3 rotate-3 rounded-full bg-background/70" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/25">
          <MapPin className="h-6 w-6" aria-hidden="true" />
          <span className="absolute -bottom-2 h-3 w-3 rounded-full bg-red-500/30 blur-sm" />
        </div>
        <p className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          Map Preview
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        className="absolute bottom-3 right-3 rounded-xl shadow-md"
        onClick={onUseCurrent}
      >
        <LocateFixed className="h-4 w-4" aria-hidden="true" />
        Use Current Location
      </Button>
    </div>
  )
}

function LocationSearch({
  value,
  onChange,
  onClear,
}: {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search address or place..."
        className="h-11 rounded-2xl pl-9 pr-10"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
          aria-label="Clear search"
          onClick={onClear}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}

function SelectedAddress({
  status,
  address,
}: {
  status: LocationStatus
  address?: string
}) {
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

function RadiusSelector({
  radius,
  onChange,
}: {
  radius: number
  onChange: (radius: number) => void
}) {
  const selectedIndex = radiusValues.indexOf(radius)

  return (
    <div className="space-y-3 rounded-2xl border bg-background p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Search Radius</h3>
          <p className="text-xs text-muted-foreground">
            How far should we search?
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-primary">
          {formatRadius(radius)}
        </span>
      </div>

      <Slider
        value={[selectedIndex]}
        min={0}
        max={radiusValues.length - 1}
        step={1}
        onValueChange={([nextIndex]) =>
          onChange(radiusValues[nextIndex] ?? radius)
        }
        aria-label="Search radius"
      />

      <div className="flex justify-between text-[0.7rem] text-muted-foreground">
        {radiusValues.map((value) => (
          <span key={value}>{formatRadius(value)}</span>
        ))}
      </div>
    </div>
  )
}

export function PreferenceLocationCard({
  enabled: _enabled,
  latitude: _latitude,
  longitude: _longitude,
  onEnable,
}: PreferenceLocationCardProps) {
  const [searchValue, setSearchValue] = useState("")
  const [status, setStatus] = useState<LocationStatus>("required")
  const [selectedAddress, setSelectedAddress] = useState<string>()
  const [radius, setRadius] = useState(3000)

  const handleUseCurrentLocation = () => {
    setStatus("current")
    setSelectedAddress("123 Sample Street\nQuezon City")
    onEnable()
  }

  const handleConfirmLocation = () => {
    const cleanSearch = searchValue.trim()

    setStatus("custom")
    setSelectedAddress(
      cleanSearch ? `${cleanSearch}\nQuezon City` : "123 Sample Street\nQuezon City"
    )
  }

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

      <div className="space-y-4 rounded-2xl border bg-background/80 p-3">
        <LocationSearch
          value={searchValue}
          onChange={setSearchValue}
          onClear={() => setSearchValue("")}
        />
        <MockMapPreview onUseCurrent={handleUseCurrentLocation} />
        <SelectedAddress status={status} address={selectedAddress} />
        <RadiusSelector radius={radius} onChange={setRadius} />

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            className="rounded-xl"
            onClick={handleConfirmLocation}
          >
            Confirm Location
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={handleUseCurrentLocation}
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            Use Current Location
          </Button>
        </div>
      </div>
    </section>
  )
}
