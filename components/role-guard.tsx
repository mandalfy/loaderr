"use client"

import type { ReactNode } from "react"
import { useAuth } from "./auth-provider"

type RoleGuardProps = {
  allowedRoles: ("admin" | "driver")[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { userRole, loading } = useAuth()

  // While loading, show nothing
  if (loading) return null

  // If user has the required role, show the children
  if (userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>
  }

  // Otherwise, show the fallback or nothing
  return fallback ? <>{fallback}</> : null
}

