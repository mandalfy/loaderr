"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSidebar } from "./sidebar-provider"
import { useAuth } from "./auth-provider"
import { ThemeToggle } from "./theme-toggle"

import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Package,
  Users,
  AlertTriangle,
  Route,
  Menu,
  Truck,
  LogOut,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const { userRole, isDemoMode } = useAuth()

  // Define navigation items based on user role
  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Fleet Tracking",
      href: "/tracking",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      title: "Route Optimizer",
      href: "/routes",
      icon: <Route className="h-5 w-5" />,
    },
    {
      title: "Risk Zones",
      href: "/risk-zones",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings/profile",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const driverNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "My Deliveries",
      href: "/orders",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Navigation",
      href: "/routes",
      icon: <Route className="h-5 w-5" />,
    },
    {
      title: "Risk Zones",
      href: "/risk-zones",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/settings/profile",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  // Select navigation items based on user role
  const navItems = userRole === "admin" ? adminNavItems : driverNavItems

  const handleLogout = () => {
    if (isDemoMode) {
      // Clear demo mode
      localStorage.removeItem("demoMode")
      localStorage.removeItem("demoRole")
    }
    // Redirect to auth page
    window.location.href = "/auth"
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b bg-primary text-primary-foreground">
              <h2 className="text-2xl font-bold">Loaderr</h2>
              <p className="text-sm text-primary-foreground/80">
                {userRole === "admin" ? "Admin Dashboard" : "Driver Portal"}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <nav className="grid gap-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => toggle()}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname.startsWith(item.href) ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      )}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
              {isDemoMode && (
                <p className="text-xs text-muted-foreground text-center">
                  Demo Mode: {userRole === "admin" ? "Admin" : "Driver"}
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div
        className={cn("fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-background lg:flex lg:flex-col", className)}
      >
        <div className="p-6 border-b bg-primary text-primary-foreground">
          <h2 className="text-2xl font-bold">Loaderr</h2>
          <p className="text-sm text-primary-foreground/80">
            {userRole === "admin" ? "Admin Dashboard" : "Driver Portal"}
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <nav className="grid gap-2">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname.startsWith(item.href) ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          {isDemoMode && (
            <p className="text-xs text-muted-foreground text-center">
              Demo Mode: {userRole === "admin" ? "Admin" : "Driver"}
            </p>
          )}
        </div>
      </div>
    </>
  )
}

