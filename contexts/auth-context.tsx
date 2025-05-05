"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { logout as apiLogout, isAuthenticated, getUserId } from "@/services/api"

interface AuthContextType {
  isLoggedIn: boolean
  userId: string | null
  login: (email: string, password: string) => Promise<{ token: string; userId: string } | undefined>
  logout: () => void
  checkAuth: () => { authenticated: boolean; currentUserId: string | null }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Function to check authentication status
  const checkAuth = () => {
    const authenticated = isAuthenticated()
    const currentUserId = getUserId()

    console.log("Auth context - Check auth:", authenticated ? "Authenticated" : "Not authenticated")
    if (currentUserId) {
      console.log("Auth context - User ID:", currentUserId)
    }

    setIsLoggedIn(authenticated)
    setUserId(currentUserId)

    return { authenticated, currentUserId }
  }

  useEffect(() => {
    // Check authentication status on mount
    console.log("Auth context - Checking authentication on mount")
    checkAuth()
  }, [])

  // Update the login method in the AuthContext to handle the response correctly
  const login = async (email: string, password: string) => {
    try {
      // Get API URL from localStorage or use default
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001/"

      console.log("Auth context - Attempting login with:", email)

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

      // Store token - adapt this to match your API response format
      let tokenValue, userIdValue

      if (data.token) {
        tokenValue = data.token
        localStorage.setItem("token", tokenValue)
        console.log("Auth context - Login successful, token:", tokenValue.substring(0, 10) + "...")
      } else if (data.access_token) {
        tokenValue = data.access_token
        localStorage.setItem("token", tokenValue)
        console.log("Auth context - Login successful, token:", tokenValue.substring(0, 10) + "...")
      } else {
        throw new Error("Login response missing token")
      }

      // Store userId - adapt this to match your API response format
      if (data.userId) {
        userIdValue = data.userId
        localStorage.setItem("userId", userIdValue)
        console.log("Auth context - Login successful, userId:", userIdValue)
      } else if (data.user && data.user.id) {
        userIdValue = data.user.id
        localStorage.setItem("userId", userIdValue)
        console.log("Auth context - Login successful, userId:", userIdValue)
      } else {
        throw new Error("Login response missing userId")
      }

      setIsLoggedIn(true)
      setUserId(userIdValue)

      return { token: tokenValue, userId: userIdValue }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const logout = () => {
    console.log("Auth context - Logging out")
    apiLogout()
    setIsLoggedIn(false)
    setUserId(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout, checkAuth }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
