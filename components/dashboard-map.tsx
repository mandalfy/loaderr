"use client"

import { useEffect, useRef, useState } from "react"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { config } from "@/lib/config"
import { FallbackMap } from "./fallback-map"

// Declare google variable
declare global {
  interface Window {
    google?: typeof google.maps
  }
}

export function DashboardMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const { isLoaded, error } = useGoogleMaps()
  const [mapInitialized, setMapInitialized] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  // Use refs to store Google Maps objects to avoid state updates
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const circlesRef = useRef<google.maps.Circle[]>([])

  // Sample locations for the MVP
  const locations = [
    { lat: 19.076, lng: 72.8777, title: "Truck 1" }, // Mumbai
    { lat: 28.6139, lng: 77.209, title: "Truck 2" }, // Delhi
    { lat: 12.9716, lng: 77.5946, title: "Truck 3" }, // Bangalore
    { lat: 17.385, lng: 78.4867, title: "Truck 4" }, // Hyderabad
    { lat: 13.0827, lng: 80.2707, title: "Truck 5" }, // Chennai
  ]

  // Risk zones for the MVP
  const riskZones = [
    { lat: 19.033, lng: 73.0297, radius: 5000, color: "#FF0000" }, // Mumbai-Pune highway
  ]

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    // If there's an error or it's taking too long to load, use fallback
    if (error || (isLoaded && !window.google?.maps)) {
      console.warn("Using fallback map due to error or missing Google Maps")
      setUseFallback(true)
      return
    }

    // Only proceed if Google Maps is loaded, the map container exists, and we haven't initialized yet
    if (!isLoaded || !mapRef.current || mapInitialized) return

    try {
      // Create map instance
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: config.defaultMapCenter,
        zoom: 5,
      })

      mapInstanceRef.current = mapInstance

      // Add some sample markers for the MVP
      // Add new markers
      const markers: google.maps.Marker[] = []
      locations.forEach((location) => {
        const marker = new window.google.maps.Marker({
          position: location,
          map: mapInstance,
          title: location.title,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/truck.png",
            scaledSize: new window.google.maps.Size(32, 32),
          },
        })

        markers.push(marker)
      })
      markersRef.current = markers

      // Add a risk zone for demonstration
      const riskZone = new window.google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map: mapInstance,
        center: { lat: 19.033, lng: 73.0297 }, // Mumbai-Pune highway
        radius: 5000, // 5km radius
      })

      circlesRef.current = [riskZone]

      // Mark initialization as complete
      setMapInitialized(true)
    } catch (err) {
      console.error("Error initializing map:", err)
      setUseFallback(true)
    }

    // Clean up function
    return () => {
      if (!mapInitialized) return

      // Clean up markers
      markersRef.current.forEach((marker) => {
        marker.setMap(null)
      })
      markersRef.current = []

      // Clean up circles
      circlesRef.current.forEach((circle) => {
        circle.setMap(null)
      })
      circlesRef.current = []

      mapInstanceRef.current = null
      setMapInitialized(false)
    }
  }, [isLoaded, mapInitialized, error]) // Only depend on isLoaded, mapInitialized, and error

  if (useFallback) {
    return <FallbackMap markers={locations} circles={riskZones} />
  }

  return (
    <div className="w-full h-full relative bg-gray-100">
      <div ref={mapRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <p>Loading Google Maps...</p>
        </div>
      )}
      {isLoaded && !mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <p>Initializing map...</p>
        </div>
      )}
    </div>
  )
}

