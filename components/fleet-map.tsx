"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, AlertTriangle } from "lucide-react"

/** 
 * The "real" map placeholder. 
 * Later, you'll replace the center portion with actual Google Maps integration.
 */
export function FleetMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  // Simulated vehicle data for the "real" map MVP
  const vehicles = [
    { id: "V001", name: "Truck 1", location: "Mumbai", status: "Moving", riskLevel: "Low" },
    { id: "V002", name: "Truck 2", location: "Delhi", status: "Idle", riskLevel: "Low" },
    { id: "V003", name: "Truck 3", location: "Bangalore", status: "Moving", riskLevel: "Medium" },
    { id: "V004", name: "Truck 4", location: "Hyderabad", status: "Moving", riskLevel: "High" },
    { id: "V005", name: "Truck 5", location: "Chennai", status: "Moving", riskLevel: "Low" },
  ]

  useEffect(() => {
    // This would be replaced with actual Google Maps integration
    // For the MVP, we're simulating a map load.
    if (mapRef.current) {
      setMapLoaded(true)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full bg-gray-100">
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p>Loading map...</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center p-4 max-w-md">
              <p className="text-sm text-muted-foreground mb-2">
                Google Maps integration will be implemented here, showing:
              </p>
              <ul className="text-xs text-left list-disc pl-5 space-y-1">
                <li>Real-time vehicle locations with status indicators</li>
                <li>Risk zones highlighted in red</li>
                <li>Delivery routes with progress indicators</li>
              </ul>
              <div className="mt-4 text-xs text-muted-foreground">
                For the MVP, this will use the Google Maps JavaScript API
              </div>
            </div>
          </div>
        )}
      </div>

      {/* The floating list of vehicles on the right side */}
      <div className="absolute top-4 right-4 w-64 space-y-2">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle.id}
            className={`cursor-pointer transition-all ${
              selectedVehicle === vehicle.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedVehicle(vehicle.id)}
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
              <div className="text-xs text-muted-foreground mt-1">
                Location: {vehicle.location}
              </div>
              <div className="text-xs mt-1">
                Status:{" "}
                <span
                  className={
                    vehicle.status === "Moving" ? "text-green-500" : "text-amber-500"
                  }
                >
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
        ))}
      </div>
    </div>
  )
}

/**
 * A separate "DemoMap" component that uses a static image 
 * and absolute-positioned markers for drivers. 
 * Shows similar functionality (click to select).
 */
export function DemoMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)

  // Mock drivers for the demo, with X/Y as percentages for the image
  const drivers = [
    {
      id: "D001",
      name: "Demo Truck 1",
      location: "Point A",
      status: "Moving",
      riskLevel: "Low",
      x: 25,
      y: 30,
    },
    {
      id: "D002",
      name: "Demo Truck 2",
      location: "Point B",
      status: "Idle",
      riskLevel: "Medium",
      x: 55,
      y: 50,
    },
    {
      id: "D003",
      name: "Demo Truck 3",
      location: "Point C",
      status: "Moving",
      riskLevel: "High",
      x: 40,
      y: 70,
    },
  ]

  useEffect(() => {
    if (mapRef.current) {
      setMapLoaded(true)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full bg-gray-100 relative">
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p>Loading demo map...</p>
          </div>
        ) : (
          <>
            {/* 1) Show a static map image (put your image in /public) */}
            <Image
              src="/demo-map-placeholder.png"
              alt="Demo Map"
              fill
              style={{ objectFit: "cover" }}
              priority
            />

            {/* 2) Position clickable markers absolutely */}
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className={`absolute flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 cursor-pointer transition-all ${
                  selectedDriver === driver.id ? "ring-2 ring-primary scale-110" : ""
                }`}
                style={{
                  left: `${driver.x}%`,
                  top: `${driver.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => setSelectedDriver(driver.id)}
              />
            ))}
          </>
        )}
      </div>

      {/* The same "driver list" approach on the right side */}
      <div className="absolute top-4 right-4 w-64 space-y-2">
        {drivers.map((driver) => (
          <Card
            key={driver.id}
            className={`cursor-pointer transition-all ${
              selectedDriver === driver.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedDriver(driver.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm font-medium">{driver.name}</span>
                </div>
                <Badge
                  variant={
                    driver.riskLevel === "Low"
                      ? "outline"
                      : driver.riskLevel === "Medium"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {driver.riskLevel}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Location: {driver.location}
              </div>
              <div className="text-xs mt-1">
                Status:{" "}
                <span
                  className={
                    driver.status === "Moving" ? "text-green-500" : "text-amber-500"
                  }
                >
                  {driver.status}
                </span>
              </div>
              {driver.riskLevel === "High" && (
                <div className="text-xs text-red-500 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  High-risk area detected
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
