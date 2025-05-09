"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Eye, LogOut, Settings, Briefcase, ChevronDown, Bell, Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"

interface Deal {
  id: string
  title: string
  status: "active" | "pending" | "passed"
  companyDescription: string
  industry: string
  geography: string
  yearsInBusiness: number
  trailingRevenue: number
  trailingEbitda: number
  averageGrowth: number
  netIncome: number
  askingPrice: number
  businessModel: string
  managementPreference: string
  sellerPhone: string
  sellerEmail: string
  documents?: Document[]
}

interface Document {
  id: string
  name: string
  url: string
}

// Add BuyerProfile interface after the Deal interface
interface BuyerProfile {
  _id: string
  fullName: string
  email: string
  companyName: string
  role: string
  profilePicture: string | null
}

export default function DealsPage() {
  // Update the useState for activeTab to also include a title state
  const [activeTab, setActiveTab] = useState("active")
  const [activeTitle, setActiveTitle] = useState("Active Deals")
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const [profileSubmitted, setProfileSubmitted] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [buyerId, setBuyerId] = useState<string | null>(null)

  // Add state for deal details modal
  const [dealDetailsOpen, setDealDetailsOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add buyerProfile state after the existing state declarations
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Replace the static deals array with a state variable
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: "1",
      title: "Tech Startup",
      status: "active",
      companyDescription: "Tech Startup Acquisition",
      industry: "Technology",
      geography: "North America",
      yearsInBusiness: 5,
      trailingRevenue: 100000,
      trailingEbitda: 100000,
      averageGrowth: 100000,
      netIncome: 100000,
      askingPrice: 100000,
      businessModel: "Project-Based",
      managementPreference: "Retiring to diversity",
      sellerPhone: "555-0199",
      sellerEmail: "Seller_Joe@gmail.com",
      documents: [
        {
          id: "doc1",
          name: "Doc Name.Doc",
          url: "#",
        },
      ],
    },
    {
      id: "2",
      title: "Technology",
      status: "pending",
      companyDescription: "Tech Startup Acquisition",
      industry: "Technology",
      geography: "North America",
      yearsInBusiness: 5,
      trailingRevenue: 100000,
      trailingEbitda: 100000,
      averageGrowth: 100000,
      netIncome: 100000,
      askingPrice: 100000,
      businessModel: "Project-Based",
      managementPreference: "Retiring to diversity",
      sellerPhone: "555-0199",
      sellerEmail: "Seller_Joe@gmail.com",
      documents: [],
    },
    {
      id: "3",
      title: "Deal Title",
      status: "pending",
      companyDescription: "Tech Startup Acquisition",
      industry: "Technology",
      geography: "North America",
      yearsInBusiness: 5,
      trailingRevenue: 100000,
      trailingEbitda: 100000,
      averageGrowth: 100000,
      netIncome: 100000,
      askingPrice: 100000,
      businessModel: "Project-Based",
      managementPreference: "Retiring to diversity",
      sellerPhone: "555-0199",
      sellerEmail: "Seller_Joe@gmail.com",
      documents: [],
    },
    {
      id: "4",
      title: "Deal Title",
      status: "passed",
      companyDescription: "Tech Startup Acquisition",
      industry: "Technology",
      geography: "North America",
      yearsInBusiness: 5,
      trailingRevenue: 100000,
      trailingEbitda: 100000,
      averageGrowth: 100000,
      netIncome: 100000,
      askingPrice: 100000,
      businessModel: "Project-Based",
      managementPreference: "Retiring to diversity",
      sellerPhone: "555-0199",
      sellerEmail: "Seller_Joe@gmail.com",
      documents: [],
    },
    {
      id: "5",
      title: "SaaS Platform Acquisition",
      status: "active",
      companyDescription: "Established SaaS platform with recurring revenue",
      industry: "Software",
      geography: "Europe",
      yearsInBusiness: 7,
      trailingRevenue: 250000,
      trailingEbitda: 120000,
      averageGrowth: 150000,
      netIncome: 80000,
      askingPrice: 750000,
      businessModel: "Subscription-Based",
      managementPreference: "Open to transition period",
      sellerPhone: "555-0200",
      sellerEmail: "seller@saasplatform.com",
      documents: [],
    },
    {
      id: "6",
      title: "E-commerce Business",
      status: "active",
      companyDescription: "Profitable e-commerce business in the fashion industry",
      industry: "Retail",
      geography: "North America",
      yearsInBusiness: 4,
      trailingRevenue: 500000,
      trailingEbitda: 150000,
      averageGrowth: 200000,
      netIncome: 120000,
      askingPrice: 600000,
      businessModel: "Direct-to-Consumer",
      managementPreference: "Willing to stay for 6 months",
      sellerPhone: "555-0201",
      sellerEmail: "fashion@ecommerce.com",
      documents: [],
    },
    {
      id: "7",
      title: "Digital Marketing Agency",
      status: "active",
      companyDescription: "Full-service digital marketing agency with blue-chip clients",
      industry: "Marketing",
      geography: "Asia Pacific",
      yearsInBusiness: 8,
      trailingRevenue: 1200000,
      trailingEbitda: 350000,
      averageGrowth: 300000,
      netIncome: 280000,
      askingPrice: 1500000,
      businessModel: "Agency",
      managementPreference: "Founder wants to exit completely",
      sellerPhone: "555-0202",
      sellerEmail: "founder@digitalagency.com",
      documents: [],
    },
    {
      id: "8",
      title: "Manufacturing Business",
      status: "active",
      companyDescription: "Established manufacturing business with proprietary technology",
      industry: "Manufacturing",
      geography: "Europe",
      yearsInBusiness: 12,
      trailingRevenue: 3500000,
      trailingEbitda: 800000,
      averageGrowth: 400000,
      netIncome: 650000,
      askingPrice: 4000000,
      businessModel: "B2B",
      managementPreference: "Management team will stay",
      sellerPhone: "555-0203",
      sellerEmail: "operations@manufacturing.com",
      documents: [],
    },
  ])

  // Check for token and userId on mount and from URL parameters
  useEffect(() => {
    // Set initial title based on activeTab
    setActiveTitle(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Deals`)

    // Check if coming from profile submission and if notification has been shown before
    if (searchParams?.get("profileSubmitted") === "true" && !localStorage.getItem("profileSubmissionNotified")) {
      setProfileSubmitted(true)
      // Set flag in localStorage to prevent showing the message again
      localStorage.setItem("profileSubmissionNotified", "true")

      toast({
        title: "Profile Submitted",
        description: "Your company profile has been successfully submitted.",
      })
    }

    // Get token and userId from URL parameters
    const urlToken = searchParams?.get("token")
    const urlUserId = searchParams?.get("userId")

    // Set token from URL or localStorage
    if (urlToken) {
      const cleanToken = urlToken.trim()
      localStorage.setItem("token", cleanToken)
      setAuthToken(cleanToken)
      console.log("Deals Dashboard - Token set from URL:", cleanToken.substring(0, 10) + "...")
    } else {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        const cleanToken = storedToken.trim()
        setAuthToken(cleanToken)
        console.log("Deals Dashboard - Token set from localStorage:", cleanToken.substring(0, 10) + "...")
      } else {
        console.warn("Deals Dashboard - No token found, redirecting to login")
        router.push("/login")
        return
      }
    }

    // Set userId from URL or localStorage
    if (urlUserId) {
      const cleanUserId = urlUserId.trim()
      localStorage.setItem("userId", cleanUserId)
      setBuyerId(cleanUserId)
      console.log("Deals Dashboard - Buyer ID set from URL:", cleanUserId)
    } else {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        const cleanUserId = storedUserId.trim()
        setBuyerId(cleanUserId)
        console.log("Deals Dashboard - Buyer ID set from localStorage:", cleanUserId)
      }
    }

    // Check if profile has been submitted
    checkProfileSubmission()
  }, [searchParams, router, activeTab])

  // Check if user has submitted a profile
  const checkProfileSubmission = async () => {
    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        console.warn("Deals Dashboard - Missing token or userId for profile check")
        return
      }

      // Get API URL from localStorage or use default
      const apiUrl = localStorage.getItem("apiUrl") || "https://cim-amp.onrender.com"

      // Make API call to check if profile exists
      // Use the endpoint you have available - adjust this to match your API
      const response = await fetch(`${apiUrl}/company-profiles/check`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((error) => {
        console.log("Deals Dashboard - Profile check error:", error)
        return null
      })

      // If API call fails, don't redirect (API might not support this endpoint)
      if (!response || !response.ok) {
        console.log("Deals Dashboard - Profile check failed or not supported")
        return
      }

      const data = await response.json()

      // If profile doesn't exist, redirect to profile page
      // Adjust this condition based on your API response structure
      if (data && (data.exists === false || data.profileExists === false)) {
        console.log("Deals Dashboard - No profile found, redirecting to profile page")
        router.push("/acquireprofile")
      }
    } catch (error) {
      console.error("Deals Dashboard - Error checking profile:", error)
    }
  }

  // Add this function after the checkProfileSubmission function
  const fetchBuyerProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.warn("Deals Dashboard - Missing token for profile fetch")
        return
      }

      // Get API URL from localStorage or use default
      const apiUrl = localStorage.getItem("apiUrl") || "https://cim-amp.onrender.com"

      // Fetch buyer profile
      const response = await fetch(`${apiUrl}/buyers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          router.push("/login?session=expired")
          return
        }
        throw new Error(`Failed to fetch buyer profile: ${response.status}`)
      }

      const data = await response.json()
      setBuyerProfile(data)
      console.log("Deals Dashboard - Buyer profile fetched:", data)
    } catch (error) {
      console.error("Error fetching buyer profile:", error)
    }
  }

  // Add this function to handle passing a deal
  const handlePassDeal = (dealId: string) => {
    setDeals((prevDeals) => prevDeals.map((deal) => (deal.id === dealId ? { ...deal, status: "passed" } : deal)))

    toast({
      title: "Deal Passed",
      description: "The deal has been moved to the passed section.",
    })

    // Close the deal details modal if it's open
    setDealDetailsOpen(false)
  }

  // Add this function to handle opening the deal details modal
  const handleViewDealDetails = (deal: Deal) => {
    // Only show details popup for active deals
    if (deal.status === "active") {
      setSelectedDeal(deal)
      setDealDetailsOpen(true)
    } else {
      // For pending and passed deals, go directly to CIM
      handleGoToCIM(deal.id)
    }
  }

  // Add a new function to handle the View CIM button click
  const handleViewCIMClick = (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation() // Prevent the card click event

    if (deal.status === "active") {
      // For active deals, show the deal details popup
      handleViewDealDetails(deal)
    } else {
      // For pending and passed deals, go to CIM
      handleGoToCIM(deal.id)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setActiveTitle(`${tab.charAt(0).toUpperCase() + tab.slice(1)} Deals`)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const filteredDeals = deals.filter((deal) => {
    // First filter by tab status
    if (deal.status !== activeTab) return false

    // Then filter by search query if one exists
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      return (
        deal.title.toLowerCase().includes(query) ||
        deal.companyDescription.toLowerCase().includes(query) ||
        deal.industry.toLowerCase().includes(query) ||
        deal.geography.toLowerCase().includes(query) ||
        deal.businessModel.toLowerCase().includes(query)
      )
    }

    return true
  })

  const handleGoToCIM = (dealId: string) => {
    setSelectedDealId(dealId)
    setTermsModalOpen(true)
  }

  const handleApproveTerms = () => {
    setTermsModalOpen(false)

    // Move the deal to active status if it's not already active
    if (selectedDealId) {
      setDeals((prevDeals) =>
        prevDeals.map((deal) => (deal.id === selectedDealId ? { ...deal, status: "active" } : deal)),
      )

      // Show success toast
      toast({
        title: "Deal Approved",
        description: "The deal has been moved to the active section.",
      })

      // Switch to active tab to show the deal
      setActiveTab("active")
      setActiveTitle("Active Deals")
    }

    console.log(`Approved terms for deal ${selectedDealId}`)
  }

  const handleLogout = () => {
    console.log("Deals Dashboard - Logging out")
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/login")
  }

  // Function to handle document upload
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedDeal) return

    const file = event.target.files[0]
    setUploadingDocument(true)

    // Simulate upload process
    setTimeout(() => {
      // Add the document to the selected deal
      const newDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        url: "#",
      }

      // Update the deals state with the new document
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === selectedDeal.id
            ? {
                ...deal,
                documents: [...(deal.documents || []), newDocument],
              }
            : deal,
        ),
      )

      // Update the selected deal state
      setSelectedDeal((prevDeal) => {
        if (!prevDeal) return null
        return {
          ...prevDeal,
          documents: [...(prevDeal.documents || []), newDocument],
        }
      })

      setUploadingDocument(false)

      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    }, 1500)
  }

  // Function to handle document deletion
  const handleDeleteDocument = (documentId: string) => {
    if (!selectedDeal) return

    // Update the deals state by removing the document
    setDeals((prevDeals) =>
      prevDeals.map((deal) =>
        deal.id === selectedDeal.id
          ? {
              ...deal,
              documents: (deal.documents || []).filter((doc) => doc.id !== documentId),
            }
          : deal,
      ),
    )

    // Update the selected deal state
    setSelectedDeal((prevDeal) => {
      if (!prevDeal) return null
      return {
        ...prevDeal,
        documents: (prevDeal.documents || []).filter((doc) => doc.id !== documentId),
      }
    })

    toast({
      title: "Document Deleted",
      description: "The document has been removed.",
    })
  }

  // Function to get the complete profile picture URL
  const getProfilePictureUrl = (path: string | null) => {
    if (!path) return null

    const apiUrl = localStorage.getItem("apiUrl") || "https://cim-amp.onrender.com"

    // If the path already has http/https, return it as is
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path
    }

    // Replace backslashes with forward slashes for URL compatibility
    const formattedPath = path.replace(/\\/g, "/")

    // Check if path already starts with a slash
    return `${apiUrl}/${formattedPath.startsWith("/") ? formattedPath.substring(1) : formattedPath}`
  }

  // Helper function to get status indicator color
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span>Active</span>
          </div>
        )
      case "pending":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
            <span>Pending</span>
          </div>
        )
      case "passed":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
            <span>Passed</span>
          </div>
        )
      default:
        return null
    }
  }

  // Helper function to count deals by status
  const countDealsByStatus = (status: string) => {
    return deals.filter((deal) => deal.status === status).length
  }

  // Add this to the useEffect after checkProfileSubmission()
  useEffect(() => {
    // Check if profile has been submitted
    checkProfileSubmission()

    // Fetch buyer profile
    fetchBuyerProfile()
  }, [searchParams, router, activeTab])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}

      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-10 pt-3 pb-1">
            <Link href="/deals">
              <div className="flex items-center">
                <img src="/logo.svg" alt="CIM Amplify" className="h-10" />
              </div>
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">{activeTitle}</h1>
            <div className="relative mx-4 ">
              <div className="flex items-center rounded-xl bg-[#3AAFA914] px-3 py-4 ">
                <Search className="ml-2  text-[#3AAFA9] mr-3 font-bold" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  className="bg-transparent text-sm focus:outline-none w-72 "
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                2
              </div>
            </div>

            <div className="flex items-center">
              <div className="mr-2 text-right">
                <div className="text-sm font-medium">{buyerProfile?.fullName || "User"}</div>
                <div className="text-xs text-gray-500">{buyerProfile?.companyName || "Company"}</div>
              </div>
              <div className="relative">
                {buyerProfile?.profilePicture ? (
                  <img
                    src={getProfilePictureUrl(buyerProfile.profilePicture) || "/placeholder.svg"}
                    alt={buyerProfile.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder on error
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">{buyerProfile?.fullName?.charAt(0) || "U"}</span>
                  </div>
                )}
              </div>
             
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {/* Update the sidebar styling to match the new design */}
        <aside className="w-56 border-r border-gray-200 bg-white">
          <nav className="flex flex-col p-4">
            <Link
              href="/deals"
              className="mb-2 flex items-center rounded-md bg-teal-500 px-4 py-3 text-white hover:bg-teal-600"
            >
              <Briefcase className="mr-3 h-5 w-5" />
              <span>All Deals</span>
            </Link>

            <Link
              href="/company-profile"
              className="mb-2 flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Eye className="mr-3 h-5 w-5" />
              <span>Company Profile</span>
            </Link>

            {/* <Link
              href="/deals"
              className="mb-2 flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </Link> */}

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
          {profileSubmitted && (
            <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Your company profile has been successfully submitted!</p>
                </div>
              </div>
            </div>
          )}

          {/* Debug information in development mode */}
          {process.env.NODE_ENV === "development" && (
            <div className=" hidden mb-6 rounded-md bg-gray-100 p-4 text-sm border border-gray-300">
              <h3 className="font-medium mb-2">Debug Information</h3>
              <div className="space-y-1">
                <p>
                  <strong>Token:</strong> {authToken ? `${authToken.substring(0, 10)}...` : "Not set"}
                </p>
                <p>
                  <strong>Buyer ID:</strong> {buyerId || "Not set"}
                </p>
              </div>
            </div>
          )}

          {/* Update the Tabs component to use the handleTabChange function */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6 gap-2">
            <TabsList className="bg-white space-x-4">
              <TabsTrigger
                value="active"
                className={`relative ${
                  activeTab === "active" ? "bg-[#3AAFA9] text-white" : "bg-gray-200 text-gray-700"
                } hover:bg-[#3AAFA9] hover:text-white px-6 py-2 rounded-md`}
              >
                Active ({countDealsByStatus("active")})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className={`relative ${
                  activeTab === "pending" ? "bg-[#3AAFA9] text-white" : "bg-gray-200 text-gray-700"
                } hover:bg-[#3AAFA9] hover:text-white px-6 py-2 rounded-md`}
              >
                Pending ({countDealsByStatus("pending")})
              </TabsTrigger>
              <TabsTrigger
                value="passed"
                className={`relative ${
                  activeTab === "passed" ? "bg-[#3AAFA9] text-white" : "bg-gray-200 text-gray-700"
                } hover:bg-[#3AAFA9] hover:text-white px-6 py-2 rounded-md`}
              >
                Passed ({countDealsByStatus("passed")})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Update the deal cards to match the new design */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewDealDetails(deal)}
              >
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-teal-500">{deal.title}</h3>
                  {/* Status badges removed as requested */}
                </div>

                <div className="p-4">
                  <h4 className="mb-2 font-medium text-gray-800">Overview</h4>
                  <div className="mb-4 space-y-1 text-sm text-gray-600">
                    <p>Company Description: {deal.companyDescription}</p>
                    <p>Industry: {deal.industry}</p>
                    <p>Geography: {deal.geography}</p>
                    <p>Number of Years in Business: {deal.yearsInBusiness}</p>
                  </div>

                  <h4 className="mb-2 font-medium text-gray-800">Financial</h4>
                  <div className="mb-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>Trailing 12-Month Revenue: ${deal.trailingRevenue.toLocaleString()}</p>
                    <p>Trailing 12-Month EBITDA: ${deal.trailingEbitda.toLocaleString()}</p>
                    <p>Average 3-YEAR REVENUE GROWTH IN $: ${deal.averageGrowth.toLocaleString()}</p>
                    <p>Net Income: ${deal.netIncome.toLocaleString()}</p>
                    <p>Asking Price: ${deal.askingPrice.toLocaleString()}</p>
                    <p>Business Mode: {deal.businessModel}</p>
                    <p>Management Future Preferences: {deal.managementPreference}</p>
                  </div>

                  <h4 className="mb-2 font-medium text-gray-800">Seller Contact Information</h4>
                  <div className="mb-4 space-y-1 text-sm text-gray-600">
                    <p>Phone Number: {deal.sellerPhone}</p>
                    <p>Email: {deal.sellerEmail}</p>
                  </div>

                  <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button onClick={(e) => handleViewCIMClick(e, deal)} className="bg-teal-500 hover:bg-teal-600">
                      {deal.status === "active" ? "View CIM" : "Go to CIM"}
                    </Button>
                    {deal.status !== "passed" && (
                      <Button
                        variant="outline"
                        className="border-red-200 bg-[#E3515333] text-red-500 hover:bg-red-50"
                        onClick={() => handlePassDeal(deal.id)}
                      >
                        Pass
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Terms of Access Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Terms of Access</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-gray-600">
            By clicking "Approve" you reaffirm your previous acceptance of the STRAIGHT TO CIM MASTER NON-DISCLOSURE AGREEMENT and the CIM AMPLIFY MASTER FEE AGREEMENT.
            </p>
            <p className="text-sm text-gray-600">
              Once you approve, the seller will be notified and can contact you directly.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setTermsModalOpen(false)}>
              Go Back
            </Button>
            <Button onClick={handleApproveTerms} className="bg-teal-500 hover:bg-teal-600">
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deal Details Modal - Updated to be smaller and more responsive */}
      <Dialog open={dealDetailsOpen} onOpenChange={setDealDetailsOpen}>
        <DialogContent className="w-[523px] h-[583px] fixed  border-[0.5px] rounded-[6px] p-0 overflow-hidden overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-center text-teal-500 text-xl">Deal Details</DialogTitle>
            </DialogHeader>

            {selectedDeal && (
              <div className="py-4">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Overview</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Deal Title:</span> {selectedDeal.title}
                    </p>
                    <p>
                      <span className="font-medium">Company Description:</span> {selectedDeal.companyDescription}
                    </p>
                    <p>
                      <span className="font-medium">Industry:</span> {selectedDeal.industry}
                    </p>
                    <p>
                      <span className="font-medium">Geography:</span> {selectedDeal.geography}
                    </p>
                    <p>
                      <span className="font-medium">Number of Years in Business:</span> {selectedDeal.yearsInBusiness}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Financial</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <span className="font-medium">Trailing 12-Month Revenue:</span> $
                      {selectedDeal.trailingRevenue.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Trailing 12-Month EBITDA:</span> $
                      {selectedDeal.trailingEbitda.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Average 3-YEAR REVENUE GROWTH IN $:</span> $
                      {selectedDeal.averageGrowth.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Net Income:</span> ${selectedDeal.netIncome.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Asking Price:</span> ${selectedDeal.askingPrice.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Business Model:</span> {selectedDeal.businessModel}
                    </p>
                    <p className="col-span-2">
                      <span className="font-medium">Management Future Preferences:</span>{" "}
                      {selectedDeal.managementPreference}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Seller Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Phone Number:</span> {selectedDeal.sellerPhone}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedDeal.sellerEmail}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Documents</h3>
                  <div className="border border-dashed border-[#3AAFA9] rounded-md p-4">
                    {selectedDeal.documents && selectedDeal.documents.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDeal.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">{doc.name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4 text-[#3AAFA9]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No documents uploaded yet</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <input type="file" ref={fileInputRef} onChange={handleDocumentUpload} className="hidden" />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full flex items-center justify-center"
                        disabled={uploadingDocument}
                      >
                        {uploadingDocument ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500 mr-2"></div>
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            <span>Upload Document</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4 p-4 mt-auto border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setDealDetailsOpen(false)}
              className="border-[#3AAFA9] px-8 py-2 rounded-md bg-[#3AAFA91A] text-[#3AAFA9] hover:text-[#3AAFA9]"
            >
              Close
            </Button>
            {selectedDeal && selectedDeal.status !== "passed" && (
              <Button
                variant="outline"
                className="border-red-200 text-red-500 hover:bg-red-50 px-8 py-2 hover:text-red-500 rounded-md bg-[#E3515333]"
                onClick={() => {
                  if (selectedDeal) {
                    handlePassDeal(selectedDeal.id)
                  }
                }}
              >
                Pass
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
