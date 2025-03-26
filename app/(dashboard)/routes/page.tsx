import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RouteOptimizer } from "@/components/route-optimizer"

export default function RoutesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Route Optimizer</h1>
        <p className="text-muted-foreground">Generate theft-aware, efficient routes for your deliveries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Route</CardTitle>
          <CardDescription>Enter delivery details to generate optimized routes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startLocation">Start Location</Label>
              <Input id="startLocation" placeholder="e.g., Mumbai" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endLocation">End Location</Label>
              <Input id="endLocation" placeholder="e.g., Pune" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargoType">Cargo Type</Label>
              <Select>
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
              <Label htmlFor="vehicle">Assign Vehicle</Label>
              <Select>
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
            <Label htmlFor="stops">Delivery Stops (max 5)</Label>
            <div className="space-y-2">
              <Input placeholder="Stop 1 (e.g., Lonavala)" />
              <Input placeholder="Stop 2" />
              <Input placeholder="Stop 3" />
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              + Add Stop
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset</Button>
          <Button>Generate Routes</Button>
        </CardFooter>
      </Card>

      <RouteOptimizer />
    </div>
  )
}

