"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"
import type { User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

type UserRole = "admin" | "driver" | null

type AuthContextType = {
  user: User | null
  loading: boolean
  userRole: UserRole
  isDemoMode: boolean
  setUserRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  isDemoMode: false,
  setUserRole: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Function to fetch user role from Firestore
  const fetchUserRole = async (userId: string) => {
    try {
      if (!db) return null

      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        return userDoc.data().role as UserRole
      }
      return null
    } catch (error) {
      console.error("Error fetching user role:", error)
      return null
    }
  }

  useEffect(() => {
    // Function to check demo mode
    const checkDemoMode = () => {
      try {
        return localStorage.getItem("demoMode") === "true"
      } catch (e) {
        return false
      }
    }

    // Function to get demo role
    const getDemoRole = () => {
      try {
        return localStorage.getItem("demoRole") || "admin"
      } catch (e) {
        return "admin"
      }
    }

    // Set initial demo mode
    const initialDemoMode = checkDemoMode()
    setIsDemoMode(initialDemoMode)

    // If Firebase is not configured or we're in demo mode, set default state
    if (!isFirebaseConfigured() || initialDemoMode) {
      // In demo mode, get the role from localStorage
      setUserRole(getDemoRole() as UserRole)
      setLoading(false)

      // If Firebase is not configured, ensure demo mode is set
      if (!isFirebaseConfigured() && !initialDemoMode) {
        try {
          localStorage.setItem("demoMode", "true")
          localStorage.setItem("demoRole", "admin") // Default to admin in demo mode
          setIsDemoMode(true)
        } catch (e) {
          console.error("Could not set demo mode in localStorage:", e)
        }
      }
      return
    }

    // Only set up auth listener if Firebase is configured and we're not in demo mode
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        setUser(currentUser)

        if (currentUser) {
          // Fetch user role from Firestore
          const role = await fetchUserRole(currentUser.uid)
          setUserRole(role || "driver") // Default to driver if role not found
        } else {
          setUserRole(null)
        }

        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      // If auth is not available, finish loading
      setLoading(false)
    }
  }, [])

  // Function to set user role (used for demo mode)
  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role)
    if (isDemoMode) {
      try {
        localStorage.setItem("demoRole", role || "admin")
      } catch (e) {
        console.error("Could not set demo role in localStorage:", e)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userRole,
        isDemoMode,
        setUserRole: handleSetUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

