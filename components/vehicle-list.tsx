"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Route, AlertTriangle, CheckCircle } from "lucide-react"

export function VehicleList() {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle ID</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Current Location</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">{vehicle.id}</TableCell>
              <TableCell>{vehicle.driver}</TableCell>
              <TableCell>{vehicle.currentLocation}</TableCell>
              <TableCell>{vehicle.destination}</TableCell>
              <TableCell>
                {vehicle.status === "Moving" ? (
                  <span className="flex items-center text-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" /> Moving
                  </span>
                ) : (
                  <span className="flex items-center text-amber-500">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Idle
                  </span>
                )}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  title="View on map"
                  onClick={() => {
                    window.location.href = `/tracking?vehicle=${vehicle.id}`
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="View route"
                  onClick={() => {
                    window.location.href = `/routes?vehicle=${vehicle.id}`
                  }}
                >
                  <Route className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const vehicles = [
  {
    id: "TRK-001",
    driver: "Rajesh Kumar",
    currentLocation: "Mumbai",
    destination: "Pune",
    status: "Moving",
    riskLevel: "Low",
  },
  {
    id: "TRK-002",
    driver: "Amit Singh",
    currentLocation: "Delhi",
    destination: "Jaipur",
    status: "Idle",
    riskLevel: "Medium",
  },
  {
    id: "TRK-003",
    driver: "Priya Sharma",
    currentLocation: "Bangalore",
    destination: "Chennai",
    status: "Moving",
    riskLevel: "Low",
  },
  {
    id: "TRK-004",
    driver: "Suresh Reddy",
    currentLocation: "Hyderabad",
    destination: "Vijayawada",
    status: "Moving",
    riskLevel: "High",
  },
  {
    id: "TRK-005",
    driver: "Ananya Das",
    currentLocation: "Kolkata",
    destination: "Siliguri",
    status: "Idle",
    riskLevel: "Medium",
  },
]

