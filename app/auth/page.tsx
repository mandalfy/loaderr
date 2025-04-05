import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left side with quote and background */}
      <div className="hidden md:flex md:w-1/2 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 z-10"></div>
        <div className="absolute inset-0 opacity-20">
          <Image src="/logistics-background.jpg" alt="Logistics background" fill className="object-cover" priority />
        </div>
        <div className="relative z-20 flex flex-col justify-center items-center p-12 text-center h-full">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-6">Loaderr</h1>
            <div className="w-16 h-1 bg-primary-foreground/50 mx-auto mb-6"></div>
            <p className="text-2xl font-light italic mb-8">
              "The road to success is always under construction. We're just making the journey safer and more
              efficient."
            </p>
            <p className="text-sm font-medium uppercase tracking-wider">AI-Powered Logistics Platform</p>
          </div>
          <div className="absolute bottom-8 left-8">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-background">
        <div className="md:hidden absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
        <p className="text-sm text-muted-foreground mt-8">© 2023 Loaderr. All rights reserved.</p>
      </div>
    </div>
  )
}

