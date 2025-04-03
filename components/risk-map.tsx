"use client"

import { useEffect, useRef, useState } from "react"
import { config } from "@/lib/config"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { ShieldAlert, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "./auth-provider"
import { FallbackMap } from "./fallback-map"

declare global {
  interface Window {
    google: any
  }
}

export function RiskMap() {
  // Rest of the component remains the same, but add fallback support
  const [useFallback, setUseFallback] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const { isLoaded, error: mapsError } = useGoogleMaps()
  const [mapInitialized, setMapInitialized] = useState(false)
  const [riskZones, setRiskZones] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [liveFeed, setLiveFeed] = useState<any[]>([])
  const [firestoreError, setFirestoreError] = useState<Error | null>(null)
  const { user, loading: authLoading, isDemoMode } = useAuth()

  // Use refs to store GoMaps objects
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const circlesRef = useRef<google.maps.Circle[]>([])
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([])
  const unsubscribeRef = useRef<() => void>(() => {})

  // Initialize map when GoMaps is loaded
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
    }
  }, [isLoaded, mapInitialized, mapsError])

  // Load risk zones when map is initialized
  useEffect(() => {
    if (mapInitialized) {
      fetchRiskZones()

      // Set up live feed simulation
      const interval = setInterval(() => {
        simulateLiveFeedUpdate()
      }, 10000) // Update every 10 seconds

      return () => clearInterval(interval)
    }
  }, [mapInitialized])

  // Fetch risk zones from API or localStorage
  const fetchRiskZones = async () => {
    setLoading(true)

    try {
      // Try to get from localStorage first (for MVP)
      const storedZones = JSON.parse(localStorage.getItem("riskZones") || "[]")

      // If no stored zones, fetch from API
      if (storedZones.length === 0) {
        const response = await fetch(config.endpoints.riskZones)
        const data = await response.json()
        setRiskZones(data.riskZones)

        // Store in localStorage
        localStorage.setItem("riskZones", JSON.stringify(data.riskZones))
      } else {
        setRiskZones(storedZones)
      }

      // Add to live feed
      if (storedZones.length > 0) {
        addToLiveFeed({
          type: "info",
          message: `Loaded ${storedZones.length} risk zones from database`,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error fetching risk zones:", error)

      // Use simulated data for MVP
      const simulatedZones = simulateRiskZones()
      setRiskZones(simulatedZones)

      // Store in localStorage
      localStorage.setItem("riskZones", JSON.stringify(simulatedZones))

      addToLiveFeed({
        type: "error",
        message: "Error fetching risk zones, using cached data",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  // Add risk zones to the map
  useEffect(() => {
    if (!mapInstanceRef.current || riskZones.length === 0) return

    // Clear existing circles and info windows
    circlesRef.current.forEach((circle) => {
      circle.setMap(null)
    })
    infoWindowsRef.current.forEach((infoWindow) => {
      infoWindow.close()
    })
    circlesRef.current = []
    infoWindowsRef.current = []

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

        // Add click listener to show info
        circle.addListener("click", () => {
          // Close any open info windows
          infoWindowsRef.current.forEach((infoWindow) => {
            infoWindow.close()
          })
          infoWindowsRef.current = []

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div>
                <h3>${zone.area || "Risk Zone"}</h3>
                <p>Risk Level: ${zone.riskLevel || "Unknown"}</p>
                <p>${zone.description || ""}</p>
                <p>Last Updated: ${new Date(zone.lastUpdated).toLocaleString()}</p>
              </div>
            `,
          })

          infoWindow.setPosition(zone.coordinates)
          infoWindow.open(mapInstanceRef.current)
          infoWindowsRef.current.push(infoWindow)
        })
      }
    })
    circlesRef.current = newCircles

    // Fit map to show all risk zones
    if (riskZones.length > 0 && riskZones.some((zone) => zone.coordinates)) {
      const bounds = new window.google.maps.LatLngBounds()
      riskZones.forEach((zone) => {
        if (zone.coordinates) {
          bounds.extend(zone.coordinates)
        }
      })
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [riskZones])

  // Function to simulate risk zones for MVP
  function simulateRiskZones() {
    return [
      {
        id: "1",
        area: "NH48 Highway",
        location: "Mumbai-Pune Expressway",
        riskLevel: "High",
        coordinates: { lat: 19.033, lng: 73.0297 },
        description: "Multiple theft incidents reported between 2-5 PM. Cargo types: electronics, machinery.",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "2",
        area: "Outer Ring Road",
        location: "Bangalore",
        riskLevel: "Medium",
        coordinates: { lat: 13.0827, lng: 77.5877 },
        description: "Incidents reported during night hours. Recommend avoiding after 10 PM.",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "3",
        area: "NH44 Junction",
        location: "Hyderabad-Vijayawada",
        riskLevel: "High",
        coordinates: { lat: 17.385, lng: 78.4867 },
        description: "High-value cargo thefts reported. Police checkpoints recommended.",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "4",
        area: "Industrial Zone",
        location: "Delhi-NCR",
        riskLevel: "Medium",
        coordinates: { lat: 28.6139, lng: 77.209 },
        description: "Incidents during early morning hours. Increased security recommended.",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "5",
        area: "Eastern Bypass",
        location: "Kolkata",
        riskLevel: "Low",
        coordinates: { lat: 22.5726, lng: 88.3639 },
        description: "Minor incidents reported. General caution advised.",
        lastUpdated: new Date().toISOString(),
      },
    ]
  }

  // Function to simulate live feed updates
  const simulateLiveFeedUpdate = async () => {
    // Randomly decide if we should add a new risk zone
    if (Math.random() > 0.7) {
      try {
        // Simulate Gemini API call
        const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune"]
        const randomLocation = locations[Math.floor(Math.random() * locations.length)]

        const response = await fetch(config.endpoints.riskZones, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: randomLocation,
          }),
        })

        const data = await response.json()

        if (data.riskZones && data.riskZones.length > 0) {
          // Add to existing risk zones
          const newZones = [...riskZones, ...data.riskZones]
          setRiskZones(newZones)

          // Update localStorage
          localStorage.setItem("riskZones", JSON.stringify(newZones))

          // Add to live feed
          data.riskZones.forEach((zone) => {
            addToLiveFeed({
              type: "warning",
              message: `New ${zone.riskLevel} risk zone detected in ${zone.location}`,
              details: zone.description,
              timestamp: new Date().toISOString(),
            })
          })
        }
      } catch (error) {
        console.error("Error in live feed update:", error)
      }
    } else {
      // Add a simulated driver report to the feed
      const driverReports = [
        "Driver reported suspicious activity near Mumbai bypass",
        "Driver confirmed safe passage through previously marked risk zone",
        "Local police notified of increased security in Delhi industrial area",
        "Weather alert: Heavy rain affecting visibility on NH48",
        "Traffic congestion reported on Bangalore outer ring road",
      ]

      const randomReport = driverReports[Math.floor(Math.random() * driverReports.length)]

      addToLiveFeed({
        type: "info",
        message: randomReport,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Function to add item to live feed
  const addToLiveFeed = (item) => {
    setLiveFeed((prev) => {
      const newFeed = [item, ...prev]
      // Keep only the last 10 items
      return newFeed.slice(0, 10)
    })
  }

  // Function to refresh risk zones
  const handleRefresh = () => {
    fetchRiskZones()

    addToLiveFeed({
      type: "info",
      message: "Manually refreshed risk zone data",
      timestamp: new Date().toISOString(),
    })
  }

  // Handle GoMaps error
  if (mapsError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-red-500">Error loading map: {mapsError.message}</p>
      </div>
    )
  }

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
          <p>You need to be signed in to view the risk map.</p>
        </div>
      </div>
    )
  }

  if (useFallback) {
    // Convert risk zones to the format expected by FallbackMap
    const fallbackCircles = riskZones.map((zone) => ({
      lat: zone.coordinates?.lat || 0,
      lng: zone.coordinates?.lng || 0,
      radius: 5000,
      color: zone.riskLevel === "High" ? "#FF0000" : zone.riskLevel === "Medium" ? "#FFA500" : "#FFFF00",
    }))

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 w-full h-[400px] relative bg-gray-100 rounded-md overflow-hidden">
          <FallbackMap circles={fallbackCircles} />

          <div className="absolute top-2 right-2">
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex gap-2">
            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
              High Risk
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
              Medium Risk
            </Badge>
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
              Low Risk
            </Badge>
          </div>
        </div>

        {/* Live feed section remains the same */}
        <div className="h-[400px] overflow-hidden flex flex-col">
          <div className="font-medium p-2 border-b flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            Live Risk Feed
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {liveFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No recent updates. Risk feed will update automatically.
              </p>
            ) : (
              liveFeed.map((item, index) => (
                <Card key={index} className="p-2 text-sm">
                  <CardContent className="p-2">
                    <div className="flex items-start gap-2">
                      {item.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />}
                      {item.type === "error" && <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                      {item.type === "info" && <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />}
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            item.type === "warning"
                              ? "text-amber-700"
                              : item.type === "error"
                                ? "text-red-700"
                                : "text-blue-700"
                          }`}
                        >
                          {item.message}
                        </p>
                        {item.details && <p className="text-muted-foreground text-xs mt-1">{item.details}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 w-full h-[400px] relative bg-gray-100 rounded-md overflow-hidden">
        <div ref={mapRef} className="w-full h-full" />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
            <p>Loading GoMaps...</p>
          </div>
        )}
        {isLoaded && !mapInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
            <p>Initializing map...</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading risk zones...</p>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex gap-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
            High Risk
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
            Medium Risk
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
            Low Risk
          </Badge>
        </div>
      </div>

      <div className="h-[400px] overflow-hidden flex flex-col">
        <div className="font-medium p-2 border-b flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
          Live Risk Feed
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-2">
          {liveFeed.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No recent updates. Risk feed will update automatically.
            </p>
          ) : (
            liveFeed.map((item, index) => (
              <Card key={index} className="p-2 text-sm">
                <CardContent className="p-2">
                  <div className="flex items-start gap-2">
                    {item.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />}
                    {item.type === "error" && <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                    {item.type === "info" && <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          item.type === "warning"
                            ? "text-amber-700"
                            : item.type === "error"
                              ? "text-red-700"
                              : "text-blue-700"
                        }`}
                      >
                        {item.message}
                      </p>
                      {item.details && <p className="text-muted-foreground text-xs mt-1">{item.details}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

