"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "./auth-provider"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "driver">("admin")
  const [isLoading, setIsLoading] = useState(false)
  const [isConfigured, setIsConfigured] = useState(true)
  const { setUserRole } = useAuth()

  useEffect(() => {
    // Check if Firebase is properly configured
    setIsConfigured(isFirebaseConfigured())
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConfigured) {
      toast({
        title: "Firebase not configured",
        description: "Firebase Authentication is not properly configured. Using demo mode instead.",
        variant: "destructive",
      })
      handleDemoMode()
      return
    }

    setIsLoading(true)

    try {
      if (!auth) throw new Error("Firebase auth is not initialized")

      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      })
    } catch (error) {
      console.error("Error signing in:", error)
      toast({
        title: "Error signing in",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConfigured) {
      toast({
        title: "Firebase not configured",
        description: "Firebase Authentication is not properly configured. Using demo mode instead.",
        variant: "destructive",
      })
      handleDemoMode()
      return
    }

    setIsLoading(true)

    try {
      if (!auth || !db) throw new Error("Firebase is not initialized")

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Store user role in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Account created successfully",
        description: `Welcome to LogiSafe! You are registered as a ${role}.`,
      })
    } catch (error) {
      console.error("Error signing up:", error)
      toast({
        title: "Error creating account",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoMode = () => {
    setIsLoading(true)

    try {
      // Store demo mode in localStorage
      localStorage.setItem("demoMode", "true")
      localStorage.setItem("demoRole", role)

      // Set the role in the auth context
      setUserRole(role)

      toast({
        title: "Demo mode activated",
        description: `You are now using the application in demo mode as ${role}.`,
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 500)
    } catch (error) {
      console.error("Error activating demo mode:", error)
      toast({
        title: "Error activating demo mode",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Sign in or create an account to access the dashboard.</CardDescription>
      </CardHeader>

      {!isConfigured && (
        <Alert variant="destructive" className="mx-6 mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Not Configured</AlertTitle>
          <AlertDescription>
            Firebase Authentication is not properly configured. You can still use the demo mode to explore the
            application with simulated data.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="signin">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!isConfigured}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input
                  id="password-signin"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!isConfigured}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading || !isConfigured}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="w-full space-y-2">
                <Label>Demo Mode</Label>
                <RadioGroup
                  defaultValue="admin"
                  value={role}
                  onValueChange={(value) => setRole(value as "admin" | "driver")}
                  className="flex space-x-4 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="driver" id="driver" />
                    <Label htmlFor="driver">Driver</Label>
                  </div>
                </RadioGroup>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoMode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Demo...
                    </>
                  ) : (
                    `Continue in Demo Mode as ${role}`
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!isConfigured}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!isConfigured}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                  defaultValue="admin"
                  value={role}
                  onValueChange={(value) => setRole(value as "admin" | "driver")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin-signup" />
                    <Label htmlFor="admin-signup">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="driver" id="driver-signup" />
                    <Label htmlFor="driver-signup">Driver</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading || !isConfigured}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={handleDemoMode} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Demo...
                  </>
                ) : (
                  `Continue in Demo Mode as ${role}`
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

