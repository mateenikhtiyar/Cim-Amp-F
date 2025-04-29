"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isLoggedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for token and userId in URL parameters
  useEffect(() => {
    // Check if redirected due to session expiry
    const sessionExpired = searchParams?.get("session") === "expired"
    if (sessionExpired) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      })
    }

    const urlToken = searchParams?.get("token")
    const urlUserId = searchParams?.get("userId")

    if (urlToken) {
      const cleanToken = urlToken.trim()
      localStorage.setItem("token", cleanToken)
      console.log("Login page - Token set from URL:", cleanToken.substring(0, 10) + "...")
    }

    if (urlUserId) {
      const cleanUserId = urlUserId.trim()
      localStorage.setItem("userId", cleanUserId)
      console.log("Login page - User ID set from URL:", cleanUserId)
    }

    // If both token and userId are provided, redirect to deals
    if (urlToken && urlUserId) {
      console.log("Login page - Redirecting to deals with token and userId from URL")
      router.push("/acquireprofile")
      return
    }

    // Check if already logged in
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      console.log("Login page - Token found in localStorage, redirecting to deals")
      router.push("/acquireprofile")
    }
  }, [searchParams, router])

  // Update the handleSubmit function to properly handle the login response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Basic validation
      if (!email.trim()) {
        throw new Error("Email is required")
      }
      if (!password) {
        throw new Error("Password is required")
      }

      console.log("Login page - Attempting login with:", email)

      // Get API URL from localStorage or use default
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

      // Use fetch directly for more control
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Login failed with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Login response:", data)

      // Store token - adapt this to match your API response format
      if (data.token) {
        localStorage.setItem("token", data.token)
        console.log("Login page - Login successful, token stored:", data.token.substring(0, 10) + "...")
      } else if (data.access_token) {
        localStorage.setItem("token", data.access_token)
        console.log("Login page - Login successful, token stored:", data.access_token.substring(0, 10) + "...")
      } else {
        throw new Error("Login response missing token")
      }

      // Store userId - adapt this to match your API response format
      if (data.userId) {
        localStorage.setItem("userId", data.userId)
        console.log("Login page - Login successful, userId stored:", data.userId)
      } else if (data.user && data.user.id) {
        localStorage.setItem("userId", data.user.id)
        console.log("Login page - Login successful, userId stored:", data.user.id)
      } else {
        console.warn("Login page - Login response missing userId")
      }

      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      })

      // Redirect to acquire profile page
      setTimeout(() => {
        router.push("/deals")
      }, 1000)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please check your credentials.")
      toast({
        title: "Login Failed",
        description: err.message || "Login failed. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    // Get API URL from localStorage or use default
    const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"
    console.log("Login page - Redirecting to Google OAuth:", `${apiUrl}/buyers/google`)

    // Redirect to Google OAuth endpoint
    window.location.href = `${apiUrl}/buyers/google`
  }

  return (
    <div className="flex h-screen bg-[#C7D7D7] overflow-hidden">
      {/* Left side - Illustration */}
      <div className="hidden  md:flex md:w-1/2 items-center justify-center  relative">
      <Image
          src="/Bg.svg"
          alt="Financial illustration with handshake and growth chart"
          width={500}
          height={500}
          priority
          className="z-10 bg-cover bg-center w-full h-full object-cover"
        />
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-2/3 bg-white rounded-l-[40px] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
          )}

          {/* Google login button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md p-3 mb-6 hover:bg-gray-50 transition-colors"
          >
            Login with Google
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
                className="w-full py-6"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  required
                  className="w-full pr-10 py-6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 "
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3aafa9] hover:bg-[#2a9d8f] text-white py-6 rounded-3xl"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login my account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#3aafa9] hover:underline font-medium">
              signup
            </Link>
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
