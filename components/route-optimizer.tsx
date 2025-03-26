"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, RouteIcon, Truck } from "lucide-react"

// Helper to get a random integer offset in the range [-max, +max]
function getRandomOffset(max: number) {
  return Math.floor(Math.random() * (max * 2 + 1)) - max
}

// Calculate Euclidean distance between two points
function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

export function RouteOptimizer() {
  const [selectedRoute, setSelectedRoute] = useState<"fastest" | "safest">("safest")

  // Simulated route data for the MVP
  const routes = {
    fastest: {
      distance: "150 km",
      time: "3 hours",
      risk: 0.7,
      path: "Mumbai → NH48 → Pune",
      riskAreas: ["NH48 (High theft risk)"],
      fuelConsumption: "18 liters",
    },
    safest: {
      distance: "180 km",
      time: "4 hours",
      risk: 0.3,
      path: "Mumbai → Lonavala → Pune",
      riskAreas: [],
      fuelConsumption: "22 liters",
    },
  }

  // For the DEMO tab: randomize the end coordinates of each route line,
  // ensuring the green route is at least as long as the red route.
  const [demoCoords, setDemoCoords] = useState<{
    redX2: number
    redY2: number
    greenX2: number
    greenY2: number
  }>({ redX2: 70, redY2: 20, greenX2: 70, greenY2: 70 })

  useEffect(() => {
    // Start point (A): (20, 70) in % coords
    // We'll randomize the end points for red & green lines:
    // red route ~ (70 ± 5, 20 ± 5)
    // green route ~ (70 ± 5, 70 ± 5)
    // Then ensure green route is not shorter than red route.

    function randomizeLines() {
      let rX2 = 70 + getRandomOffset(5)
      let rY2 = 20 + getRandomOffset(5)
      let gX2 = 70 + getRandomOffset(5)
      let gY2 = 70 + getRandomOffset(5)

      // Measure distances from A(20,70) to each route end
      const distRed = distance(20, 70, rX2, rY2)
      const distGreen = distance(20, 70, gX2, gY2)

      // If green route is shorter, push it further away
      if (distGreen < distRed) {
        const extra = distRed - distGreen + 1 // 1 to ensure it's bigger
        gX2 += extra
      }

      setDemoCoords({
        redX2: rX2,
        redY2: rY2,
        greenX2: gX2,
        greenY2: gY2,
      })
    }

    randomizeLines()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Options</CardTitle>
        <CardDescription>AI-generated routes based on safety and efficiency</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="demo">Demo</TabsTrigger>
          </TabsList>

          {/* 1) Existing Map View */}
          <TabsContent value="map">
            <div className="bg-gray-100 h-[350px] rounded-md flex items-center justify-center">
              <div className="text-center p-4 max-w-md">
                <p className="text-sm text-muted-foreground mb-2">
                  Google Maps integration will be implemented here, showing:
                </p>
                <ul className="text-xs text-left list-disc pl-5 space-y-1">
                  <li>Two route options: Fastest (red) and Safest (green)</li>
                  <li>Risk zones highlighted in red</li>
                  <li>Delivery stops marked with pins</li>
                </ul>
                <div className="mt-4 text-xs text-muted-foreground">
                  For the MVP, this will use the Google Maps Directions API
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 2) Existing Comparison View */}
          <TabsContent value="comparison">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fastest Route Card */}
              <Card
                className={`cursor-pointer transition-all ${
                  selectedRoute === "fastest" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedRoute("fastest")}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Fastest Route</CardTitle>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Optimized for Time
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">{routes.fastest.distance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <span className="font-medium">{routes.fastest.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <span className="font-medium text-red-500">
                      {routes.fastest.risk} (High)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fuel Consumption:</span>
                    <span className="font-medium">{routes.fastest.fuelConsumption}</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm font-medium">Route:</div>
                    <div className="text-sm">{routes.fastest.path}</div>
                  </div>
                  {routes.fastest.riskAreas.length > 0 && (
                    <div className="pt-2">
                      <div className="text-sm font-medium text-red-500 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Risk Areas:
                      </div>
                      <ul className="text-sm text-red-500 pl-5 list-disc">
                        {routes.fastest.riskAreas.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Safest Route Card */}
              <Card
                className={`cursor-pointer transition-all ${
                  selectedRoute === "safest" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedRoute("safest")}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Safest Route</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      AI Optimized for Safety
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">{routes.safest.distance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <span className="font-medium">{routes.safest.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <span className="font-medium text-green-500">
                      {routes.safest.risk}
                    </span>{" "}
                    (Low)
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fuel Consumption:</span>
                    <span className="font-medium">{routes.safest.fuelConsumption}</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm font-medium">Route:</div>
                    <div className="text-sm">{routes.safest.path}</div>
                  </div>
                  {routes.safest.riskAreas.length > 0 && (
                    <div className="pt-2">
                      <div className="text-sm font-medium text-red-500 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Risk Areas:
                      </div>
                      <ul className="text-sm text-red-500 pl-5 list-disc">
                        {routes.safest.riskAreas.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 3) "Demo" tab with multi-stop lines (red & green) */}
          <TabsContent value="demo">
            <div className="relative w-full h-[350px] bg-gray-100 rounded-md overflow-hidden">
              {/* Background image (optional) */}
              <img
                src="/demo-map-placeholder.png"
                alt="Demo background"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* We'll use an SVG with a 0..100 coordinate system, so percentages become easy. */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {/* RED route (fastest) */}
                <polyline
                  fill="none"
                  stroke="red"
                  strokeWidth="3"
                  points="20,60 40,65 50,55 70,50"
                />
                {/* RED stops: same points as the polyline */}
                <circle cx="20" cy="60" r="2" fill="blue" />   {/* Start (common) */}
                <circle cx="40" cy="65" r="2" fill="red" />
                <circle cx="50" cy="55" r="2" fill="red" />
                <circle cx="70" cy="50" r="2" fill="red" />    {/* End for red */}

                {/* GREEN route (safest) */}
                <polyline
                  fill="none"
                  stroke="green"
                  strokeWidth="3"
                  points="20,60 35,70 55,75 70,70"
                />
                {/* GREEN stops: same points as the polyline */}
                <circle cx="20" cy="60" r="2" fill="blue" />   {/* Start (common) */}
                <circle cx="35" cy="70" r="2" fill="green" />
                <circle cx="55" cy="75" r="2" fill="green" />
                <circle cx="70" cy="70" r="2" fill="green" />  {/* End for green */}
              </svg>

              {/* Label text at the bottom */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded-md">
                Demo: Red = Fastest Route, Green = Safest Route
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Driver Instructions remain the same */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Driver Instructions</h3>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium">
              Route: Mumbai to Pune (
              {selectedRoute === "fastest" ? "Fastest" : "Safest"} Path)
            </p>
            <p className="mt-2">1. Start from Mumbai warehouse at 9:00 AM</p>
            <p>
              2.{" "}
              {selectedRoute === "fastest"
                ? "Take NH48 highway"
                : "Take the route via Lonavala"}
            </p>
            {selectedRoute === "fastest" && (
              <p className="text-red-500 flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warning: NH48 has high theft risk between 2-5 PM. Maintain vigilance.
              </p>
            )}
            <p className="mt-2">
              3. Estimated arrival in Pune:{" "}
              {selectedRoute === "fastest" ? "12:00 PM" : "1:00 PM"}
            </p>
            <p className="mt-2">
              Contact dispatch if you encounter any issues: +91 98765 43210
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">
            <Truck className="h-4 w-4 mr-2" />
            Assign to Driver
          </Button>
          <Button>
            <RouteIcon className="h-4 w-4 mr-2" />
            Confirm Route
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
