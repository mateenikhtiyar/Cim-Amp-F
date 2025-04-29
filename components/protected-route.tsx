"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, checkAuth } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on mount and when isLoggedIn changes
    const verifyAuth = async () => {
      setIsChecking(true)
      const { authenticated } = checkAuth()

      if (!authenticated) {
        router.push("/login")
      }

      setIsChecking(false)
    }

    verifyAuth()
  }, [isLoggedIn, router, checkAuth])

  // Show nothing while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#3aafa9] border-r-[#3aafa9] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#344054]">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If not logged in, the useEffect will redirect, so we don't need to handle that case here
  return <>{children}</>
}
