import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RiskMap } from "@/components/risk-map"
import Image from "next/image"
import { useState } from "react"

export default function RiskZonesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Risk Zones</h1>
        <p className="text-muted-foreground">View and manage high-risk areas for theft prevention</p>
      </div>

      {/* 1) Existing RiskMap Card */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Zone Map</CardTitle>
          <CardDescription>Visual representation of risk levels across regions</CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[400px]">
          <RiskMap />
        </CardContent>
      </Card>

      {/* 2) Existing Table of Known Risk Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Known Risk Areas</CardTitle>
          <CardDescription>Areas with reported theft incidents or high-risk factors</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Incident Count</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskZones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.area}</TableCell>
                  <TableCell>{zone.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        zone.riskLevel === "Low"
                          ? "outline"
                          : zone.riskLevel === "Medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {zone.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{zone.incidentCount}</TableCell>
                  <TableCell>{zone.lastUpdated}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{zone.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 3) NEW: Demo Risk Visualization below the table */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Risk Visualization</CardTitle>
          <CardDescription>Random risk zones on a static map image</CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[400px]">
          <RiskMapDemo />
        </CardContent>
      </Card>
    </div>
  )
}

/** Hardcoded known risk zones (unchanged) */
const riskZones = [
  {
    id: "1",
    area: "NH48 Highway",
    location: "Mumbai-Pune Expressway",
    riskLevel: "High",
    incidentCount: 12,
    lastUpdated: "2023-11-15",
    notes: "Multiple theft incidents reported between 2-5 PM. Cargo types: electronics, machinery.",
  },
  {
    id: "2",
    area: "Outer Ring Road",
    location: "Bangalore",
    riskLevel: "Medium",
    incidentCount: 5,
    lastUpdated: "2023-11-10",
    notes: "Incidents reported during night hours. Recommend avoiding after 10 PM.",
  },
  {
    id: "3",
    area: "NH44 Junction",
    location: "Hyderabad-Vijayawada",
    riskLevel: "High",
    incidentCount: 8,
    lastUpdated: "2023-11-12",
    notes: "High-value cargo thefts reported. Police checkpoints recommended.",
  },
  {
    id: "4",
    area: "Industrial Zone",
    location: "Delhi-NCR",
    riskLevel: "Medium",
    incidentCount: 4,
    lastUpdated: "2023-11-08",
    notes: "Incidents during early morning hours. Increased security recommended.",
  },
  {
    id: "5",
    area: "Eastern Bypass",
    location: "Kolkata",
    riskLevel: "Low",
    incidentCount: 2,
    lastUpdated: "2023-10-30",
    notes: "Minor incidents reported. General caution advised.",
  },
]

/** 
 * NEW: A simple "Demo RiskMap" that shows a static image and random circles.
 * Place an image named `demo-map-placeholder.png` in your /public folder.
 */
function RiskMapDemo() {
  // Hardcoded circles for demonstration. 
  // x/y are in % (relative to the container), size is in px.
  const randomCircles = [
    { id: "c1", x: 25, y: 35, size: 60 },
    { id: "c2", x: 60, y: 50, size: 50 },
    { id: "c3", x: 45, y: 70, size: 40 },
  ]

  return (
    <div className="relative w-full h-full">
      {/* 1) Static map image */}
      <Image
        src="/demo-map-placeholder.png"
        alt="Demo Risk Map"
        fill
        style={{ objectFit: "cover" }}
        priority
      />

      {/* 2) Render random circles as semi-transparent overlays */}
      {randomCircles.map((circle) => (
        <div
          key={circle.id}
          className="absolute rounded-full bg-red-600 bg-opacity-30 border border-red-600"
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  )
}
