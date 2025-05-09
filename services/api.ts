import axios from "axios"

const API_URL = "https://cim-amp.onrender.com"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      // Set Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`

      // Log the headers for debugging
      console.log("API - Request with token:", token.substring(0, 10) + "...")
    } else {
      console.warn("API - No token found in localStorage")
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      })

      // Handle 401 errors
      if (error.response.status === 401) {
        console.error("API - Authentication failed. Token may be invalid or expired.")
        // Clear invalid token and redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("userId")

        // Only redirect if we're in the browser environment
        if (typeof window !== "undefined") {
          window.location.href = "/login?session=expired"
        }
      }
    } else if (error.request) {
      console.error("API Error Request:", error.request)
    } else {
      console.error("API Error:", error.message)
    }
    return Promise.reject(error)
  },
)

// Update the submitCompanyProfile function to handle both create and update operations
export const submitCompanyProfile = async (profileData: any, profileId?: string) => {
  try {
    // Get the token directly before making the request
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }

    // Determine if this is a create or update operation
    const isUpdate = !!profileId
    console.log(
      `API - ${isUpdate ? "Updating" : "Creating"} company profile with token:`,
      token.substring(0, 10) + "...",
    )
    console.log("API - Submitting data:", JSON.stringify(profileData))

    // Get API URL from localStorage or use default
    const apiUrl = localStorage.getItem("apiUrl") || API_URL

    // Use the appropriate endpoint based on whether this is a create or update
    const endpoint = isUpdate ? `${apiUrl}/company-profiles/${profileId}` : `${apiUrl}/company-profiles`
    const method = isUpdate ? "PATCH" : "POST"

    console.log(`API - Using ${method} request to endpoint:`, endpoint)

    // Use direct fetch instead of axios for more control
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    console.log("API - Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("API Error Response:", errorData)

      // If unauthorized, redirect to login
      if (response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        window.location.href = "/login?session=expired"
        throw new Error("Authentication expired. Please log in again.")
      }

      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    console.log(`API - ${isUpdate ? "Update" : "Submission"} successful:`, result)
    return result
  } catch (error) {
    console.error(`Error ${profileId ? "updating" : "submitting"} company profile:`, error)
    throw error
  }
}

export const register = async (userData: {
  fullName: string
  email: string
  password: string
  companyName: string
}) => {
  try {
    // Get API URL from localStorage or use default
    const apiUrl = localStorage.getItem("apiUrl") || API_URL

    const response = await axios.post(`${apiUrl}/buyers/register`, userData)

    // After successful registration, log the user in
    const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
      email: userData.email,
      password: userData.password,
    })

    const { access_token, user } = loginResponse.data

    // Store token and userId in localStorage
    if (access_token) {
      localStorage.setItem("token", access_token)
      console.log("API - Registration successful, token stored:", access_token.substring(0, 10) + "...")
    }

    if (user && user.id) {
      localStorage.setItem("userId", user.id)
      console.log("API - Registration successful, userId stored:", user.id)
    }

    return { token: access_token, userId: user.id }
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

export const login = async (credentials: { email: string; password: string }) => {
  try {
    // Get API URL from localStorage or use default
    const apiUrl = localStorage.getItem("apiUrl") || API_URL

    console.log("API - Attempting login with:", credentials.email)

    // Use fetch instead of axios for more control
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Login failed with status: ${response.status}`)
    }

    const data = await response.json()

    // Store token from access_token field
    if (data.access_token) {
      localStorage.setItem("token", data.access_token)
      console.log("API - Login successful, token stored:", data.access_token.substring(0, 10) + "...")
    } else {
      console.error("API - Login response missing token")
      throw new Error("Login response missing token")
    }

    // Store userId from user.id field
    if (data.user && data.user.id) {
      localStorage.setItem("userId", data.user.id)
      console.log("API - Login successful, userId stored:", data.user.id)
    } else {
      console.error("API - Login response missing userId")
      throw new Error("Login response missing userId")
    }

    return { token: data.access_token, userId: data.user.id }
  } catch (error: any) {
    console.error("Login error:", error)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userId")
  console.log("API - Logged out, token and userId removed from localStorage")
}

export const isAuthenticated = () => {
  const token = localStorage.getItem("token")
  return !!token
}

export const getUserId = () => {
  return localStorage.getItem("userId")
}

export default api
