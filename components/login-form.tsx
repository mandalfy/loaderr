"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle, Mail, Lock, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "./auth-provider"
import { Separator } from "@/components/ui/separator"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "driver">("admin")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
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
        description: `Welcome to Loaderr! You are registered as a ${role}.`,
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

  const handleGoogleSignIn = async () => {
    if (!isConfigured) {
      toast({
        title: "Firebase not configured",
        description: "Firebase Authentication is not properly configured. Using demo mode instead.",
        variant: "destructive",
      })
      handleDemoMode()
      return
    }

    setIsGoogleLoading(true)

    try {
      if (!auth || !db) throw new Error("Firebase is not initialized")

      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)

      // Check if user exists in Firestore
      const userDoc = await doc(db, "users", userCredential.user.uid)

      // Store user role in Firestore if it's a new user
      await setDoc(
        userDoc,
        {
          email: userCredential.user.email,
          role: role,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          provider: "google",
        },
        { merge: true },
      )

      toast({
        title: "Signed in with Google successfully",
        description: `Welcome to Loaderr!`,
      })
    } catch (error) {
      console.error("Error signing in with Google:", error)
      toast({
        title: "Error signing in with Google",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
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
    <Card className="w-full shadow-lg border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center md:hidden mb-2">
          <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center">
            <span className="font-bold text-lg">L</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Welcome to Loaderr</CardTitle>
        <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
      </CardHeader>

      {!isConfigured && (
        <Alert variant="destructive" className="mx-6 mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Not Configured</AlertTitle>
          <AlertDescription>
            Firebase Authentication is not properly configured. You can still use the demo mode to explore the
            application with simulated data.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mt-4 mx-auto max-w-[90%]">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!isConfigured}
                  className="border-input/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password-signin"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!isConfigured}
                  className="border-input/50 bg-background/50"
                />
              </div>
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || !isConfigured}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
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
                  variant="secondary"
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
                <Label htmlFor="email-signup" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!isConfigured}
                  className="border-input/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password-signup"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!isConfigured}
                  className="border-input/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account Type
                </Label>
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || !isConfigured}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                type="button"
                variant="secondary"
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
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

