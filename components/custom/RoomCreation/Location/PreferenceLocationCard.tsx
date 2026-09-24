"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { MapPin, Clock } from "lucide-react"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import { SelectedAddress } from "./LocationComponents/SelectedAddress"
import { LocationRadius } from "./LocationComponents/LocationRadius"
import { LocationSearch, SelectedPlace } from "./LocationComponents/LocationSearch"
import { MapSelector } from "./LocationComponents/MapContainer"
import { cn } from "@/lib/utils"

import { LocationStatus } from "@/lib/room/create/types/location"

function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

export interface PreferenceLocationCardProps {
  latitude?: number
  longitude?: number
  address?: string
  radius?: number
  locationStatus?: LocationStatus
  openNowOnly?: boolean
  onOpenNowOnlyChange?: (openNowOnly: boolean) => void
  onChange?: (data: {
    latitude: number
    longitude: number
    address: string
    radius: number
    locationStatus?: LocationStatus
  }) => void
}

export function PreferenceLocationCard({
  latitude: propLatitude,
  longitude: propLongitude,
  address: propAddress,
  radius: propRadius,
  locationStatus: propLocationStatus,
  openNowOnly: propOpenNowOnly,
  onOpenNowOnlyChange: propOnOpenNowOnlyChange,
  onChange: propOnChange,
}: PreferenceLocationCardProps = {}) {
  // Store fallback when not in controlled mode
  const storeLatitude = useCreateRoomStore((s) => s.latitude)
  const storeLongitude = useCreateRoomStore((s) => s.longitude)
  const setLocation = useCreateRoomStore((s) => s.setLocation)
  const setCoordinates = useCreateRoomStore((s) => s.setCoordinates)
  const storeLocationStatus = useCreateRoomStore((state) => state.locationStatus)
  const storeAddress = useCreateRoomStore((state) => state.address)
  const storeRadius = useCreateRoomStore((state) => state.radius)
  const setRadius = useCreateRoomStore((state) => state.setRadius)
  const storeOpenNowOnly = useCreateRoomStore((state) => state.openNowOnly)
  const setOpenNowOnly = useCreateRoomStore((state) => state.setOpenNowOnly)

  const isControlled = Boolean(propOnChange)

  const latitude = isControlled ? propLatitude : storeLatitude
  const longitude = isControlled ? propLongitude : storeLongitude
  const address = isControlled ? (propAddress ?? "") : storeAddress
  const radius = isControlled ? (propRadius ?? 3000) : storeRadius
  const locationStatus = isControlled
    ? (propLocationStatus ?? (latitude != null && longitude != null ? "custom" : "required"))
    : storeLocationStatus

  const openNowOnly = propOpenNowOnly !== undefined ? propOpenNowOnly : storeOpenNowOnly

  const handleToggleOpenNowOnly = useCallback(() => {
    const next = !openNowOnly
    if (propOnOpenNowOnlyChange) {
      propOnOpenNowOnlyChange(next)
    } else {
      setOpenNowOnly(next)
    }
  }, [openNowOnly, propOnOpenNowOnlyChange, setOpenNowOnly])

  const geocoding = useMapsLibrary("geocoding")
  const [isLocating, setIsLocating] = useState(false)

  // Get Address from Coordinates
  const getAddressFromCoordinates = useCallback(
    async (lat: number, lng: number) => {
      if (!geocoding) return formatCoordinates(lat, lng)

      try {
        const geocoder = new geocoding.Geocoder()
        const response = await geocoder.geocode({
          location: { lat, lng },
        })

        return (
          response.results[0]?.formatted_address ?? formatCoordinates(lat, lng)
        )
      } catch {
        return formatCoordinates(lat, lng)
      }
    },
    [geocoding]
  )

  // Fetch Selected Place from Search
  const handlePlaceSelect = useCallback(
    (place: SelectedPlace) => {
      if (isControlled && propOnChange) {
        propOnChange({
          latitude: place.latitude,
          longitude: place.longitude,
          address: place.address,
          radius,
          locationStatus: "custom",
        })
      } else {
        setLocation("custom", {
          placeId: place.placeId,
          placeName: place.placeName,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
        })
      }
    },
    [isControlled, propOnChange, radius, setLocation]
  )

  // Map Selection on Click
  const handleMapSelect = useCallback(
    async (lat: number, lng: number) => {
      const selectedAddress = await getAddressFromCoordinates(lat, lng)

      if (isControlled && propOnChange) {
        propOnChange({
          latitude: lat,
          longitude: lng,
          address: selectedAddress,
          radius,
          locationStatus: "custom",
        })
      } else {
        setCoordinates(lat, lng, {
          status: "custom",
          placeId: undefined,
          placeName: undefined,
          address: selectedAddress,
        })
      }
    },
    [getAddressFromCoordinates, isControlled, propOnChange, radius, setCoordinates]
  )

  // Current Location Button
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords
          const selectedAddress = await getAddressFromCoordinates(lat, lng)

          if (isControlled && propOnChange) {
            propOnChange({
              latitude: lat,
              longitude: lng,
              address: selectedAddress,
              radius,
              locationStatus: "current",
            })
          } else {
            setCoordinates(lat, lng, {
              status: "current",
              placeId: undefined,
              placeName: undefined,
              address: selectedAddress,
            })
          }
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
      }
    )
  }, [getAddressFromCoordinates, isControlled, propOnChange, radius, setCoordinates])

  // Radius Change Handler
  const handleRadiusChange = useCallback(
    (newRadius: number) => {
      if (isControlled && propOnChange && latitude != null && longitude != null) {
        propOnChange({
          latitude,
          longitude,
          address,
          radius: newRadius,
          locationStatus,
        })
      } else {
        setRadius(newRadius)
      }
    },
    [address, isControlled, latitude, locationStatus, longitude, propOnChange, setRadius]
  )

  // Automatic Current Location initialization
  useEffect(() => {
    if (!geocoding) return
    if (latitude != null && longitude != null) return

    const currentLocationTimeout = setTimeout(() => {
      handleUseCurrentLocation()
    }, 0)

    return () => clearTimeout(currentLocationTimeout)
  }, [geocoding, latitude, longitude, handleUseCurrentLocation])

  return (
    <section className="space-y-3" aria-labelledby="preference-location-title">
      <div className="space-y-0.5">
        <h2
          id="preference-location-title"
          className="text-sm font-semibold flex items-center gap-1.5"
        >
          <MapPin className="h-4 w-4 text-blue-500" />
          Location & Radius
        </h2>
        <p className="text-xs text-muted-foreground">
          Choose where to search for places nearby.
        </p>
      </div>

      <div className="space-y-3.5 rounded-3xl border border-border/70 bg-card/60 p-3.5 sm:p-5 transition-all">
        {/* Search Component */}
        <LocationSearch onSelect={handlePlaceSelect} />

        {/* Map Component */}
        <MapSelector
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          onSelectLocation={handleMapSelect}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLocating={isLocating}
        />

        {/* Selected Address Display */}
        <SelectedAddress status={locationStatus} address={address} />

        {/* Radius Chips */}
        <LocationRadius radius={radius} onChange={handleRadiusChange} />

        {/* Open Now Only Toggle */}
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-3.5 sm:p-4 transition-all gap-3">
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-pink-500 shrink-0" />
              <span className="text-sm font-semibold text-foreground">Open Now Only</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {openNowOnly
                ? "Only discover places currently open for business."
                : "Include places that may be closed right now (great for planning ahead)."}
            </p>
            <p className="text-[11px] text-muted-foreground/75 pt-0.5">
              Permanently or temporarily closed places are always excluded.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={openNowOnly}
            aria-label="Open now only"
            onClick={handleToggleOpenNowOnly}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2",
              openNowOnly ? "bg-gradient-to-r from-pink-500 to-purple-500" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                openNowOnly ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </section>
  )
}

export default PreferenceLocationCard
