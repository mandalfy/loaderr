"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { AlertTriangle, RouteIcon, Truck, Loader2, MapPin } from "lucide-react"
import { useAuth } from "./auth-provider"
import { RoleGuard } from "./role-guard"
import { config } from "@/lib/config"
import { useGoogleMaps } from "@/hooks/use-google-maps"

// City coordinates for simulation
const CITY_COORDINATES = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
}

// Simulated drivers for MVP
const DRIVERS = [
  { id: "D001", name: "Rajesh Kumar", vehicle: "TRK-001", status: "Available" },
  { id: "D002", name: "Amit Singh", vehicle: "TRK-002", status: "Available" },
  { id: "D003", name: "Priya Sharma", vehicle: "TRK-003", status: "Available" },
  { id: "D004", name: "Suresh Reddy", vehicle: "TRK-004", status: "Busy" },
  { id: "D005", name: "Ananya Das", vehicle: "TRK-005", status: "Available" },
]

// Route color mapping
const ROUTE_COLORS = {
  safest: "#00AA00",
  fastest: "#FF0000",
  economical: "#0000FF",
  balanced: "#AA00AA",
}

// Initial form state
const INITIAL_FORM_STATE = {
  startLocation: "",
  endLocation: "",
  cargoType: "",
  stops: ["", "", ""],
  vehicleId: "",
}

export function RouteOptimizer() {
  // Router and params
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")

  // Auth context
  const { userRole, isDemoMode } = useAuth()

  // Google Maps
  const { isLoaded, error } = useGoogleMaps()
  const [mapInitialized, setMapInitialized] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [orderAssigned, setOrderAssigned] = useState(false)

  // Data state
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [routeData, setRouteData] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState("")
  const [selectedDriver, setSelectedDriver] = useState("")
  const [selectedRouteDirections, setSelectedRouteDirections] = useState([])

  // Refs
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const directionsRendererRef = useRef([])

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInitialized) return

    try {
      console.log("Initializing GoMaps in route optimizer")
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: config.defaultMapCenter,
        zoom: 5,
      })

      mapInstanceRef.current = mapInstance
      setMapInitialized(true)
    } catch (err) {
      console.error("Error initializing GoMaps:", err)
    }
  }, [isLoaded, mapInitialized])

  // Load order details when order ID is present
  useEffect(() => {
    if (orderId && mapInitialized) {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]")
      const order = orders.find((o) => o.id === orderId)

      if (order) {
        setFormData({
          ...INITIAL_FORM_STATE,
          startLocation: order.pickupLocation || order.from || "",
          endLocation: order.deliveryLocation || order.to || "",
          cargoType: order.cargoType || "",
        })

        // Auto-generate routes if we have both start and end locations
        if (order.pickupLocation && order.deliveryLocation) {
          handleGenerateRoutes({
            preventDefault: () => {},
            stopPropagation: () => {},
          })
        }
      }
    }
  }, [orderId, mapInitialized])

  // Form handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleStopChange = (index, value) => {
    const newStops = [...formData.stops]
    newStops[index] = value
    setFormData((prev) => ({ ...prev, stops: newStops }))
  }

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Clear all routes from the map
  const clearMapRoutes = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.forEach((renderer) => {
        if (renderer && renderer.setMap) {
          renderer.setMap(null)
        }
      })
      directionsRendererRef.current = []
    }
  }

  // Generate routes
  const handleGenerateRoutes = async (e) => {
    if (e.preventDefault) e.preventDefault()
    if (e.stopPropagation) e.stopPropagation()

    if (!formData.startLocation || !formData.endLocation) {
      toast({
        title: "Missing information",
        description: "Please provide both start and end locations.",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    setLoading(true)

    try {
      clearMapRoutes()

      // Call the route optimizer API
      const response = await fetch(config.endpoints.routeOptimizer, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startLocation: formData.startLocation,
          endLocation: formData.endLocation,
          stops: formData.stops.filter((stop) => stop.trim() !== ""),
          cargoType: formData.cargoType,
          useGemini: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()
      setRouteData(data)

      const initialRouteKey = data.safest ? "safest" : Object.keys(data)[0]
      setSelectedRoute(initialRouteKey)
      displayRouteDirections(initialRouteKey, data)

      // Display routes on the map
      if (mapInstanceRef.current) {
        await displayRoutesOnMap(data, initialRouteKey)
      }
    } catch (err) {
      console.error("Error generating routes:", err)
      toast({
        title: "Error generating routes",
        description: "Failed to generate route options. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  // Display routes on the map
  const displayRoutesOnMap = async (data, selectedRouteKey) => {
    if (!window.google || !mapInstanceRef.current) {
      console.error("GoMaps or map instance not available")
      return
    }

    clearMapRoutes()

    // For each route, fetch directions and display on map
    for (const routeKey of Object.keys(data)) {
      const route = data[routeKey]
      const isSelected = routeKey === selectedRouteKey

      try {
        await fetchAndDisplayRoute(
          formData.startLocation,
          formData.endLocation,
          route.waypoints || [],
          routeKey,
          isSelected,
        )
      } catch (error) {
        console.error(`Error displaying route ${routeKey}:`, error)
        createFallbackRoute(routeKey, isSelected)
      }
    }
  }

  // Fetch and display a route on the map
  const fetchAndDisplayRoute = async (origin, destination, waypoints, routeKey, isSelected) => {
    if (!mapInstanceRef.current || !window.google) {
      console.error("Map instance or GoMaps not available")
      createFallbackRoute(routeKey, isSelected)
      return
    }

    try {
      // Call our directions API
      const response = await fetch("/api/maps/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          waypoints,
          travelMode: "driving",
        }),
      })

      if (!response.ok) {
        throw new Error(`Directions API returned status: ${response.status}`)
      }

      const data = await response.json()

      if (!data || !data.routes || data.routes.length === 0) {
        throw new Error("No routes returned from directions API")
      }

      // Create a directions renderer
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: ROUTE_COLORS[routeKey] || "#000000",
          strokeWeight: isSelected ? 5 : 3,
          strokeOpacity: isSelected ? 1.0 : 0.5,
        },
      })

      directionsRendererRef.current.push(directionsRenderer)
      directionsRenderer.setDirections(data)

      // If this is the selected route, fit bounds to show it
      if (isSelected && data.routes[0] && data.routes[0].bounds) {
        mapInstanceRef.current.fitBounds(data.routes[0].bounds)
      }
    } catch (error) {
      console.error(`Error in fetchAndDisplayRoute:`, error)
      createFallbackRoute(routeKey, isSelected)
    }
  }

  // Create a fallback route when directions service fails
  const createFallbackRoute = (routeKey, isSelected) => {
    if (!mapInstanceRef.current || !window.google) return

    try {
      // Get coordinates for start and end locations
      const startCoord = CITY_COORDINATES[formData.startLocation] || CITY_COORDINATES.Mumbai
      const endCoord = CITY_COORDINATES[formData.endLocation] || CITY_COORDINATES.Pune

      // Create path with intermediate points
      const path = []
      path.push(new window.google.maps.LatLng(startCoord.lat, startCoord.lng))

      // Add waypoint based on route type
      const midLat = (startCoord.lat + endCoord.lat) / 2
      const midLng = (startCoord.lng + endCoord.lng) / 2

      // Add variation based on route type
      const offset = {
        safest: { lat: 0.2, lng: 0.2 },
        fastest: { lat: 0, lng: 0 },
        economical: { lat: -0.1, lng: 0.1 },
        balanced: { lat: 0.1, lng: -0.1 },
      }[routeKey] || { lat: 0, lng: 0 }

      path.push(new window.google.maps.LatLng(midLat + offset.lat, midLng + offset.lng))
      path.push(new window.google.maps.LatLng(endCoord.lat, endCoord.lng))

      // Create polyline
      const polyline = new window.google.maps.Polyline({
        path,
        strokeColor: ROUTE_COLORS[routeKey] || "#000000",
        strokeWeight: isSelected ? 5 : 3,
        strokeOpacity: isSelected ? 1.0 : 0.5,
        map: mapInstanceRef.current,
      })

      // Store for cleanup
      directionsRendererRef.current.push({
        setMap: (map) => polyline.setMap(map),
      })

      // Fit bounds if selected
      if (isSelected) {
        const bounds = new window.google.maps.LatLngBounds()
        path.forEach((point) => bounds.extend(point))
        mapInstanceRef.current.fitBounds(bounds)
      }

      // Add markers for start and end
      new window.google.maps.Marker({
        position: new window.google.maps.LatLng(startCoord.lat, startCoord.lng),
        map: mapInstanceRef.current,
        title: formData.startLocation,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
      })

      new window.google.maps.Marker({
        position: new window.google.maps.LatLng(endCoord.lat, endCoord.lng),
        map: mapInstanceRef.current,
        title: formData.endLocation,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#F44336",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
      })
    } catch (error) {
      console.error("Error creating fallback route:", error)
    }
  }

  // Display route directions
  const displayRouteDirections = (routeKey, data = routeData) => {
    if (!data || !data[routeKey]) return

    const route = data[routeKey]

    if (route.directions && Array.isArray(route.directions)) {
      setSelectedRouteDirections(route.directions)
    } else if (route.path) {
      // Create simple directions from path
      const pathSegments = route.path.split("→").map((s) => s.trim())
      const directions = []

      for (let i = 0; i < pathSegments.length - 1; i++) {
        directions.push(`From ${pathSegments[i]} to ${pathSegments[i + 1]}`)
      }

      if (route.waypoints && route.waypoints.length > 0) {
        directions.push(`Pass through: ${route.waypoints.join(", ")}`)
      }

      setSelectedRouteDirections(directions)
    } else {
      setSelectedRouteDirections([`Travel from ${formData.startLocation} to ${formData.endLocation}`])
    }
  }

  // Handle route selection
  const handleRouteSelection = async (routeKey) => {
    setSelectedRoute(routeKey)
    displayRouteDirections(routeKey)

    if (mapInstanceRef.current && routeData) {
      await displayRoutesOnMap(routeData, routeKey)
    }
  }

  // Handle driver assignment
  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      toast({
        title: "No driver selected",
        description: "Please select a driver to assign this route.",
        variant: "destructive",
      })
      return
    }

    if (!selectedRoute) {
      toast({
        title: "No route selected",
        description: "Please select a route to assign.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Update order in localStorage
      if (orderId) {
        const orders = JSON.parse(localStorage.getItem("orders") || "[]")
        const updatedOrders = orders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              driver: selectedDriver,
              status: "In Transit",
              route: selectedRoute,
              assignedAt: new Date().toISOString(),
            }
          }
          return order
        })

        localStorage.setItem("orders", JSON.stringify(updatedOrders))
      }

      // Add to driver assignments
      const assignments = JSON.parse(localStorage.getItem("driverAssignments") || "[]")
      assignments.push({
        orderId,
        driverId: selectedDriver,
        route: selectedRoute,
        assignedAt: new Date().toISOString(),
      })
      localStorage.setItem("driverAssignments", JSON.stringify(assignments))

      setOrderAssigned(true)
      toast({
        title: "Route assigned successfully",
        description: `Order has been assigned to ${selectedDriver} using the ${selectedRoute} route.`,
      })

      // Update risk zones
      updateRiskZones()
    } catch (error) {
      console.error("Error assigning driver:", error)
      toast({
        title: "Error assigning driver",
        description: "An error occurred while assigning the driver.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update risk zones
  const updateRiskZones = async () => {
    try {
      const response = await fetch(config.endpoints.riskZones, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: routeData[selectedRoute].path,
        }),
      })

      const data = await response.json()
      const existingZones = JSON.parse(localStorage.getItem("riskZones") || "[]")
      localStorage.setItem("riskZones", JSON.stringify([...existingZones, ...data.riskZones]))
    } catch (error) {
      console.error("Error updating risk zones:", error)
    }
  }

  // Reset route
  const resetRoute = () => {
    setRouteData(null)
    setSelectedRoute("")
    setOrderAssigned(false)
    setSelectedRouteDirections([])
    clearMapRoutes()
  }

  // Render map initialization retry button
  const renderMapRetryButton = () => (
    <Button
      variant="outline"
      size="sm"
      className="ml-2"
      onClick={() => {
        if (mapRef.current && isLoaded) {
          try {
            const mapInstance = new window.google.maps.Map(mapRef.current, {
              center: config.defaultMapCenter,
              zoom: 5,
            })
            mapInstanceRef.current = mapInstance
            setMapInitialized(true)

            // Display routes after initialization
            if (routeData) {
              setTimeout(() => displayRoutesOnMap(routeData, selectedRoute), 500)
            }
          } catch (err) {
            console.error("Error initializing map on retry:", err)
          }
        }
      }}
    >
      Retry
    </Button>
  )

  // Render map
  const renderMap = () => (
    <div className="h-[350px] rounded-md relative">
      <div ref={mapRef} className="w-full h-full" />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <p>Loading Maps...</p>
        </div>
      )}

      {isLoaded && !mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <p>Initializing map...</p>
          {renderMapRetryButton()}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Processing routes...</p>
        </div>
      )}
    </div>
  )

  // Render route form
  const renderRouteForm = () => (
    <form onSubmit={handleGenerateRoutes} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startLocation">Start Location</Label>
          <Input
            id="startLocation"
            placeholder="e.g., Mumbai"
            value={formData.startLocation}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endLocation">End Location</Label>
          <Input
            id="endLocation"
            placeholder="e.g., Pune"
            value={formData.endLocation}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cargoType">Cargo Type</Label>
          <Select value={formData.cargoType} onValueChange={(value) => handleSelectChange("cargoType", value)}>
            <SelectTrigger id="cargoType">
              <SelectValue placeholder="Select cargo type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="perishable">Perishable Goods</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="machinery">Machinery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicle">Assign Vehicle (Optional)</Label>
          <Select value={formData.vehicleId} onValueChange={(value) => handleSelectChange("vehicleId", value)}>
            <SelectTrigger id="vehicle">
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRK-001">TRK-001 (Rajesh Kumar)</SelectItem>
              <SelectItem value="TRK-002">TRK-002 (Amit Singh)</SelectItem>
              <SelectItem value="TRK-003">TRK-003 (Priya Sharma)</SelectItem>
              <SelectItem value="TRK-004">TRK-004 (Suresh Reddy)</SelectItem>
              <SelectItem value="TRK-005">TRK-005 (Ananya Das)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Delivery Stops (Optional)</Label>
        <div className="space-y-2">
          {formData.stops.map((stop, index) => (
            <Input
              key={index}
              placeholder={`Stop ${index + 1} (e.g., Lonavala)`}
              value={stop}
              onChange={(e) => handleStopChange(index, e.target.value)}
            />
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={generating || !formData.startLocation || !formData.endLocation}
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Routes...
          </>
        ) : (
          <>
            <RouteIcon className="mr-2 h-4 w-4" />
            Generate Routes with AI
          </>
        )}
      </Button>
    </form>
  )

  // Render route cards
  const renderRouteCards = () => (
    <div className="pt-4">
      <h3 className="text-lg font-semibold mb-3">Available Routes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(routeData).map((routeKey) => {
          const route = routeData[routeKey]
          const RouteIcon = route.icon || MapPin

          return (
            <Card
              key={routeKey}
              className={`cursor-pointer transition-all ${selectedRoute === routeKey ? "ring-2 ring-primary" : ""}`}
              onClick={() => handleRouteSelection(routeKey)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{route.name}</CardTitle>
                  <Badge
                    variant={routeKey === "safest" ? "outline" : "secondary"}
                    className={
                      routeKey === "safest" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : ""
                    }
                  >
                    <RouteIcon className="h-3 w-3 mr-1" />
                    {route.badgeText}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{route.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Distance</p>
                    <p className="font-medium">{route.distance}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Duration</p>
                    <p className="font-medium">{route.duration}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Risk Score</p>
                    <p
                      className={`font-medium ${
                        route.riskScore < 0.4
                          ? "text-green-500"
                          : route.riskScore < 0.7
                            ? "text-amber-500"
                            : "text-red-500"
                      }`}
                    >
                      {route.riskScore.toFixed(1)}(
                      {route.riskScore < 0.4 ? "Low" : route.riskScore < 0.7 ? "Medium" : "High"})
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Fuel</p>
                    <p className="font-medium">{route.fuelConsumption}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs">Route</p>
                  <p className="text-xs">{route.path}</p>
                </div>

                {route.riskAreas && route.riskAreas.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Risk Areas:
                    </p>
                    <ul className="text-xs text-red-500 pl-5 list-disc">
                      {route.riskAreas.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  // Render driver instructions
  const renderDriverInstructions = () => (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Driver Instructions</h3>
      <div className="bg-muted p-4 rounded-md text-sm">
        <p className="font-medium">
          Route: {orderId ? `Order #${orderId}` : "New Route"} ({routeData[selectedRoute].name})
        </p>
        <p className="mt-2">1. Start from {formData.startLocation} at scheduled time</p>

        {routeData[selectedRoute].waypoints && routeData[selectedRoute].waypoints.length > 0 && (
          <p className="mt-1">2. Pass through: {routeData[selectedRoute].waypoints.join(", ")}</p>
        )}

        <p className="mt-1">
          {routeData[selectedRoute].riskAreas && routeData[selectedRoute].riskAreas.length > 0 ? (
            <>3. Exercise caution in high-risk areas</>
          ) : (
            <>3. Follow the recommended route for optimal safety</>
          )}
        </p>

        {routeData[selectedRoute].riskAreas && routeData[selectedRoute].riskAreas.length > 0 && (
          <p className="text-red-500 flex items-center mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning: Route includes risk areas. Maintain vigilance.
          </p>
        )}

        <p className="mt-2">4. Estimated arrival: {routeData[selectedRoute].duration} from departure</p>
        <p className="mt-2">Contact dispatch if you encounter any issues: +91 98765 43210</p>
      </div>
    </div>
  )

  // Render route directions
  const renderRouteDirections = () => (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Route Directions</h3>
      <div className="bg-muted p-4 rounded-md text-sm">
        <ol className="list-decimal pl-5 space-y-2">
          {selectedRouteDirections.map((direction, index) => (
            <li key={index}>{direction}</li>
          ))}
        </ol>
      </div>
    </div>
  )

  // Render driver assignment
  const renderDriverAssignment = () => (
    <RoleGuard allowedRoles={["admin"]}>
      {!orderAssigned ? (
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3">Assign Driver</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select onValueChange={setSelectedDriver} value={selectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {DRIVERS.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id} disabled={driver.status !== "Available"}>
                      {driver.name} ({driver.vehicle}) - {driver.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssignDriver}
              disabled={loading || !selectedDriver || !selectedRoute}
              className="whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Assign Driver
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t pt-4 mt-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            <h3 className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Driver Assigned Successfully
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              This order has been assigned to {DRIVERS.find((d) => d.id === selectedDriver)?.name} using the{" "}
              {routeData[selectedRoute]?.name || selectedRoute} route.
            </p>
          </div>
        </div>
      )}
    </RoleGuard>
  )

  // Render empty driver view
  const renderEmptyDriverView = () => (
    <div className="py-8 text-center">
      <div className="mb-4 flex justify-center">
        <RouteIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium">No Route Assigned</h3>
      <p className="text-sm text-muted-foreground mb-4">You don't have any active routes assigned to you yet.</p>
      <p className="text-xs text-muted-foreground">Please contact your dispatcher if you believe this is an error.</p>
    </div>
  )

  // Render driver navigation button
  const renderDriverNavigationButton = () => (
    <div className="border-t pt-4 mt-4">
      <Button className="w-full" variant="default">
        <Truck className="h-4 w-4 mr-2" />
        Start Navigation
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Route Optimizer</CardTitle>
        <CardDescription>
          {userRole === "admin"
            ? "Generate theft-aware, efficient routes powered by AI"
            : "View your assigned route details and directions"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Admin View */}
        {userRole === "admin" && (
          <>
            {!routeData ? (
              renderRouteForm()
            ) : (
              <>
                {renderMap()}
                {renderRouteCards()}
                {selectedRoute && renderDriverInstructions()}
                {selectedRoute && renderRouteDirections()}
                {renderDriverAssignment()}
              </>
            )}
          </>
        )}

        {/* Driver View */}
        {userRole === "driver" && (
          <>
            {!routeData ? (
              renderEmptyDriverView()
            ) : (
              <>
                {renderMap()}
                {selectedRoute && renderDriverInstructions()}
                {selectedRoute && renderRouteDirections()}
                {renderDriverNavigationButton()}
              </>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {userRole === "admin" ? (
          routeData ? (
            <>
              <Button variant="outline" onClick={resetRoute}>
                Create New Route
              </Button>
              <Button onClick={() => router.push("/orders")}>View All Orders</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => router.push("/orders")} className="ml-auto">
              Cancel
            </Button>
          )
        ) : (
          <Button variant="outline" onClick={() => router.push("/orders")} className="w-full">
            Back to My Deliveries
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

