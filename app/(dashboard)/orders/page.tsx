import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Route } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CreateOrderDialog } from "@/components/create-order-dialog"

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage delivery orders and assignments</p>
        </div>
        <CreateOrderDialog />
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="h-9" />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <div className="w-full min-w-[640px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Cargo Type</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.from}</TableCell>
                    <TableCell>{order.to}</TableCell>
                    <TableCell>{order.cargoType}</TableCell>
                    <TableCell>{order.driver || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "outline"
                            : order.status === "In Transit"
                              ? "secondary"
                              : order.status === "Pending"
                                ? "default"
                                : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/routes?order=${order.id}`}>
                          <Route className="h-4 w-4" />
                          <span className="sr-only">Optimize Route</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const orders = [
  {
    id: "ORD-001",
    from: "Mumbai",
    to: "Pune",
    cargoType: "Electronics",
    driver: "Rajesh Kumar",
    status: "In Transit",
  },
  {
    id: "ORD-002",
    from: "Delhi",
    to: "Jaipur",
    cargoType: "Furniture",
    driver: "Amit Singh",
    status: "Pending",
  },
  {
    id: "ORD-003",
    from: "Bangalore",
    to: "Chennai",
    cargoType: "Perishable Goods",
    driver: "Priya Sharma",
    status: "In Transit",
  },
  {
    id: "ORD-004",
    from: "Hyderabad",
    to: "Vijayawada",
    cargoType: "Machinery",
    driver: "Suresh Reddy",
    status: "Delayed",
  },
  {
    id: "ORD-005",
    from: "Kolkata",
    to: "Siliguri",
    cargoType: "Clothing",
    driver: "Ananya Das",
    status: "Delivered",
  },
  {
    id: "ORD-006",
    from: "Ahmedabad",
    to: "Surat",
    cargoType: "Electronics",
    driver: "",
    status: "Pending",
  },
  {
    id: "ORD-007",
    from: "Chennai",
    to: "Coimbatore",
    cargoType: "Machinery",
    driver: "",
    status: "Pending",
  },
]

