import { RouteOptimizer } from "@/components/route-optimizer"

export default function RoutesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Route Optimizer</h1>
        <p className="text-muted-foreground">Generate theft-aware, efficient routes for your deliveries</p>
      </div>

      <RouteOptimizer />
    </div>
  )
}

