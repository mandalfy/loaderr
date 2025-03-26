import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RiskMap } from "@/components/risk-map"

export default function RiskZonesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Risk Zones</h1>
        <p className="text-muted-foreground">View and manage high-risk areas for theft prevention</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Zone Map</CardTitle>
          <CardDescription>Visual representation of risk levels across regions</CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[400px]">
          <RiskMap />
        </CardContent>
      </Card>

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
                        zone.riskLevel === "Low" ? "outline" : zone.riskLevel === "Medium" ? "secondary" : "destructive"
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
    </div>
  )
}

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

