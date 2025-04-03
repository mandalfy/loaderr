import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AuthCheck } from "@/components/auth-check"
import { GoogleMapsProvider } from "@/components/google-maps-provider"
import { SidebarProvider } from "@/components/sidebar-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <GoogleMapsProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="lg:pl-72">
              <Header />
              <main className="p-4 md:p-6 lg:p-8">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </GoogleMapsProvider>
    </AuthCheck>
  )
}

