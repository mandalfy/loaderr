import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { FleetMap } from "@/components/fleet-map"
import { VehicleList } from "@/components/vehicle-list"

export default function TrackingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fleet Tracking</h1>
        <p className="text-muted-foreground">Monitor your vehicles in real-time and view delivery status</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vehicles or drivers..." className="h-9" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">Refresh Data</Button>
        </div>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Fleet Map</CardTitle>
              <CardDescription>View all vehicles and their current status</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <FleetMap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle List</CardTitle>
              <CardDescription>Detailed information about each vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

