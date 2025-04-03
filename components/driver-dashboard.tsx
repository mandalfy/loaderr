"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, MapPin, AlertTriangle, Clock, CheckCircle, Truck } from "lucide-react"
import { useAuth } from "./auth-provider"
import Link from "next/link"

export function DriverDashboard() {
  const { user, isDemoMode } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [completedDeliveries, setCompletedDeliveries] = useState<number>(0)
  const [activeDeliveries, setActiveDeliveries] = useState<number>(0)
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<number>(0)

  // Fetch driver assignments
  useEffect(() => {
    // In a real app, we would fetch from Firestore based on the driver's ID
    // For demo, we'll use localStorage
    const fetchAssignments = () => {
      try {
        const driverAssignments = JSON.parse(localStorage.getItem("driverAssignments") || "[]")
        const orders = JSON.parse(localStorage.getItem("orders") || "[]")

        // For demo, we'll just use the first few orders as this driver's assignments
        const driverId = isDemoMode ? "D001" : user?.uid

        // Filter assignments for this driver
        const myAssignments = isDemoMode
          ? orders.slice(0, 5) // In demo mode, show first 5 orders
          : orders.filter((order) => order.driver === driverId)

        setAssignments(myAssignments)

        // Count deliveries by status
        setCompletedDeliveries(myAssignments.filter((a) => a.status === "Delivered").length)
        setActiveDeliveries(myAssignments.filter((a) => a.status === "In Transit").length)
        setUpcomingDeliveries(myAssignments.filter((a) => a.status === "Pending").length)
      } catch (error) {
        console.error("Error fetching assignments:", error)
      }
    }

    fetchAssignments()

    // Set up a timer to refresh data every 30 seconds
    const interval = setInterval(fetchAssignments, 30000)
    return () => clearInterval(interval)
  }, [user, isDemoMode])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Driver Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your deliveries.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              {activeDeliveries === 1 ? "Delivery" : "Deliveries"} in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeliveries}</div>
            <p className="text-xs text-muted-foreground">Scheduled for delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDeliveries}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {assignments.filter((a) => a.status === "In Transit").length > 0 ? (
            assignments
              .filter((a) => a.status === "In Transit")
              .map((assignment, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Order #{assignment.id}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {assignment.pickupLocation} to {assignment.deliveryLocation}
                          </span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <Package className="h-4 w-4 mr-1" />
                          <span>{assignment.cargoType || "General Cargo"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="secondary">In Transit</Badge>
                        <div className="mt-2 space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/routes?order=${assignment.id}`}>View Route</Link>
                          </Button>
                          <Button size="sm">Update Status</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No active deliveries at the moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          {assignments.filter((a) => a.status === "Pending").length > 0 ? (
            assignments
              .filter((a) => a.status === "Pending")
              .map((assignment, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Order #{assignment.id}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {assignment.pickupLocation} to {assignment.deliveryLocation}
                          </span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <Package className="h-4 w-4 mr-1" />
                          <span>{assignment.cargoType || "General Cargo"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="outline">Pending</Badge>
                        <div className="mt-2 space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/routes?order=${assignment.id}`}>View Route</Link>
                          </Button>
                          <Button size="sm">Start Delivery</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No upcoming deliveries scheduled.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {assignments.filter((a) => a.status === "Delivered").length > 0 ? (
            assignments
              .filter((a) => a.status === "Delivered")
              .map((assignment, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Order #{assignment.id}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {assignment.pickupLocation} to {assignment.deliveryLocation}
                          </span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <Package className="h-4 w-4 mr-1" />
                          <span>{assignment.cargoType || "General Cargo"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Delivered
                        </Badge>
                        <div className="mt-2 space-x-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No completed deliveries yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Risk Zones Alert</CardTitle>
          <CardDescription>Be aware of these high-risk areas on your routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Mumbai-Pune Highway (Night)</p>
                <p className="text-sm text-muted-foreground">High risk of theft between 11 PM and 4 AM</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Delhi Outer Ring Road</p>
                <p className="text-sm text-muted-foreground">Medium risk area, travel with caution</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/risk-zones">View All Risk Zones</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

