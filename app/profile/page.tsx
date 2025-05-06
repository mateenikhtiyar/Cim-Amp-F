"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, LogOut, Settings, Briefcase, ChevronDown, Trash2, Loader2, Camera } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define types based on the provided schemas
interface BuyerProfile {
  _id: string
  fullName: string
  email: string
  companyName: string
  role: string
  profilePicture: string | null
}

interface Contact {
  name: string
  email: string
  phone: string
}

interface CompanyProfile {
  companyName: string
  website: string
  contacts: Contact[]
  companyType: string
  capitalEntity: string
  dealsCompletedLast5Years?: number
  averageDealSize?: number
  preferences: {
    stopSendingDeals: boolean
    dontShowMyDeals: boolean
    dontSendDealsToMyCompetitors: boolean
    allowBuyerLikeDeals: boolean
  }
  targetCriteria: {
    countries: string[]
    industrySectors: string[]
    revenueMin?: number
    revenueMax?: number
    ebitdaMin?: number
    ebitdaMax?: number
    transactionSizeMin?: number
    transactionSizeMax?: number
    minStakePercent?: number
    minYearsInBusiness?: number
    preferredBusinessModels: string[]
    managementTeamPreference?: string
    description?: string
  }
}

export default function ProfilePage() {
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [buyerId, setBuyerId] = useState<string | null>(null)
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for token and userId on mount and from URL parameters
  useEffect(() => {
    // Get token and userId from URL parameters
    const urlToken = searchParams?.get("token")
    const urlUserId = searchParams?.get("userId")

    // Set token from URL or localStorage
    if (urlToken) {
      const cleanToken = urlToken.trim()
      localStorage.setItem("token", cleanToken)
      setAuthToken(cleanToken)
      console.log("Profile page - Token set from URL:", cleanToken.substring(0, 10) + "...")
    } else {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        const cleanToken = storedToken.trim()
        setAuthToken(cleanToken)
        console.log("Profile page - Token set from localStorage:", cleanToken.substring(0, 10) + "...")
      } else {
        console.warn("Profile page - No token found, redirecting to login")
        router.push("/login")
        return
      }
    }

    // Set userId from URL or localStorage
    if (urlUserId) {
      const cleanUserId = urlUserId.trim()
      localStorage.setItem("userId", cleanUserId)
      setBuyerId(cleanUserId)
      console.log("Profile page - Buyer ID set from URL:", cleanUserId)
    } else {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        const cleanUserId = storedUserId.trim()
        setBuyerId(cleanUserId)
        console.log("Profile page - Buyer ID set from localStorage:", cleanUserId)
      }
    }
  }, [searchParams, router])

  // Fetch buyer and company profile data
  useEffect(() => {
    if (!authToken) return

    const fetchProfiles = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get API URL from localStorage or use default
        const apiUrl = localStorage.getItem("apiUrl") || "https://cim-amp.onrender.com"

        // Fetch buyer profile
        const buyerResponse = await fetch(`${apiUrl}/buyers/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!buyerResponse.ok) {
          if (buyerResponse.status === 401) {
            // Handle unauthorized
            localStorage.removeItem("token")
            localStorage.removeItem("userId")
            router.push("/login?session=expired")
            throw new Error("Session expired. Please log in again.")
          }
          throw new Error(`Failed to fetch buyer profile: ${buyerResponse.status}`)
        }

        const buyerData = await buyerResponse.json()
        setBuyerProfile(buyerData)

        // Fetch company profile
        const companyResponse = await fetch(`${apiUrl}/company-profiles/my-profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        // If 404, it means the user hasn't created a company profile yet
        if (companyResponse.status === 404) {
          console.log("No company profile found")
          setCompanyProfile(null)
        } else if (!companyResponse.ok) {
          if (companyResponse.status === 401) {
            // Handle unauthorized
            localStorage.removeItem("token")
            localStorage.removeItem("userId")
            router.push("/login?session=expired")
            throw new Error("Session expired. Please log in again.")
          }
          throw new Error(`Failed to fetch company profile: ${companyResponse.status}`)
        } else {
          const companyData = await companyResponse.json()
          setCompanyProfile(companyData)
        }
      } catch (err: any) {
        console.error("Error fetching profiles:", err)
        setError(err.message || "Failed to load profile data")
        toast({
          title: "Error",
          description: err.message || "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [authToken, router])

  const handleLogout = () => {
    console.log("Profile page - Logging out")
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/login")
  }

  // Format currency values
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Function to get the complete profile picture URL
  const getProfilePictureUrl = (path: string | null) => {
    if (!path) return null
    
    const apiUrl = localStorage.getItem("apiUrl") || "https://cim-amp.onrender.com"
    
    // If the path already has http/https, return it as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    
    // Replace backslashes with forward slashes for URL compatibility
    const formattedPath = path.replace(/\\/g, '/')
    
    // Check if path already starts with a slash
    return `${apiUrl}/${formattedPath.startsWith('/') ? formattedPath.substring(1) : formattedPath}`
  }

  // Update the handleProfilePictureUpload function to use 'file' as the form field name
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !authToken) return

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      toast({
        title: "Invalid file type",
        description: "Only image files (JPG, JPEG, PNG, GIF) are allowed.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size should not exceed 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Get API URL from localStorage or use default
      const apiUrl = localStorage.getItem("apiUrl") || "https://cim-amp.onrender.com"

      // Create form data with 'file' as the field name
      const formData = new FormData()
      formData.append("file", file)

      // Upload the image
      const response = await fetch(`${apiUrl}/buyers/upload-profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          router.push("/login?session=expired")
          throw new Error("Session expired. Please log in again.")
        }
        throw new Error(`Failed to upload profile picture: ${response.status}`)
      }

      const data = await response.json()

      // Update the buyer profile with the new profile picture path
      if (buyerProfile) {
        setBuyerProfile({
          ...buyerProfile,
          profilePicture: data.profilePicture || buyerProfile.profilePicture,
        })
      }

      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      })

      // Refresh the profile data to get the updated profile picture
      fetchBuyerProfile()
    } catch (err: any) {
      console.error("Error uploading profile picture:", err)
      setUploadError(err.message || "Failed to upload profile picture")
      toast({
        title: "Error",
        description: err.message || "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Add a function to fetch just the buyer profile
  const fetchBuyerProfile = async () => {
    if (!authToken) return

    try {
      const apiUrl = localStorage.getItem("apiUrl") || "https://cim-amp.onrender.com"

      const buyerResponse = await fetch(`${apiUrl}/buyers/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!buyerResponse.ok) {
        if (buyerResponse.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          router.push("/login?session=expired")
          throw new Error("Session expired. Please log in again.")
        }
        throw new Error(`Failed to fetch buyer profile: ${buyerResponse.status}`)
      }

      const buyerData = await buyerResponse.json()
      setBuyerProfile(buyerData)
    } catch (err) {
      console.error("Error fetching buyer profile:", err)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white ">
        <div className="flex items-center justify-between px-6 py-4 ">
          <div className="flex items-center pt-3 pb-1">
            <Link href="/deals">
              <div className="flex items-center">
                <img src="/logo.svg" alt="CIM Amplify" className="h-10" />
              </div>
            </Link>
            <h1 className="ml-8 text-2xl font-semibold text-gray-800 py-2">My Profile</h1>
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              <div className="mr-2 text-right">
                <div className="text-sm font-medium">{buyerProfile?.fullName || "User"}</div>
                {/* <div className="text-xs text-gray-500">{buyerId ? `ID: ${buyerId.substring(0, 8)}...` : "No ID"}</div> */}
              </div>
              <div className="relative">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  {buyerProfile?.profilePicture ? (
                    <img
                      src={getProfilePictureUrl(buyerProfile.profilePicture) || "/placeholder.svg"}
                      alt={buyerProfile.fullName}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder on error
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <img
                      src="/placeholder.svg"
                      alt="User"
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                </button>
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  1
                </div>
              </div>
              <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 border-r border-gray-200 bg-white">
          <nav className="flex flex-col p-4">
            <Link href="/deals" className="mb-2 flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100">
              <Briefcase className="mr-3 h-5 w-5" />
              <span>All Deals</span>
            </Link>

            <Link
              href="/profile"
              className="mb-2 flex items-center rounded-md bg-teal-500 px-4 py-3 text-white hover:bg-teal-600"
            >
              <Eye className="mr-3 h-5 w-5" />
              <span>View Profile</span>
            </Link>

            <Link
              href="/acquireprofile"
              className="mb-2 flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Settings className="mr-3 h-5 w-5" />
              <span>Edit Company Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100 text-left w-full"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              <span className="ml-2 text-gray-600">Loading profile data...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">{error}</div>
          ) : (
            <>
              {/* Buyer Profile Section */}
              <div className="mb-8 flex">
                <div className="mr-8 relative">
                  {buyerProfile?.profilePicture ? (
                    <img
                      src={getProfilePictureUrl(buyerProfile.profilePicture) || "/placeholder.svg"}
                      alt={buyerProfile.fullName}
                      className="h-40 w-40 rounded-md object-cover"
                      onError={(e) => {
                        // Fallback to placeholder on error
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <img
                      src="/placeholder.svg"
                      alt="Profile"
                      className="h-40 w-40 rounded-md object-cover"
                    />
                  )}

                  {/* Upload button overlay */}
                  <button
                    onClick={triggerFileInput}
                    className="absolute bottom-2 right-2 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full shadow-md"
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </button>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <div>
                  <h2 className="mb-1 text-2xl font-bold">{buyerProfile?.fullName || "User"}</h2>
                  <p className="mb-4 text-sm text-gray-500">{buyerProfile?.role || "Buyer"}</p>

                  {/* <h3 className="mb-2 font-medium">Bio</h3> */}
                  <p className="mb-4 text-sm text-gray-600">
                    {/* Bio is not in the schema, so using a placeholder */}
                    Experienced buyer looking for opportunities
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{buyerProfile?.email || "Email not available"}</span>
                  </div>
                </div>
              </div>

              {/* Company Profile Section */}
              {companyProfile ? (
                <div className="mb-8 rounded-md border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-medium">Company Information</h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Company Name:</p>
                        <p>{companyProfile.companyName}</p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Industry:</p>
                        <p>
                          {companyProfile.targetCriteria.industrySectors.length > 0
                            ? companyProfile.targetCriteria.industrySectors.join(", ")
                            : "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Company Type:</p>
                        <p>{companyProfile.companyType}</p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Website:</p>
                        <p>{companyProfile.website}</p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Capital Entity:</p>
                        <p>{companyProfile.capitalEntity}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Deals Completed (Last 5 Years):</p>
                        <p>{companyProfile.dealsCompletedLast5Years || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Average Deal Size:</p>
                    <p>
                      {companyProfile.averageDealSize
                        ? formatCurrency(companyProfile.averageDealSize)
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-8 rounded-md border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-medium">Company Information</h3>
                  <p className="text-gray-500">No company profile found. Please complete your profile.</p>
                  <Link href="/acquireprofile">
                    <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md">
                      Create Company Profile
                    </button>
                  </Link>
                </div>
              )}

              {/* Contacts Section */}
              {companyProfile && companyProfile.contacts.length > 0 ? (
                <div className="rounded-md border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-medium">Contacts</h3>

                  <div className="space-y-4">
                    {companyProfile.contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Name:</p>
                            <p>{contact.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email:</p>
                            <p>{contact.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone:</p>
                            <p>{contact.phone}</p>
                          </div>
                        </div>
                        <button className="rounded-md bg-red-50 p-2 text-red-500 hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : companyProfile ? (
                <div className="rounded-md border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-medium">Contacts</h3>
                  <p className="text-gray-500">No contacts added yet.</p>
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>
      <Toaster />
    </div>
  )
}