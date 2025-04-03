"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateOrderDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    pickupLocation: "",
    deliveryLocation: "",
    cargoType: "",
    weight: "",
    specialInstructions: "",
  })
  const router = useRouter()

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call to create order
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a random order ID
      const orderId = `ORD-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

      // Store order in localStorage for MVP
      const orders = JSON.parse(localStorage.getItem("orders") || "[]")
      const newOrder = {
        id: orderId,
        ...formData,
        status: "Pending",
        createdAt: new Date().toISOString(),
      }
      orders.push(newOrder)
      localStorage.setItem("orders", JSON.stringify(orders))

      toast({
        title: "Order created successfully",
        description: `Order ID: ${orderId}`,
      })

      setOpen(false)
      setFormData({
        customerName: "",
        pickupLocation: "",
        deliveryLocation: "",
        cargoType: "",
        weight: "",
        specialInstructions: "",
      })

      // Redirect to route optimizer with the new order
      router.push(`/routes?order=${orderId}`)
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error creating order",
        description: "An error occurred while creating the order.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Order</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>Fill in the details to create a new logistics order.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input
              id="pickupLocation"
              placeholder="Enter pickup location"
              value={formData.pickupLocation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryLocation">Delivery Location</Label>
            <Input
              id="deliveryLocation"
              placeholder="Enter delivery location"
              value={formData.deliveryLocation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargoType">Cargo Type</Label>
              <Select
                onValueChange={(value) => handleSelectChange("cargoType", value)}
                value={formData.cargoType}
                required
              >
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
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Enter weight"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Enter any special instructions"
              value={formData.specialInstructions}
              onChange={handleChange}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

