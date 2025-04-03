"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Loader2 } from "lucide-react"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading, isDemoMode } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Only redirect if not in demo mode, not authenticated, and not still loading
    if (!loading && !user && !isDemoMode && !isRedirecting) {
      setIsRedirecting(true)
      router.push("/auth")
    }
  }, [user, loading, isDemoMode, router, isRedirecting])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  // Allow access if user is authenticated or in demo mode
  if (user || isDemoMode) {
    return <>{children}</>
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Redirecting to login...</span>
    </div>
  )
}

