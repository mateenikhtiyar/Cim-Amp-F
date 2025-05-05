"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<RegisterFormData & { general: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check for token and userId in URL parameters
  useEffect(() => {
    const urlToken = searchParams?.get("token")
    const urlUserId = searchParams?.get("userId")

    if (urlToken) {
      const cleanToken = urlToken.trim()
      localStorage.setItem("token", cleanToken)
      console.log("Register page - Token set from URL:", cleanToken.substring(0, 10) + "...")
    }

    if (urlUserId) {
      const cleanUserId = urlUserId.trim()
      localStorage.setItem("userId", cleanUserId)
      console.log("Register page - User ID set from URL:", cleanUserId)
    }

    // If both token and userId are provided, redirect to deals
    if (urlToken && urlUserId) {
      console.log("Register page - Redirecting to acquireprofile with token and userId from URL")
      router.push("/acquireprofile")
      return
    }

    // Check if already logged in
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      console.log("Register page - Token found in localStorage, redirecting to acquireprofile")
      router.push("/acquireprofile")
    }
  }, [searchParams, router])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Validate form data
  const validateForm = () => {
    const newErrors: Partial<RegisterFormData & { general: string }> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle traditional registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get API URL from localStorage or use default
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

      console.log("Register page - Submitting registration to:", apiUrl)

      const response = await fetch(`${apiUrl}/buyers/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Registration failed with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Registration response:", data)

      // The backend should return the user data and we'll generate a login token
      if (data) {
        // After successful registration, log the user in
        const loginResponse = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        if (!loginResponse.ok) {
          throw new Error("Registration successful but automatic login failed. Please log in manually.")
        }

        const loginData = await loginResponse.json()

        // Store token - adapt this to match your API response format
        if (loginData.token) {
          localStorage.setItem("token", loginData.token)
          console.log("Register page - Token stored from login:", loginData.token.substring(0, 10) + "...")
        } else if (loginData.access_token) {
          localStorage.setItem("token", loginData.access_token)
          console.log("Register page - Token stored from login:", loginData.access_token.substring(0, 10) + "...")
        } else {
          console.warn("Register page - Login response missing token")
        }

        // Store userId - adapt this to match your API response format
        if (loginData.userId) {
          localStorage.setItem("userId", loginData.userId)
          console.log("Register page - User ID stored from login:", loginData.userId)
        } else if (loginData.user && loginData.user.id) {
          localStorage.setItem("userId", loginData.user.id)
          console.log("Register page - User ID stored from login:", loginData.user.id)
        } else {
          console.warn("Register page - Login response missing userId")
        }

        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
        })

        // Redirect to company profile page
        setTimeout(() => {
          router.push("/acquireprofile")
        }, 1500)
      } else {
        throw new Error("Registration response missing user data")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setErrors({ general: error.message || "Registration failed. Please try again." })
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    // Get API URL from localStorage or use default
    const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"
    console.log("Register page - Redirecting to Google OAuth:", `${apiUrl}/buyers/google`)

    // Redirect to Google OAuth endpoint
    window.location.href = `${apiUrl}/buyers/google`
  }

  return (
    <div className="">
      
      <div className="flex h-screen bg-[#C6D6D6] overflow-hidden">
      {/* Left side with illustration */}
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

      {/* Right side - Registration form */}
      <div className="w-full md:w-2/3 bg-white rounded-l-[40px] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-3">
          <h1 className="text-3xl font-bold mb-8 text-center">Create an account</h1>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          {/* Google signup button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md p-3 mb-6 hover:bg-gray-50 transition-colors"
          >
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
            Create account with Google
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=""
                className={`${errors.email ? "border-red-300" : ""} py-5`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder=""
                className={`${errors.fullName ? "border-red-300" : ""} py-5`}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=""
                  className={`${errors.password ? "border-red-300 pr-10" : "pr-10"} py-5`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder=""
                  className={`${errors.confirmPassword ? "border-red-300 pr-10" : "pr-10"} py-5`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder=""
                className={`${errors.companyName ? "border-red-300" : ""} py-5`}
              />
              {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3aafa9] hover:bg-[#2a9d8f] text-white py-6 rounded-3xl mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create an account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#3aafa9] hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
