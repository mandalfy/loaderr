import { LoginForm } from "@/components/login-form"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">LogiSafe Dashboard</h1>
        <LoginForm />
      </div>
    </div>
  )
}

