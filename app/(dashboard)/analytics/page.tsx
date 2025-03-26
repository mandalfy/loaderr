import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeliveryPerformanceChart } from "@/components/delivery-performance-chart"
import { RiskAnalyticsChart } from "@/components/risk-analytics-chart"
import { FuelEfficiencyChart } from "@/components/fuel-efficiency-chart"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track performance metrics and identify optimization opportunities</p>
      </div>

      <Tabs defaultValue="delivery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="delivery">Delivery Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
              <CardDescription>On-time delivery rates and efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <DeliveryPerformanceChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Theft incidents and risk mitigation effectiveness</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <RiskAnalyticsChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Efficiency</CardTitle>
              <CardDescription>Fuel consumption and cost analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <FuelEfficiencyChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Route Optimization Impact</CardTitle>
            <CardDescription>Benefits of AI-powered route optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Distance Saved</p>
                  <p className="text-2xl font-bold">1,207 km</p>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                  <p className="text-2xl font-bold">42 hours</p>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Fuel Saved</p>
                  <p className="text-2xl font-bold">₹38,500</p>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Risk Reduction</p>
                  <p className="text-2xl font-bold">75%</p>
                  <p className="text-xs text-muted-foreground">+25% from last month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-generated insights from your logistics data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">High-Risk Time Periods</p>
                <p className="text-sm mt-1">
                  Theft incidents are 3x more likely between 2-5 PM on highways. Consider adjusting delivery schedules.
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Route Recommendation</p>
                <p className="text-sm mt-1">
                  Using alternative routes for Mumbai-Pune deliveries has reduced risk by 65% with only 18% increase in
                  travel time.
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Vehicle Utilization</p>
                <p className="text-sm mt-1">
                  TRK-002 and TRK-005 are underutilized. Consider reassigning to high-demand routes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

