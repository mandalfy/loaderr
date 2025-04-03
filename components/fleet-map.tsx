"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, AlertTriangle, ShieldAlert } from "lucide-react"
import { config } from "@/lib/config"
import { collection, onSnapshot, query } from "firebase/firestore"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { useAuth } from "./auth-provider"
import { FallbackMap } from "./fallback-map"

declare global {
  interface Window {
    google: any
    googleMapsError?: boolean
    highlightMarker?: any // For tracking the highlighted marker
  }
}

export function FleetMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const { isLoaded, error: mapsError, maps } = useGoogleMaps()
  const [mapInitialized, setMapInitialized] = useState(false)
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [firestoreError, setFirestoreError] = useState<Error | null>(null)
  const { user, loading: authLoading, isDemoMode } = useAuth()
  const [useFallback, setUseFallback] = useState(false)

  // Use refs to store Google Maps objects
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const circlesRef = useRef<google.maps.Circle[]>([])
  const unsubscribeRef = useRef<() => void>(() => {})

  // Simulated data for fallback
  const simulatedLocations = [
    { lat: 19.076, lng: 72.8777, title: "Mumbai" }, // Mumbai
    { lat: 28.6139, lng: 77.209, title: "Delhi" }, // Delhi
    { lat: 12.9716, lng: 77.5946, title: "Bangalore" }, // Bangalore
    { lat: 17.385, lng: 78.4867, title: "Hyderabad" }, // Hyderabad
    { lat: 13.0827, lng: 80.2707, title: "Chennai" }, // Chennai
  ]

  const simulatedRiskZones = [
    { lat: 19.033, lng: 73.0297, radius: 5000, color: "#FF0000" }, // Mumbai-Pune highway
  ]

  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    Mumbai: { lat: 19.076, lng: 72.8777 },
    Delhi: { lat: 28.6139, lng: 77.209 },
    Bangalore: { lat: 12.9716, lng: 77.5946 },
    Hyderabad: { lat: 17.385, lng: 78.4867 },
    Chennai: { lat: 13.0827, lng: 80.2707 },
  }

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    // If there's an error or it's taking too long to load, use fallback
    if (mapsError || (isLoaded && !window.google?.maps)) {
      console.warn("Using fallback map due to error or missing Google Maps")
      setUseFallback(true)
      return
    }

    if (!isLoaded || !mapRef.current || mapInitialized) return

    try {
      // Create map instance
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: config.defaultMapCenter,
        zoom: 5,
      })

      mapInstanceRef.current = mapInstance
      setMapInitialized(true)
    } catch (err) {
      console.error("Error initializing map:", err)
      setUseFallback(true)
    }
  }, [isLoaded, mapInitialized, mapsError])

  // Set up Firestore subscription when user is authenticated and map is initialized
  useEffect(() => {
    // If in demo mode, use simulated data
    if (isDemoMode) {
      setDrivers(simulatedDrivers)

      // If map is initialized, add simulated markers
      if (mapInitialized && mapInstanceRef.current) {
        addSimulatedMarkersToMap()
      }
      return
    }

    // Only proceed if authenticated and map is initialized
    if (authLoading || !user || !mapInitialized || !mapInstanceRef.current) return

    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      setFirestoreError(new Error("Firebase is not properly configured"))
      setDrivers(simulatedDrivers)
      return
    }

    try {
      // Create a query against the drivers collection
      const driversQuery = query(collection(db, "drivers"))

      // Set up the snapshot listener
      unsubscribeRef.current = onSnapshot(
        driversQuery,
        (snapshot) => {
          const driversData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          setDrivers(driversData)
          setFirestoreError(null)

          // Clear existing markers
          markersRef.current.forEach((marker) => {
            marker.setMap(null)
          })
          markersRef.current = []

          // Update markers on the map
          if (mapInstanceRef.current) {
            const newMarkers: google.maps.Marker[] = []
            driversData.forEach((driver) => {
              if (driver.location) {
                // Create or update marker
                const position = { lat: driver.location.lat, lng: driver.location.lng }

                const marker = new window.google.maps.Marker({
                  position,
                  map: mapInstanceRef.current,
                  title: driver.name,
                  icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/truck.png",
                    scaledSize: new window.google.maps.Size(32, 32),
                  },
                })

                newMarkers.push(marker)
              }
            })
            markersRef.current = newMarkers
          }
        },
        (error) => {
          console.error("Error fetching drivers:", error)
          setFirestoreError(error as Error)
          // Use simulated data if Firestore fails
          setDrivers(simulatedDrivers)
        },
      )

      // Fetch risk zones
      fetchRiskZones()
    } catch (err) {
      console.error("Error setting up Firestore listener:", err)
      setFirestoreError(err as Error)
      // Use simulated data if setup fails
      setDrivers(simulatedDrivers)
    }

    // Clean up function
    return () => {
      // Unsubscribe from Firestore
      unsubscribeRef.current()

      // Clean up markers and circles
      markersRef.current.forEach((marker) => {
        marker.setMap(null)
      })
      circlesRef.current.forEach((circle) => {
        circle.setMap(null)
      })
      markersRef.current = []
      circlesRef.current = []
    }
  }, [user, authLoading, mapInitialized, isDemoMode])

  // Add simulated markers to the map for demo mode
  const addSimulatedMarkersToMap = () => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null)
    })
    markersRef.current = []

    // Add simulated markers
    const newMarkers: google.maps.Marker[] = []

    simulatedLocations.forEach((location, index) => {
      const marker = new window.google.maps.Marker({
        position: location,
        map: mapInstanceRef.current,
        title: simulatedDrivers[index]?.name || location.title,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/truck.png",
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })

      newMarkers.push(marker)
    })

    markersRef.current = newMarkers

    // Add a simulated risk zone
    const riskZone = new window.google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: mapInstanceRef.current,
      center: { lat: 19.033, lng: 73.0297 }, // Mumbai-Pune highway
      radius: 5000, // 5km radius
    })

    circlesRef.current = [riskZone]

    // Fit map to show all markers
    const bounds = new window.google.maps.LatLngBounds()
    simulatedLocations.forEach((location) => {
      bounds.extend(location)
    })
    mapInstanceRef.current.fitBounds(bounds)
  }

  // Fetch risk zones from Firestore or API
  const fetchRiskZones = async () => {
    if (!mapInstanceRef.current) return

    try {
      // Try to fetch from API first
      const response = await fetch(config.endpoints.riskZones)
      const data = await response.json()

      // Add risk zones to the map
      addRiskZonesToMap(data.riskZones)
    } catch (apiError) {
      console.error("Error fetching risk zones from API:", apiError)

      try {
        // Fallback to Firestore
        const riskZonesQuery = query(collection(db, "riskZones"))

        const unsubscribe = onSnapshot(
          riskZonesQuery,
          (snapshot) => {
            const riskZones = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))

            addRiskZonesToMap(riskZones)
          },
          (error) => {
            console.error("Error fetching risk zones from Firestore:", error)
          },
        )

        // Store the unsubscribe function
        const originalUnsubscribe = unsubscribeRef.current
        unsubscribeRef.current = () => {
          originalUnsubscribe()
          unsubscribe()
        }
      } catch (firestoreError) {
        console.error("Error setting up risk zones listener:", firestoreError)
      }
    }
  }

  // Add risk zones to the map
  const addRiskZonesToMap = (riskZones: any[]) => {
    if (!mapInstanceRef.current) return

    // Clear existing circles
    circlesRef.current.forEach((circle) => {
      circle.setMap(null)
    })

    const newCircles: google.maps.Circle[] = []
    riskZones.forEach((zone) => {
      if (zone.coordinates) {
        // Create a circle for each risk zone
        const circle = new window.google.maps.Circle({
          strokeColor: zone.riskLevel === "High" ? "#FF0000" : zone.riskLevel === "Medium" ? "#FFA500" : "#FFFF00",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: zone.riskLevel === "High" ? "#FF0000" : zone.riskLevel === "Medium" ? "#FFA500" : "#FFFF00",
          fillOpacity: 0.35,
          map: mapInstanceRef.current,
          center: zone.coordinates,
          radius: 5000, // 5km radius
        })

        newCircles.push(circle)
      }
    })
    circlesRef.current = newCircles
  }

  // For the MVP, we'll use simulated data if Firestore isn't set up yet
  const simulatedDrivers = [
    { id: "V001", name: "Truck 1", location: "Mumbai", status: "Moving", riskLevel: "Low" },
    { id: "V002", name: "Truck 2", location: "Delhi", status: "Idle", riskLevel: "Low" },
    { id: "V003", name: "Truck 3", location: "Bangalore", status: "Moving", riskLevel: "Medium" },
    { id: "V004", name: "Truck 4", location: "Hyderabad", status: "Moving", riskLevel: "High" },
    { id: "V005", name: "Truck 5", location: "Chennai", status: "Moving", riskLevel: "Low" },
  ]

  // Handle authentication loading state
  if (authLoading && !isDemoMode) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p>Authenticating...</p>
      </div>
    )
  }

  // Handle not authenticated state
  if (!user && !isDemoMode) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-2" />
          <p>You need to be signed in to view the fleet map.</p>
        </div>
      </div>
    )
  }

  // Use fallback map if needed
  if (useFallback) {
    return (
      <div className="relative w-full h-full">
        <FallbackMap markers={simulatedLocations} circles={simulatedRiskZones} />
        {firestoreError && (
          <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
            <p className="text-sm">Error loading fleet data: {firestoreError.message}</p>
            <p className="text-xs mt-1">Using simulated data instead.</p>
          </div>
        )}

        {isDemoMode && (
          <div className="absolute top-4 left-4 bg-amber-100 border border-amber-400 text-amber-700 px-4 py-2 rounded-md">
            <p className="text-sm">Demo Mode: Using simulated data</p>
          </div>
        )}

        <div className="absolute top-4 right-4 w-64 space-y-2">
          {(drivers.length > 0 ? drivers : simulatedDrivers).map((vehicle) => {
            const vehicleLocation = vehicle.location
            return (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-all ${selectedVehicle === vehicle.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => {
                  setSelectedVehicle(vehicle.id)
                  // Center map on selected vehicle
                  if (mapInstanceRef.current && window.google?.maps) {
                    // Get vehicle coordinates - either from actual location or simulated location
                    let vehiclePosition

                    if (vehicle.location && typeof vehicle.location === "object" && "latitude" in vehicle.location) {
                      // Real data format
                      vehiclePosition = {
                        lat: vehicle.location.latitude,
                        lng: vehicle.location.longitude,
                      }
                    } else if (vehicle.location && typeof vehicle.location === "string") {
                      // If location is a string (city name), use simulated coordinates
                      const cityName = vehicle.location
                      const cityCoord =
                        simulatedLocations.find((loc) => loc.title === cityName) ||
                        cityCoordinates[cityName] ||
                        simulatedLocations[0] // Fallback to first location
                      vehiclePosition = { lat: cityCoord.lat, lng: cityCoord.lng }
                    } else {
                      // Fallback to a default location based on vehicle index
                      const index = Number.parseInt(vehicle.id.replace(/\D/g, "")) % simulatedLocations.length
                      vehiclePosition = simulatedLocations[index] || simulatedLocations[0]
                    }

                    // Animate smooth pan to the location
                    mapInstanceRef.current.panTo(vehiclePosition)
                    mapInstanceRef.current.setZoom(15) // Zoom in for better visibility

                    // Add or update a highlight marker
                    if (window.google?.maps) {
                      // Remove previous highlight marker if exists
                      if (window.highlightMarker) {
                        window.highlightMarker.setMap(null)
                      }

                      // Create a new highlight marker
                      window.highlightMarker = new window.google.maps.Marker({
                        position: vehiclePosition,
                        map: mapInstanceRef.current,
                        title: vehicle.name,
                        animation: window.google.maps.Animation.BOUNCE,
                        icon: {
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: "#4285F4",
                          fillOpacity: 0.8,
                          strokeWeight: 2,
                          strokeColor: "#FFFFFF",
                        },
                      })

                      // Stop animation after 3 seconds
                      setTimeout(() => {
                        if (window.highlightMarker) {
                          window.highlightMarker.setAnimation(null)
                        }
                      }, 3000)
                    }
                  }
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">{vehicle.name}</span>
                    </div>
                    <Badge
                      variant={
                        vehicle.riskLevel === "Low"
                          ? "outline"
                          : vehicle.riskLevel === "Medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {vehicle.riskLevel}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Location: {vehicleLocation}</div>
                  <div className="text-xs mt-1">
                    Status:{" "}
                    <span className={vehicle.status === "Moving" ? "text-green-500" : "text-amber-500"}>
                      {vehicle.status}
                    </span>
                  </div>
                  {vehicle.riskLevel === "High" && (
                    <div className="text-xs text-red-500 flex items-center mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      High-risk area detected
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
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

      {firestoreError && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
          <p className="text-sm">Error loading fleet data: {firestoreError.message}</p>
          <p className="text-xs mt-1">Using simulated data instead.</p>
        </div>
      )}

      {isDemoMode && (
        <div className="absolute top-4 left-4 bg-amber-100 border border-amber-400 text-amber-700 px-4 py-2 rounded-md">
          <p className="text-sm">Demo Mode: Using simulated data</p>
        </div>
      )}

      <div className="absolute top-4 right-4 w-64 space-y-2">
        {(drivers.length > 0 ? drivers : simulatedDrivers).map((vehicle) => {
          const vehicleLocation = vehicle.location
          return (
            <Card
              key={vehicle.id}
              className={`cursor-pointer transition-all ${selectedVehicle === vehicle.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => {
                setSelectedVehicle(vehicle.id)
                // Center map on selected vehicle
                if (mapInstanceRef.current && window.google?.maps) {
                  // Get vehicle coordinates - either from actual location or simulated location
                  let vehiclePosition

                  if (vehicle.location && typeof vehicle.location === "object" && "latitude" in vehicle.location) {
                    // Real data format
                    vehiclePosition = {
                      lat: vehicle.location.latitude,
                      lng: vehicle.location.longitude,
                    }
                  } else if (vehicle.location && typeof vehicle.location === "string") {
                    // If location is a string (city name), use simulated coordinates
                    const cityName = vehicle.location
                    const cityCoord =
                      simulatedLocations.find((loc) => loc.title === cityName) ||
                      cityCoordinates[cityName] ||
                      simulatedLocations[0] // Fallback to first location
                    vehiclePosition = { lat: cityCoord.lat, lng: cityCoord.lng }
                  } else {
                    // Fallback to a default location based on vehicle index
                    const index = Number.parseInt(vehicle.id.replace(/\D/g, "")) % simulatedLocations.length
                    vehiclePosition = simulatedLocations[index] || simulatedLocations[0]
                  }

                  // Animate smooth pan to the location
                  mapInstanceRef.current.panTo(vehiclePosition)
                  mapInstanceRef.current.setZoom(15) // Zoom in for better visibility

                  // Add or update a highlight marker
                  if (window.google?.maps) {
                    // Remove previous highlight marker if exists
                    if (window.highlightMarker) {
                      window.highlightMarker.setMap(null)
                    }

                    // Create a new highlight marker
                    window.highlightMarker = new window.google.maps.Marker({
                      position: vehiclePosition,
                      map: mapInstanceRef.current,
                      title: vehicle.name,
                      animation: window.google.maps.Animation.BOUNCE,
                      icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 0.8,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF",
                      },
                    })

                    // Stop animation after 3 seconds
                    setTimeout(() => {
                      if (window.highlightMarker) {
                        window.highlightMarker.setAnimation(null)
                      }
                    }, 3000)
                  }
                }
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="text-sm font-medium">{vehicle.name}</span>
                  </div>
                  <Badge
                    variant={
                      vehicle.riskLevel === "Low"
                        ? "outline"
                        : vehicle.riskLevel === "Medium"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {vehicle.riskLevel}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Location: {vehicleLocation}</div>
                <div className="text-xs mt-1">
                  Status:{" "}
                  <span className={vehicle.status === "Moving" ? "text-green-500" : "text-amber-500"}>
                    {vehicle.status}
                  </span>
                </div>
                {vehicle.riskLevel === "High" && (
                  <div className="text-xs text-red-500 flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    High-risk area detected
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

