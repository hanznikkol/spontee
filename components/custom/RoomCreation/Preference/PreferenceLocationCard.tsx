"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { MapPin } from "lucide-react"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import { SelectedAddress } from "./LocationComponents/SelectedAddress"
import { LocationRadius } from "./LocationComponents/LocationRadius"
import { LocationSearch, SelectedPlace } from "./LocationComponents/LocationSearch"
import { MapSelector } from "./LocationComponents/MapContainer"

function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

function PreferenceLocationCard() {
  const latitude = useCreateRoomStore((s) => s.latitude)
  const longitude = useCreateRoomStore((s) => s.longitude)

  const setLocation = useCreateRoomStore((s) => s.setLocation)
  const setCoordinates = useCreateRoomStore((s) => s.setCoordinates)

  const locationStatus = useCreateRoomStore((state) => state.locationStatus)
  const address = useCreateRoomStore((state) => state.address)
  const radius = useCreateRoomStore((state) => state.radius)
  const setRadius = useCreateRoomStore((state) => state.setRadius)
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
      setLocation("custom", {
        placeId: place.placeId,
        placeName: place.placeName,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
      })
    },
    [setLocation]
  )

  // Map Selection on Click
  const handleMapSelect = useCallback(
    async (lat: number, lng: number) => {
      const selectedAddress = await getAddressFromCoordinates(lat, lng)

      setCoordinates(lat, lng, {
        status: "custom",
        placeId: undefined,
        placeName: undefined,
        address: selectedAddress,
      })
    },
    [getAddressFromCoordinates, setCoordinates]
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

          setCoordinates(lat, lng, {
            status: "current",
            placeId: undefined,
            placeName: undefined,
            address: selectedAddress,
          })
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
      }
    )
  }, [getAddressFromCoordinates, setCoordinates])

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

        {/* Radius Slider */}
        <LocationRadius radius={radius} onChange={setRadius} />
      </div>
    </section>
  )
}

export default PreferenceLocationCard
