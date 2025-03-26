import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Truck, AlertTriangle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ActiveDeliveries() {
  return (
    <div className="space-y-6">
      {deliveries.map((delivery) => (
        <div key={delivery.id} className="flex items-start">
          <Avatar className="h-9 w-9 border">
            <Truck className="h-4 w-4" />
            <AvatarFallback>{delivery.driver[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{delivery.route}</p>
              <Badge
                variant={
                  delivery.riskLevel === "Low"
                    ? "outline"
                    : delivery.riskLevel === "Medium"
                      ? "secondary"
                      : "destructive"
                }
              >
                {delivery.riskLevel} Risk
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Driver: {delivery.driver}</p>
            <p className="text-xs text-muted-foreground">
              {delivery.status === "On Time" ? (
                <span className="flex items-center text-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" /> On Time
                </span>
              ) : (
                <span className="flex items-center text-amber-500">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Delayed
                </span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

const deliveries = [
  {
    id: "1",
    route: "Mumbai → Pune",
    driver: "Rajesh Kumar",
    status: "On Time",
    riskLevel: "Low",
  },
  {
    id: "2",
    route: "Delhi → Jaipur",
    driver: "Amit Singh",
    status: "Delayed",
    riskLevel: "Medium",
  },
  {
    id: "3",
    route: "Bangalore → Chennai",
    driver: "Priya Sharma",
    status: "On Time",
    riskLevel: "Low",
  },
  {
    id: "4",
    route: "Hyderabad → Vijayawada",
    driver: "Suresh Reddy",
    status: "On Time",
    riskLevel: "High",
  },
  {
    id: "5",
    route: "Kolkata → Siliguri",
    driver: "Ananya Das",
    status: "Delayed",
    riskLevel: "Medium",
  },
]

