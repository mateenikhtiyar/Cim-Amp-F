"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token")
    console.log("Root page - Token check:", token ? "Token exists" : "No token")

    if (isLoggedIn || token) {
      console.log("Root page - Redirecting to deals")
      router.push("/deals")
    } else {
      console.log("Root page - Redirecting to login")
      router.push("/selectrole")
    }
  }, [isLoggedIn, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="w-16 h-16 border-4 border-t-[#3aafa9] border-r-[#3aafa9] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  )
}
