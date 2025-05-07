"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { CompanyProfile } from "@/types/company-profile"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Search, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, LogOut, Settings, Briefcase, Eye, Bell } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

import { getGeoData, type GeoData, type Continent, type Region, type SubRegion } from "@/lib/geography-data"
import {
  getIndustryData,
  type IndustryData,
  type Sector,
  type IndustryGroup,
  type Industry,
  type SubIndustry,
} from "@/lib/industry-data"

const COMPANY_TYPES = [
  "Private Equity",
  "Holding Company",
  "Family Office",
  "Independent Sponsor",
  "Entrepreneurship through Acquisition",
  "Single Acquisition Search",
  "Strategic Operating Company",
  "Buy Side Mandate",
]

const CAPITAL_ENTITIES = ["Fund", "Holding Company", "SPV", "Direct Investment"]

const BUSINESS_MODELS = ["Recurring Revenue", "Project-Based", "Asset Light", "Asset Heavy"]

const MANAGEMENT_PREFERENCES = ["Owner(s) Departing", "Owner(s) Staying", "Management Team Staying", "No Preference"]

// Default API URL
const DEFAULT_API_URL = "https://cim-amp.onrender.com"

// Type for hierarchical selection
interface HierarchicalSelection {
  continents: Record<string, boolean>
  regions: Record<string, boolean>
  subRegions: Record<string, boolean>
}

interface IndustrySelection {
  sectors: Record<string, boolean>
  industryGroups: Record<string, boolean>
  industries: Record<string, boolean>
  subIndustries: Record<string, boolean>
}

// Store selected management preferences separately from the form data
// to avoid TypeScript errors with the CompanyProfile type
interface ExtendedFormState {
  selectedManagementPreferences: string[]
}

// Add BuyerProfile interface
interface BuyerProfile {
  _id: string
  fullName: string
  email: string
  companyName: string
  role: string
  profilePicture: string | null
}

export default function CompanyProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // API configuration
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)

  // Authentication state
  const [authToken, setAuthToken] = useState("")
  const [buyerId, setBuyerId] = useState("")

  const [geoData, setGeoData] = useState<GeoData | null>(null)
  const [industryData, setIndustryData] = useState<IndustryData | null>(null)

  // Add buyerProfile state
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null)

  // Hierarchical selection state
  const [geoSelection, setGeoSelection] = useState<HierarchicalSelection>({
    continents: {},
    regions: {},
    subRegions: {},
  })

  const [industrySelection, setIndustrySelection] = useState<IndustrySelection>({
    sectors: {},
    industryGroups: {},
    industries: {},
    subIndustries: {},
  })

  // UI state for expanded sections
  const [expandedContinents, setExpandedContinents] = useState<Record<string, boolean>>({})
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({})
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({})
  const [expandedIndustryGroups, setExpandedIndustryGroups] = useState<Record<string, boolean>>({})
  const [expandedIndustries, setExpandedIndustries] = useState<Record<string, boolean>>({})

  // Search terms
  const [countrySearchTerm, setCountrySearchTerm] = useState("")
  const [industrySearchTerm, setIndustrySearchTerm] = useState("")

  // Available currencies
  const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"]

  // Extended form state for fields not in the CompanyProfile type
  const [extendedFormState, setExtendedFormState] = useState<ExtendedFormState>({
    selectedManagementPreferences: [],
  })

  // Format number with commas
  const formatNumberWithCommas = (value: number | undefined) => {
    if (value === undefined) return ""
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Check for token on mount and from URL parameters
  useEffect(() => {
    // Get token and userId from URL parameters
    const urlToken = searchParams?.get("token")
    const urlUserId = searchParams?.get("userId")

    // Set token from URL or localStorage
    if (urlToken) {
      // Make sure to trim any whitespace
      const cleanToken = urlToken.trim()
      localStorage.setItem("token", cleanToken)
      setAuthToken(cleanToken)
      console.log("Company Profile - Token set from URL:", cleanToken.substring(0, 10) + "...")
    } else {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        const cleanToken = storedToken.trim()
        setAuthToken(cleanToken)
        console.log("Company Profile - Token set from localStorage:", cleanToken.substring(0, 10) + "...")
      } else {
        console.warn("Company Profile - No token found, redirecting to login")
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }
    }

    // Set userId from URL or localStorage
    if (urlUserId) {
      const cleanUserId = urlUserId.trim()
      localStorage.setItem("userId", cleanUserId)
      setBuyerId(cleanUserId)
      console.log("Company Profile - Buyer ID set from URL:", cleanUserId)
    } else {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        const cleanUserId = storedUserId.trim()
        setBuyerId(cleanUserId)
        console.log("Company Profile - Buyer ID set from localStorage:", cleanUserId)
      }
    }

    // Set API URL from localStorage or use default
    const storedApiUrl = localStorage.getItem("apiUrl")
    if (storedApiUrl) {
      setApiUrl(storedApiUrl)
    }

    // Simple token check - no API call needed
    const token = localStorage.getItem("token")
    if (!token) {
      console.warn("Company Profile - No token found, redirecting to login")
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }
  }, [searchParams, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch geography data
        const geo = await getGeoData()
        setGeoData(geo)

        // Fetch industry data
        const industry = await getIndustryData()
        setIndustryData(industry)

        // After loading the reference data, fetch the user's profile
        if (authToken) {
          await fetchUserProfile()
          await fetchBuyerProfile()
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Data Loading Error",
          description: "Failed to load geography and industry data.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [authToken])

  // Fetch user's existing profile data
  const fetchUserProfile = async () => {
    if (!authToken) return

    try {
      setIsSubmitting(true)

      const response = await fetch(`${apiUrl}/company-profiles/my-profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // No profile exists yet, that's okay
          console.log("No existing profile found, showing empty form")
          return
        }

        // Handle other errors
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const profileData = await response.json()
      console.log("Existing profile loaded:", profileData)

      // Update form data with the fetched profile
      if (profileData) {
        // Ensure all required fields exist in the profile data
        const updatedProfile = {
          ...formData,
          ...profileData,
          // Ensure nested objects are properly merged
          preferences: {
            ...formData.preferences,
            ...(profileData.preferences || {}),
          },
          targetCriteria: {
            ...formData.targetCriteria,
            ...(profileData.targetCriteria || {}),
          },
          agreements: {
            ...formData.agreements,
            ...(profileData.agreements || {}),
          },
          // Ensure selectedCurrency is set
          selectedCurrency: profileData.selectedCurrency || "USD",
          // Ensure capitalAvailability is set
          capitalAvailability: profileData.capitalAvailability || "need_to_raise",
        }

        setFormData(updatedProfile)

        // Update geography selections
        if (profileData.targetCriteria?.countries?.length > 0 && geoData) {
          const newGeoSelection = { ...geoSelection }

          // Mark selected countries in the hierarchical selection
          geoData.continents.forEach((continent) => {
            if (profileData.targetCriteria.countries.includes(continent.name)) {
              newGeoSelection.continents[continent.id] = true
            }

            continent.regions.forEach((region) => {
              if (profileData.targetCriteria.countries.includes(region.name)) {
                newGeoSelection.regions[region.id] = true
              }

              if (region.subRegions) {
                region.subRegions.forEach((subRegion) => {
                  if (profileData.targetCriteria.countries.includes(subRegion.name)) {
                    newGeoSelection.subRegions[subRegion.id] = true
                  }
                })
              }
            })
          })

          setGeoSelection(newGeoSelection)
        }

        // Update industry selections
        if (profileData.targetCriteria?.industrySectors?.length > 0 && industryData) {
          const newIndustrySelection = { ...industrySelection }

          // Mark selected industries in the hierarchical selection
          industryData.sectors.forEach((sector) => {
            if (profileData.targetCriteria.industrySectors.includes(sector.name)) {
              newIndustrySelection.sectors[sector.id] = true
            }

            sector.industryGroups.forEach((group) => {
              if (profileData.targetCriteria.industrySectors.includes(group.name)) {
                newIndustrySelection.industryGroups[group.id] = true
              }

              group.industries.forEach((industry) => {
                if (profileData.targetCriteria.industrySectors.includes(industry.name)) {
                  newIndustrySelection.industries[industry.id] = true
                }

                industry.subIndustries.forEach((subIndustry) => {
                  if (profileData.targetCriteria.industrySectors.includes(subIndustry.name)) {
                    newIndustrySelection.subIndustries[subIndustry.id] = true
                  }
                })
              })
            })
          })

          setIndustrySelection(newIndustrySelection)
        }

        // Update management preferences
        if (profileData.targetCriteria?.managementTeamPreference) {
          // Convert from string to array for the UI state
          setExtendedFormState({
            ...extendedFormState,
            selectedManagementPreferences: [profileData.targetCriteria.managementTeamPreference],
          })
        }

        toast({
          title: "Profile Loaded",
          description: "Your existing profile has been loaded.",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error Loading Profile",
        description: "Failed to load your existing profile. Starting with a new form.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch buyer profile
  const fetchBuyerProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.warn("Company Profile - Missing token for profile fetch")
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
      console.log("Company Profile - Buyer profile fetched:", data)
    } catch (error) {
      console.error("Error fetching buyer profile:", error)
    }
  }

  // Form state
  const [formData, setFormData] = useState<CompanyProfile & { selectedCurrency: string; capitalAvailability: string }>({
    companyName: "",
    website: "",
    contacts: [{ name: "", email: "", phone: "" }],
    companyType: "",
    capitalEntity: "",
    dealsCompletedLast5Years: undefined,
    averageDealSize: undefined,
    preferences: {
      stopSendingDeals: false,
      dontShowMyDeals: false,
      dontSendDealsToMyCompetitors: false,
      allowBuyerLikeDeals: false,
    },
    targetCriteria: {
      countries: [],
      industrySectors: [],
      revenueMin: undefined,
      revenueMax: undefined,
      ebitdaMin: undefined,
      ebitdaMax: undefined,
      transactionSizeMin: undefined,
      transactionSizeMax: undefined,
      minStakePercent: undefined,
      minYearsInBusiness: undefined,
      preferredBusinessModels: [],
      managementTeamPreference: "", // Changed from array to empty string
      description: "",
    },
    agreements: {
      termsAndConditionsAccepted: false,
      ndaAccepted: false,
      feeAgreementAccepted: false,
    },
    selectedCurrency: "USD",
    capitalAvailability: "need_to_raise", // Default to "need_to_raise"
  })

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle nested field changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CompanyProfile],
        [field]: value,
      },
    }))
  }

  // Handle contact changes
  const handleContactChange = (index: number, field: string, value: string) => {
    const updatedContacts = [...formData.contacts]
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value,
    }
    handleChange("contacts", updatedContacts)
  }

  // Add new contact
  const addContact = () => {
    if (formData.contacts.length < 3) {
      handleChange("contacts", [...formData.contacts, { name: "", email: "", phone: "" }])
    } else {
      toast({
        title: "Maximum contacts reached",
        description: "You can only add up to 3 contacts.",
        variant: "destructive",
      })
    }
  }

  // Remove contact
  const removeContact = (index: number) => {
    const updatedContacts = formData.contacts.filter((_, i) => i !== index)
    handleChange("contacts", updatedContacts)
  }

  // Toggle business model selection
  const toggleBusinessModel = (model: string) => {
    const currentModels = formData.targetCriteria.preferredBusinessModels
    if (currentModels.includes(model)) {
      handleNestedChange(
        "targetCriteria",
        "preferredBusinessModels",
        currentModels.filter((m) => m !== model),
      )
    } else {
      handleNestedChange("targetCriteria", "preferredBusinessModels", [...currentModels, model])
    }
  }

  // Toggle management preference selection
  const toggleManagementPreference = (preference: string) => {
    const currentPreferences = [...extendedFormState.selectedManagementPreferences]
    const preferenceIndex = currentPreferences.indexOf(preference)

    if (preferenceIndex >= 0) {
      // Remove preference if already selected
      currentPreferences.splice(preferenceIndex, 1)
    } else {
      // Add preference if not selected
      currentPreferences.push(preference)
    }

    setExtendedFormState({
      ...extendedFormState,
      selectedManagementPreferences: currentPreferences,
    })

    // Update the managementTeamPreference in the form data
    // Use the first selected preference or empty string
    handleNestedChange(
      "targetCriteria",
      "managementTeamPreference",
      currentPreferences.length > 0 ? currentPreferences[0] : "",
    )
  }

  // Geography selection handlers
  const toggleContinent = (continent: Continent) => {
    const newGeoSelection = { ...geoSelection }
    const isSelected = !geoSelection.continents[continent.id]

    // Update continent selection
    newGeoSelection.continents[continent.id] = isSelected

    // Update all regions in this continent
    continent.regions.forEach((region) => {
      newGeoSelection.regions[region.id] = isSelected

      // Update all subregions in this region
      if (region.subRegions) {
        region.subRegions.forEach((subRegion) => {
          newGeoSelection.subRegions[subRegion.id] = isSelected
        })
      }
    })

    setGeoSelection(newGeoSelection)
    updateCountriesInFormData(newGeoSelection)
  }

  const toggleRegion = (region: Region, continent: Continent) => {
    const newGeoSelection = { ...geoSelection }
    const isSelected = !geoSelection.regions[region.id]

    // Update region selection
    newGeoSelection.regions[region.id] = isSelected

    // Update all subregions in this region
    if (region.subRegions) {
      region.subRegions.forEach((subRegion) => {
        newGeoSelection.subRegions[subRegion.id] = isSelected
      })
    }

    // Check if all regions in the continent are selected/deselected
    const allRegionsSelected = continent.regions.every((r) =>
      r.id === region.id ? isSelected : newGeoSelection.regions[r.id],
    )

    const allRegionsDeselected = continent.regions.every((r) =>
      r.id === region.id ? !isSelected : !newGeoSelection.regions[r.id],
    )

    // Update continent selection based on regions
    if (allRegionsSelected) {
      newGeoSelection.continents[continent.id] = true
    } else if (allRegionsDeselected) {
      newGeoSelection.continents[continent.id] = false
    }

    setGeoSelection(newGeoSelection)
    updateCountriesInFormData(newGeoSelection)
  }

  const toggleSubRegion = (subRegion: SubRegion, region: Region, continent: Continent) => {
    const newGeoSelection = { ...geoSelection }
    const isSelected = !geoSelection.subRegions[subRegion.id]

    // Update only the subregion selection
    newGeoSelection.subRegions[subRegion.id] = isSelected

    // Update parent region selection based on all subregions
    const allSubRegionsSelected = region.subRegions?.every((sr) =>
      sr.id === subRegion.id ? isSelected : newGeoSelection.subRegions[sr.id],
    )

    // Only mark region as selected if ALL subregions are selected
    if (allSubRegionsSelected) {
      newGeoSelection.regions[region.id] = true
    } else {
      // If any subregion is deselected, the region is not fully selected
      newGeoSelection.regions[region.id] = false
    }

    // Update continent selection based on all regions
    const allRegionsSelected = continent.regions.every((r) => newGeoSelection.regions[r.id])

    // Only mark continent as selected if ALL regions are selected
    if (allRegionsSelected) {
      newGeoSelection.continents[continent.id] = true
    } else {
      newGeoSelection.continents[continent.id] = false
    }

    setGeoSelection(newGeoSelection)
    updateCountriesInFormData(newGeoSelection)
  }

  // Update the countries array in formData based on the hierarchical selection
  const updateCountriesInFormData = (selection: HierarchicalSelection) => {
    if (!geoData) return

    const selectedCountries: string[] = []
    const selectedContinentIds = new Set()
    const selectedRegionIds = new Set()

    // First, collect all selected continent and region IDs
    geoData.continents.forEach((continent) => {
      if (selection.continents[continent.id]) {
        selectedContinentIds.add(continent.id)
      }

      continent.regions.forEach((region) => {
        if (selection.regions[region.id]) {
          selectedRegionIds.add(region.id)
        }
      })
    })

    // Then add only the highest level selections
    geoData.continents.forEach((continent) => {
      // Add continent if selected
      if (selection.continents[continent.id]) {
        selectedCountries.push(continent.name)
      } else {
        // If continent is not selected, check its regions
        continent.regions.forEach((region) => {
          // Add region if selected and its parent continent is not selected
          if (selection.regions[region.id] && !selectedContinentIds.has(continent.id)) {
            selectedCountries.push(region.name)
          } else if (!selection.regions[region.id] && !selectedContinentIds.has(continent.id)) {
            // If region is not selected, check its subregions
            if (region.subRegions) {
              region.subRegions.forEach((subRegion) => {
                // Add subregion if selected and neither its parent region nor continent is selected
                if (
                  selection.subRegions[subRegion.id] &&
                  !selectedRegionIds.has(region.id) &&
                  !selectedContinentIds.has(continent.id)
                ) {
                  selectedCountries.push(subRegion.name)
                }
              })
            }
          }
        })
      }
    })

    handleNestedChange("targetCriteria", "countries", selectedCountries)
  }

  const removeCountry = (countryToRemove: string) => {
    if (!geoData) return

    const newGeoSelection = { ...geoSelection }

    // Find and unselect the region that matches this country
    geoData.continents.forEach((continent) => {
      if (continent.name === countryToRemove) {
        newGeoSelection.continents[continent.id] = false
      }

      continent.regions.forEach((region) => {
        if (region.name === countryToRemove) {
          newGeoSelection.regions[region.id] = false
        }

        // Check subregions
        if (region.subRegions) {
          region.subRegions.forEach((subRegion) => {
            if (subRegion.name === countryToRemove) {
              newGeoSelection.subRegions[subRegion.id] = false
            }
          })
        }
      })
    })

    setGeoSelection(newGeoSelection)
    updateCountriesInFormData(newGeoSelection)
  }

  // Industry selection handlers
  // Let's also update the industry selection functions to cascade selections

  // Update the toggleSector function to select all children when a sector is selected
  const toggleSector = (sector: Sector) => {
    const newIndustrySelection = { ...industrySelection }
    const isSelected = !industrySelection.sectors[sector.id]

    // Update sector selection
    newIndustrySelection.sectors[sector.id] = isSelected

    // Update all industry groups in this sector
    sector.industryGroups.forEach((group) => {
      newIndustrySelection.industryGroups[group.id] = isSelected

      // Update all industries in this group
      group.industries.forEach((industry) => {
        newIndustrySelection.industries[industry.id] = isSelected

        // Update all subindustries in this industry
        industry.subIndustries.forEach((subIndustry) => {
          newIndustrySelection.subIndustries[subIndustry.id] = isSelected
        })
      })
    })

    setIndustrySelection(newIndustrySelection)
    updateIndustriesInFormData(newIndustrySelection)
  }

  // Update the toggleIndustryGroup function to select all children when a group is selected
  const toggleIndustryGroup = (group: IndustryGroup, sector: Sector) => {
    const newIndustrySelection = { ...industrySelection }
    const isSelected = !industrySelection.industryGroups[group.id]

    // Update industry group selection
    newIndustrySelection.industryGroups[group.id] = isSelected

    // Update all industries in this group
    group.industries.forEach((industry) => {
      newIndustrySelection.industries[industry.id] = isSelected

      // Update all subindustries in this industry
      industry.subIndustries.forEach((subIndustry) => {
        newIndustrySelection.subIndustries[subIndustry.id] = isSelected
      })
    })

    // Check if all groups in the sector are selected/deselected
    const allGroupsSelected = sector.industryGroups.every((g) =>
      g.id === group.id ? isSelected : newIndustrySelection.industryGroups[g.id],
    )

    const allGroupsDeselected = sector.industryGroups.every((g) =>
      g.id === group.id ? !isSelected : !newIndustrySelection.industryGroups[g.id],
    )

    // Update sector selection based on groups
    if (allGroupsSelected) {
      newIndustrySelection.sectors[sector.id] = true
    } else if (allGroupsDeselected) {
      newIndustrySelection.sectors[sector.id] = false
    }

    setIndustrySelection(newIndustrySelection)
    updateIndustriesInFormData(newIndustrySelection)
  }

  // Update the toggleIndustry function to select all children when an industry is selected
  const toggleIndustry = (industry: Industry, group: IndustryGroup, sector: Sector) => {
    const newIndustrySelection = { ...industrySelection }
    const isSelected = !industrySelection.industries[industry.id]

    // Update industry selection
    newIndustrySelection.industries[industry.id] = isSelected

    // Update all subindustries in this industry
    industry.subIndustries.forEach((subIndustry) => {
      newIndustrySelection.subIndustries[subIndustry.id] = isSelected
    })

    // Check if all industries in the group are selected/deselected
    const allIndustriesSelected = group.industries.every((i) =>
      i.id === industry.id ? isSelected : newIndustrySelection.industries[i.id],
    )

    const allIndustriesDeselected = group.industries.every((i) =>
      i.id === industry.id ? !isSelected : newIndustrySelection.industries[i.id],
    )

    // Update group selection based on industries
    if (allIndustriesSelected) {
      newIndustrySelection.industryGroups[group.id] = true
    } else if (allIndustriesDeselected) {
      newIndustrySelection.industryGroups[group.id] = false
    }

    // Check if all groups in the sector are selected/deselected
    const allGroupsSelected = sector.industryGroups.every((g) =>
      g.id === group.id ? newIndustrySelection.industryGroups[g.id] : newIndustrySelection.industryGroups[g.id],
    )

    const allGroupsDeselected = sector.industryGroups.every((g) =>
      g.id === group.id ? !newIndustrySelection.industryGroups[g.id] : !newIndustrySelection.industryGroups[g.id],
    )

    // Update sector selection based on groups
    if (allGroupsSelected) {
      newIndustrySelection.sectors[sector.id] = true
    } else if (allGroupsDeselected) {
      newIndustrySelection.sectors[sector.id] = false
    }

    setIndustrySelection(newIndustrySelection)
    updateIndustriesInFormData(newIndustrySelection)
  }

  const toggleSubIndustry = (subIndustry: SubIndustry, industry: Industry, group: IndustryGroup, sector: Sector) => {
    const newIndustrySelection = { ...industrySelection }
    const isSelected = !industrySelection.subIndustries[subIndustry.id]

    // Update subindustry selection
    newIndustrySelection.subIndustries[subIndustry.id] = isSelected

    // Check if all subindustries in the industry are selected/deselected
    const allSubIndustriesSelected = industry.subIndustries.every((si) =>
      si.id === subIndustry.id ? isSelected : newIndustrySelection.subIndustries[si.id],
    )

    const allSubIndustriesDeselected = industry.subIndustries.every((si) =>
      si.id === subIndustry.id ? !isSelected : newIndustrySelection.subIndustries[si.id],
    )

    // Update industry selection based on subindustries
    if (allSubIndustriesSelected) {
      newIndustrySelection.industries[industry.id] = true
    } else if (allSubIndustriesDeselected) {
      newIndustrySelection.industries[industry.id] = false
    }

    // Check if all industries in the group are selected/deselected
    const allIndustriesSelected = group.industries.every((i) =>
      i.id === industry.id ? newIndustrySelection.industries[i.id] : newIndustrySelection.industries[i.id],
    )

    const allIndustriesDeselected = group.industries.every((i) =>
      i.id === industry.id ? !newIndustrySelection.industries[i.id] : !newIndustrySelection.industries[i.id],
    )

    // Update group selection based on industries
    if (allIndustriesSelected) {
      newIndustrySelection.industryGroups[group.id] = true
    } else if (allIndustriesDeselected) {
      newIndustrySelection.industryGroups[group.id] = false
    }

    // Check if all groups in the sector are selected/deselected
    const allGroupsSelected = sector.industryGroups.every((g) =>
      g.id === group.id ? newIndustrySelection.industryGroups[g.id] : newIndustrySelection.industryGroups[g.id],
    )

    const allGroupsDeselected = sector.industryGroups.every((g) =>
      g.id === group.id ? !newIndustrySelection.industryGroups[g.id] : !newIndustrySelection.industryGroups[g.id],
    )

    // Update sector selection based on groups
    if (allGroupsSelected) {
      newIndustrySelection.sectors[sector.id] = true
    } else if (allGroupsDeselected) {
      newIndustrySelection.sectors[sector.id] = false
    }

    setIndustrySelection(newIndustrySelection)
    updateIndustriesInFormData(newIndustrySelection)
  }

  // Update the industries array in formData based on the hierarchical selection
  const updateIndustriesInFormData = (selection: IndustrySelection) => {
    if (!industryData) return

    const selectedIndustries: string[] = []
    const selectedSectorIds = new Set()
    const selectedGroupIds = new Set()
    const selectedIndustryIds = new Set()

    // First, collect all selected sector, group, and industry IDs
    industryData.sectors.forEach((sector) => {
      if (selection.sectors[sector.id]) {
        selectedSectorIds.add(sector.id)
      }

      sector.industryGroups.forEach((group) => {
        if (selection.industryGroups[group.id]) {
          selectedGroupIds.add(group.id)
        }

        group.industries.forEach((industry) => {
          if (selection.industries[industry.id]) {
            selectedIndustryIds.add(industry.id)
          }
        })
      })
    })

    // Then add only the highest level selections
    industryData.sectors.forEach((sector) => {
      if (selection.sectors[sector.id]) {
        selectedIndustries.push(sector.name)
      } else {
        sector.industryGroups.forEach((group) => {
          if (selection.industryGroups[group.id] && !selectedSectorIds.has(sector.id)) {
            selectedIndustries.push(group.name)
          } else if (!selection.industryGroups[group.id] && !selectedSectorIds.has(sector.id)) {
            group.industries.forEach((industry) => {
              if (
                selection.industries[industry.id] &&
                !selectedGroupIds.has(group.id) &&
                !selectedSectorIds.has(sector.id)
              ) {
                selectedIndustries.push(industry.name)
              } else if (
                !selection.industries[industry.id] &&
                !selectedGroupIds.has(group.id) &&
                !selectedSectorIds.has(sector.id)
              ) {
                industry.subIndustries.forEach((subIndustry) => {
                  if (
                    selection.subIndustries[subIndustry.id] &&
                    !selectedIndustryIds.has(industry.id) &&
                    !selectedGroupIds.has(group.id) &&
                    !selectedSectorIds.has(sector.id)
                  ) {
                    selectedIndustries.push(subIndustry.name)
                  }
                })
              }
            })
          }
        })
      }
    })

    handleNestedChange("targetCriteria", "industrySectors", selectedIndustries)
  }

  const removeIndustry = (industryToRemove: string) => {
    if (!industryData) return

    const newIndustrySelection = { ...industrySelection }
    let found = false

    // Search through all levels to find and unselect the matching item
    industryData.sectors.forEach((sector) => {
      if (sector.name === industryToRemove) {
        newIndustrySelection.sectors[sector.id] = false
        found = true

        // Unselect all children
        sector.industryGroups.forEach((group) => {
          newIndustrySelection.industryGroups[group.id] = false

          group.industries.forEach((industry) => {
            newIndustrySelection.industries[industry.id] = false

            industry.subIndustries.forEach((subIndustry) => {
              newIndustrySelection.subIndustries[subIndustry.id] = false
            })
          })
        })
      }

      if (!found) {
        sector.industryGroups.forEach((group) => {
          if (group.name === industryToRemove) {
            newIndustrySelection.industryGroups[group.id] = false
            found = true

            // Unselect all children
            group.industries.forEach((industry) => {
              newIndustrySelection.industries[industry.id] = false

              industry.subIndustries.forEach((subIndustry) => {
                newIndustrySelection.subIndustries[subIndustry.id] = false
              })
            })

            // Check if all groups in the sector are now deselected
            const allGroupsDeselected = sector.industryGroups.every((g) => !newIndustrySelection.industryGroups[g.id])

            if (allGroupsDeselected) {
              newIndustrySelection.sectors[sector.id] = false
            }
          }

          if (!found) {
            group.industries.forEach((industry) => {
              if (industry.name === industryToRemove) {
                newIndustrySelection.industries[industry.id] = false
                found = true

                // Unselect all children
                industry.subIndustries.forEach((subIndustry) => {
                  newIndustrySelection.subIndustries[subIndustry.id] = false
                })

                // Check parent selections
                const allIndustriesDeselected = group.industries.every((i) => !newIndustrySelection.industries[i.id])

                if (allIndustriesDeselected) {
                  newIndustrySelection.industryGroups[group.id] = false

                  const allGroupsDeselected = sector.industryGroups.every(
                    (g) => !newIndustrySelection.industryGroups[g.id],
                  )

                  if (allGroupsDeselected) {
                    newIndustrySelection.sectors[sector.id] = false
                  }
                }
              }

              if (!found) {
                industry.subIndustries.forEach((subIndustry) => {
                  if (subIndustry.name === industryToRemove) {
                    newIndustrySelection.subIndustries[subIndustry.id] = false
                    found = true

                    // Check parent selections
                    const allSubIndustriesDeselected = industry.subIndustries.every(
                      (si) => !newIndustrySelection.subIndustries[si.id],
                    )

                    if (allSubIndustriesDeselected) {
                      newIndustrySelection.industries[industry.id] = false

                      const allIndustriesDeselected = group.industries.every(
                        (i) => !newIndustrySelection.industries[i.id],
                      )

                      if (allIndustriesDeselected) {
                        newIndustrySelection.industryGroups[group.id] = false

                        const allGroupsDeselected = sector.industryGroups.every(
                          (g) => !newIndustrySelection.industryGroups[g.id],
                        )

                        if (allGroupsDeselected) {
                          newIndustrySelection.sectors[sector.id] = false
                        }
                      }
                    }
                  }
                })
              }
            })
          }
        })
      }
    })

    setIndustrySelection(newIndustrySelection)
    updateIndustriesInFormData(newIndustrySelection)
  }

  // Toggle expansion of UI sections
  const toggleContinentExpansion = (continentId: string) => {
    setExpandedContinents((prev) => ({
      ...prev,
      [continentId]: !prev[continentId],
    }))
  }

  const toggleRegionExpansion = (regionId: string) => {
    setExpandedRegions((prev) => {
      const newState = {
        ...prev,
        [regionId]: !prev[regionId],
      }
      return newState
    })
  }

  const toggleSectorExpansion = (sectorId: string) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sectorId]: !prev[sectorId],
    }))
  }

  const toggleIndustryGroupExpansion = (groupId: string) => {
    setExpandedIndustryGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const toggleIndustryExpansion = (industryId: string) => {
    setExpandedIndustries((prev) => ({
      ...prev,
      [industryId]: !prev[industryId],
    }))
  }

  // Filter geography data based on search term
  const filterGeographyData = () => {
    if (!geoData || !countrySearchTerm) return geoData

    const filteredContinents: Continent[] = []

    geoData.continents.forEach((continent) => {
      const filteredRegions = continent.regions.filter((region) =>
        region.name.toLowerCase().includes(countrySearchTerm.toLowerCase()),
      )

      if (filteredRegions.length > 0) {
        filteredContinents.push({
          ...continent,
          regions: filteredRegions,
        })
      }
    })

    return { continents: filteredContinents }
  }

  // Filter industry data based on search term
  const filterIndustryData = () => {
    if (!industryData || !industrySearchTerm) return industryData

    const filteredSectors: Sector[] = []

    industryData.sectors.forEach((sector) => {
      const filteredGroups: IndustryGroup[] = []

      sector.industryGroups.forEach((group) => {
        const filteredIndustries: Industry[] = []

        group.industries.forEach((industry) => {
          const filteredSubIndustries = industry.subIndustries.filter((subIndustry) =>
            subIndustry.name.toLowerCase().includes(industrySearchTerm.toLowerCase()),
          )

          if (
            filteredSubIndustries.length > 0 ||
            industry.name.toLowerCase().includes(industrySearchTerm.toLowerCase())
          ) {
            filteredIndustries.push({
              ...industry,
              subIndustries: filteredSubIndustries.length > 0 ? filteredSubIndustries : industry.subIndustries,
            })
          }
        })

        if (filteredIndustries.length > 0 || group.name.toLowerCase().includes(industrySearchTerm.toLowerCase())) {
          filteredGroups.push({
            ...group,
            industries: filteredIndustries.length > 0 ? filteredIndustries : group.industries,
          })
        }
      })

      if (filteredGroups.length > 0 || sector.name.toLowerCase().includes(industrySearchTerm.toLowerCase())) {
        filteredSectors.push({
          ...sector,
          industryGroups: filteredGroups.length > 0 ? filteredGroups : sector.industryGroups,
        })
      }
    })

    return { sectors: filteredSectors }
  }

  // Form validation
  const validateForm = () => {
    // Basic validation
    if (!formData.companyName?.trim()) return "Company name is required"
    if (!formData.website?.trim()) return "Website is required"
    if (!formData.companyType) return "Company type is required"
    if (!formData.capitalEntity) return "Capital entity is required"

    // Website validation
    try {
      const websiteUrl = new URL(formData.website.startsWith("http") ? formData.website : `https://${formData.website}`)
      if (!websiteUrl.hostname.includes(".")) {
        return "Please enter a valid website URL"
      }
    } catch (e) {
      return "Please enter a valid website URL"
    }

    // Contact validation
    if (formData.contacts.length === 0) return "At least one contact is required"
    for (const contact of formData.contacts) {
      if (!contact.name?.trim()) return "Contact name is required"
      if (!contact.email?.trim()) return "Contact email is required"
      if (!contact.phone?.trim()) return "Contact phone is required"

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(contact.email)) {
        return `Invalid email format for contact: ${contact.name}`
      }
    }

    // Agreements validation
    if (!formData.agreements.termsAndConditionsAccepted) {
      return "You must accept the terms and conditions"
    }
    if (!formData.agreements.ndaAccepted) {
      return "You must accept the NDA"
    }
    if (!formData.agreements.feeAgreementAccepted) {
      return "You must accept the fee agreement"
    }

    // Number range validations
    if (
      formData.targetCriteria.revenueMin !== undefined &&
      formData.targetCriteria.revenueMax !== undefined &&
      formData.targetCriteria.revenueMin > formData.targetCriteria.revenueMax
    ) {
      return "Minimum revenue cannot be greater than maximum revenue"
    }

    if (
      formData.targetCriteria.ebitdaMin !== undefined &&
      formData.targetCriteria.ebitdaMax !== undefined &&
      formData.targetCriteria.ebitdaMin > formData.targetCriteria.ebitdaMax
    ) {
      return "Minimum EBITDA cannot be greater than maximum EBITDA"
    }

    if (
      formData.targetCriteria.transactionSizeMin !== undefined &&
      formData.targetCriteria.transactionSizeMax !== undefined &&
      formData.targetCriteria.transactionSizeMin > formData.targetCriteria.transactionSizeMax
    ) {
      return "Minimum transaction size cannot be greater than maximum transaction size"
    }

    return null
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for token
    if (!authToken) {
      toast({
        title: "Authentication Required",
        description: "Please log in again to submit your profile.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const validationError = validateForm()
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      // Prepare profile data
      const profileData = {
        ...formData,
        buyer: buyerId || undefined, // Only include if available
      }

      console.log("Company Profile - Submitting to API:", apiUrl)
      console.log("Company Profile - Using token:", authToken.substring(0, 10) + "...")
      console.log("Company Profile - Authorization header:", `Bearer ${authToken}`)
      if (buyerId) {
        console.log("Company Profile - Buyer ID:", buyerId)
      }

      // Submit the data - use POST for new profiles, PUT for updates
      const endpoint = `${apiUrl}/company-profiles`
      const method = "POST" // Always use POST as the API will handle create/update logic

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(profileData),
      })

      console.log("Company Profile - Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error Response:", errorData)

        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })

          setTimeout(() => {
            router.push("/login?session=expired")
          }, 2000)

          throw new Error("Authentication expired. Please log in again.")
        }

        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log("Company Profile - Submission successful:", result)

      setSubmitStatus("success")
      toast({
        title: "Profile Submitted",
        description: "Your company profile has been successfully submitted.",
        variant: "default",
      })

      // Redirect after successful submission
      setTimeout(() => {
        router.push("/deals?profileSubmitted=true")
      }, 2000)
    } catch (error: any) {
      console.error("Submission error:", error)
      setSubmitStatus("error")
      setErrorMessage(error.message || "An error occurred while submitting your profile.")

      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred while submitting your profile.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render the hierarchical geography selection
  const renderGeographySelection = () => {
    const filteredData = filterGeographyData()
    if (!filteredData) return <div>Loading geography data...</div>

    return (
      <div className="space-y-2 font-poppins">
        {filteredData.continents.map((continent) => (
          <div key={continent.id} className="border-b border-gray-100 pb-1">
            <div className="flex items-center">
              <Checkbox
                id={`continent-${continent.id}`}
                checked={!!geoSelection.continents[continent.id]}
                onCheckedChange={(checked) => {
                  toggleContinent(continent)
                }}
                className="mr-2 border-[#d0d5dd]"
              />
              <div
                className="flex items-center cursor-pointer flex-1"
                onClick={() => toggleContinentExpansion(continent.id)}
              >
                {expandedContinents[continent.id] ? (
                  <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
                )}
                <Label htmlFor={`continent-${continent.id}`} className="text-[#344054] cursor-pointer font-medium">
                  {continent.name}
                </Label>
              </div>
            </div>

            {expandedContinents[continent.id] && (
              <div className="ml-6 mt-1 space-y-1">
                {continent.regions.map((region) => (
                  <div key={region.id} className="pl-2">
                    <div className="flex items-center">
                      <Checkbox
                        id={`region-${region.id}`}
                        checked={!!geoSelection.regions[region.id]}
                        onCheckedChange={(checked) => {
                          toggleRegion(region, continent)
                        }}
                        className="mr-2 border-[#d0d5dd]"
                      />
                      {region.subRegions && region.subRegions.length > 0 ? (
                        <div
                          className="flex items-center cursor-pointer flex-1"
                          onClick={() => toggleRegionExpansion(region.id)}
                        >
                          {expandedRegions[region.id] ? (
                            <ChevronDown className="h-3 w-3 mr-1 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />
                          )}
                          <Label htmlFor={`region-${region.id}`} className="text-[#344054] cursor-pointer">
                            {region.name}
                          </Label>
                        </div>
                      ) : (
                        <Label htmlFor={`region-${region.id}`} className="text-[#344054] cursor-pointer">
                          {region.name}
                        </Label>
                      )}
                    </div>

                    {region.subRegions && expandedRegions[region.id] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {region.subRegions.map((subRegion) => (
                          <div key={subRegion.id} className="flex items-center">
                            <Checkbox
                              id={`subregion-${subRegion.id}`}
                              checked={!!geoSelection.subRegions[subRegion.id]}
                              onCheckedChange={(checked) => {
                                toggleSubRegion(subRegion, region, continent)
                              }}
                              className="mr-2 border-[#d0d5dd]"
                            />
                            <Label
                              htmlFor={`subregion-${subRegion.id}`}
                              className="text-[#344054] cursor-pointer text-sm"
                            >
                              {subRegion.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Render the hierarchical industry selection
  const renderIndustrySelection = () => {
    const filteredData = filterIndustryData()
    if (!filteredData) return <div>Loading industry data...</div>

    return (
      <div className="space-y-2">
        {filteredData.sectors.map((sector) => (
          <div key={sector.id} className="border-b border-gray-100 pb-1">
            <div className="flex items-center">
              <Checkbox
                id={`sector-${sector.id}`}
                checked={!!industrySelection.sectors[sector.id]}
                onCheckedChange={(checked) => {
                  toggleSector(sector)
                }}
                className="mr-2 border-[#d0d5dd]"
              />
              <div className="flex items-center cursor-pointer flex-1" onClick={() => toggleSectorExpansion(sector.id)}>
                {expandedSectors[sector.id] ? (
                  <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
                )}
                <Label htmlFor={`sector-${sector.id}`} className="text-[#344054] cursor-pointer font-medium">
                  {sector.name}
                </Label>
              </div>
            </div>

            {expandedSectors[sector.id] && (
              <div className="ml-6 mt-1 space-y-1">
                {sector.industryGroups.map((group) => (
                  <div key={group.id} className="pl-2">
                    <div className="flex items-center">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={!!industrySelection.industryGroups[group.id]}
                        onCheckedChange={(checked) => {
                          toggleIndustryGroup(group, sector)
                        }}
                        className="mr-2 border-[#d0d5dd]"
                      />
                      <div
                        className="flex items-center cursor-pointer flex-1"
                        onClick={() => toggleIndustryGroupExpansion(group.id)}
                      >
                        {expandedIndustryGroups[group.id] ? (
                          <ChevronDown className="h-3 w-3 mr-1 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />
                        )}
                        <Label htmlFor={`group-${group.id}`} className="text-[#344054] cursor-pointer">
                          {group.name}
                        </Label>
                      </div>
                    </div>

                    {expandedIndustryGroups[group.id] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {group.industries.map((industry) => (
                          <div key={industry.id} className="pl-2">
                            <div className="flex items-center">
                              <Checkbox
                                id={`industry-${industry.id}`}
                                checked={!!industrySelection.industries[industry.id]}
                                onCheckedChange={(checked) => {
                                  toggleIndustry(industry, group, sector)
                                }}
                                className="mr-2 border-[#d0d5dd]"
                              />
                              <div
                                className="flex items-center cursor-pointer flex-1"
                                onClick={() => toggleIndustryExpansion(industry.id)}
                              >
                                {expandedIndustries[industry.id] ? (
                                  <ChevronDown className="h-3 w-3 mr-1 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />
                                )}
                                <Label htmlFor={`industry-${industry.id}`} className="text-[#344054] cursor-pointer">
                                  {industry.name}
                                </Label>
                              </div>
                            </div>

                            {expandedIndustries[industry.id] && (
                              <div className="ml-6 mt-1 space-y-1">
                                {industry.subIndustries.map((subIndustry) => (
                                  <div key={subIndustry.id} className="flex items-center">
                                    <Checkbox
                                      id={`subindustry-${subIndustry.id}`}
                                      checked={!!industrySelection.subIndustries[subIndustry.id]}
                                      onCheckedChange={(checked) => {
                                        toggleSubIndustry(subIndustry, industry, group, sector)
                                      }}
                                      className="mr-2 border-[#d0d5dd]"
                                    />
                                    <Label
                                      htmlFor={`subindustry-${subIndustry.id}`}
                                      className="text-[#344054] cursor-pointer text-sm"
                                    >
                                      {subIndustry.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
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

  // Handle logout
  const handleLogout = () => {
    console.log("Company Profile - Logging out")
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/login")
  }

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
            <h1 className="text-2xl font-semibold text-gray-800">Company Profile</h1>
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
              className="mb-2 flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Eye className="mr-3 h-5 w-5" />
              <span>View Profile</span>
            </Link>

            <Link
              href="/company-profile"
              className="mb-2 flex items-center rounded-md bg-teal-500 px-4 py-3 text-white hover:bg-teal-600"
            >
              <Settings className="mr-3 h-5 w-5" />
              <span>Company Profile</span>
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
          <div className="max-w-4xl mx-auto space-y-6">
            {submitStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your company profile has been successfully submitted.
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Company Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-[#2f2b43] text-lg font-poppins font-seminold mb-4">About Your Company</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="companyName" className="text-[#667085] text-sm mb-1.5 block">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Company Name"
                      className="border-[#d0d5dd]"
                      value={formData.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-[#667085] text-sm mb-1.5 block">
                      Company Website <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      className="border-[#d0d5dd]"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="companyType" className="text-[#667085] text-sm mb-1.5 block">
                      Company Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.companyType} onValueChange={(value) => handleChange("companyType", value)}>
                      <SelectTrigger className="border-[#d0d5dd]">
                        <SelectValue placeholder="Select Company Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#667085] text-sm mb-1.5 block">
                      Capital Availability <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-col space-y-2 mt-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="capital_ready"
                          name="capitalAvailability"
                          value="ready_to_deploy"
                          checked={formData.capitalAvailability === "ready_to_deploy"}
                          onChange={(e) => handleChange("capitalAvailability", e.target.value)}
                          className="text-[#3aafa9] focus:ring-[#3aafa9] h-4 w-4"
                        />
                        <Label htmlFor="capital_ready" className="text-[#344054] cursor-pointer">
                          Ready to deploy immediately
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="capital_need"
                          name="capitalAvailability"
                          value="need_to_raise"
                          checked={formData.capitalAvailability === "need_to_raise"}
                          onChange={(e) => handleChange("capitalAvailability", e.target.value)}
                          className="text-[#3aafa9] focus:ring-[#3aafa9] h-4 w-4"
                        />
                        <Label htmlFor="capital_need" className="text-[#344054] cursor-pointer">
                          Need to raise
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label className="text-[#667085] text-sm mb-1.5 block">
                      Capital Entity <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-col space-y-2 mt-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="capital_fund"
                          name="capitalEntity"
                          value="Fund"
                          checked={formData.capitalEntity === "Fund"}
                          onChange={(e) => handleChange("capitalEntity", e.target.value)}
                          className="text-[#3aafa9] focus:ring-[#3aafa9] h-4 w-4"
                        />
                        <Label htmlFor="capital_fund" className="text-[#344054] cursor-pointer">
                          Fund
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="capital_holding"
                          name="capitalEntity"
                          value="Holding Company"
                          checked={formData.capitalEntity === "Holding Company"}
                          onChange={(e) => handleChange("capitalEntity", e.target.value)}
                          className="text-[#3aafa9] focus:ring-[#3aafa9] h-4 w-4"
                        />
                        <Label htmlFor="capital_holding" className="text-[#344054] cursor-pointer">
                          Holding Company
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="capital_spv"
                          name="capitalEntity"
                          value="SPV"
                          checked={formData.capitalEntity === "SPV"}
                          onChange={(e) => handleChange("capitalEntity", e.target.value)}
                          className="text-[#3aafa9] focus:ring-[#3aafa9] h-4 w-4"
                        />
                        <Label htmlFor="capital_spv" className="text-[#344054] cursor-pointer">
                          SPV
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="capital_direct"
                          name="capitalEntity"
                          value="Direct Investment"
                          checked={formData.capitalEntity === "Direct Investment"}
                          onChange={(e) => handleChange("capitalEntity", e.target.value)}
                          className="text-[#3aafa9] focus:ring-[#3aafa9] h-4 w-4"
                        />
                        <Label htmlFor="capital_direct" className="text-[#344054] cursor-pointer">
                          Direct Investment
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label htmlFor="dealsCompletedLast5Years" className="text-[#667085] text-sm mb-1.5 block">
                        Number of deals completed in last 5 years
                      </Label>
                      <Input
                        id="dealsCompletedLast5Years"
                        type="number"
                        className="border-[#d0d5dd]"
                        value={formData.dealsCompletedLast5Years || ""}
                        onChange={(e) =>
                          handleChange("dealsCompletedLast5Years", e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="averageDealSize" className="text-[#667085] text-sm mb-1.5 block">
                        Average deal size ($)
                      </Label>
                      <Input
                        id="averageDealSize"
                        type="number"
                        className="border-[#d0d5dd]"
                        value={formData.averageDealSize || ""}
                        onChange={(e) =>
                          handleChange("averageDealSize", e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4 mt-4">
                  <Label className="text-[#667085] text-sm mb-1.5 block">
                    Contact Information (up to 3 contacts) <span className="text-red-500">*</span>
                  </Label>
                  <div className="border border-[#d0d5dd] rounded-md p-4">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="mb-4">
                        {index > 0 && <div className="h-px bg-gray-200 my-4"></div>}
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Contact {index + 1}</h3>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeContact(index)}
                              className="text-red-500 hover:text-red-700 p-0 h-auto"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`contact-name-${index}`} className="text-[#667085] text-sm mb-1.5 block">
                              Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`contact-name-${index}`}
                              className="border-[#d0d5dd]"
                              value={contact.name}
                              onChange={(e) => handleContactChange(index, "name", e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`contact-email-${index}`} className="text-[#667085] text-sm mb-1.5 block">
                              Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`contact-email-${index}`}
                              type="email"
                              className="border-[#d0d5dd]"
                              value={contact.email}
                              onChange={(e) => handleContactChange(index, "email", e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`contact-phone-${index}`} className="text-[#667085] text-sm mb-1.5 block">
                              Phone <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`contact-phone-${index}`}
                              className="border-[#d0d5dd]"
                              value={contact.phone}
                              onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.contacts.length < 3 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={addContact}
                        className="text-[#3aafa9] hover:text-[#3aafa9] hover:bg-[#f0f4f8] p-0 h-auto"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add More Contacts
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Criteria */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-[#2f2b43] text-lg font-medium mb-4">Target Criteria</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label className="text-[#667085] text-sm mb-1.5 block">Countries</Label>
                    <div className="border border-[#d0d5dd] rounded-md p-4 h-80 flex flex-col">
                      <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#667085]" />
                        <Input
                          placeholder="Search countries..."
                          className="pl-8 border-[#d0d5dd]"
                          value={countrySearchTerm}
                          onChange={(e) => setCountrySearchTerm(e.target.value)}
                        />
                      </div>

                      {formData.targetCriteria.countries.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-[#667085] mb-1">Selected Countries</div>
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            {formData.targetCriteria.countries.map((country, index) => (
                              <span
                                key={`selected-country-${index}`}
                                className="bg-gray-100 text-[#344054] text-xs rounded-full px-2 py-0.5 flex items-center group"
                              >
                                {country}
                                <button
                                  type="button"
                                  onClick={() => removeCountry(country)}
                                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto">{renderGeographySelection()}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#667085] text-sm mb-1.5 block">Industry Sectors</Label>
                    <div className="border border-[#d0d5dd] rounded-md p-4 h-80 flex flex-col">
                      <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#667085]" />
                        <Input
                          placeholder="Search industries..."
                          className="pl-8 border-[#d0d5dd]"
                          value={industrySearchTerm}
                          onChange={(e) => setIndustrySearchTerm(e.target.value)}
                        />
                      </div>

                      {formData.targetCriteria.industrySectors.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-[#667085] mb-1">Selected Industries</div>
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            {formData.targetCriteria.industrySectors.map((industry, index) => (
                              <span
                                key={`selected-industry-${index}`}
                                className="bg-gray-100 text-[#344054] text-xs rounded-full px-2 py-0.5 flex items-center group"
                              >
                                {industry}
                                <button
                                  type="button"
                                  onClick={() => removeIndustry(industry)}
                                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto">{renderIndustrySelection()}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <Label className="text-[#667085] text-sm">Revenue Size Range</Label>
                      <Select
                        value={formData.selectedCurrency}
                        onValueChange={(value) => handleChange("selectedCurrency", value)}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Label htmlFor="revenueMin" className="text-[#667085] text-sm w-10">
                          Min
                        </Label>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            {formData.selectedCurrency === "USD"
                              ? "$"
                              : formData.selectedCurrency === "EUR"
                                ? "€"
                                : formData.selectedCurrency === "GBP"
                                  ? "£"
                                  : formData.selectedCurrency}
                          </div>
                          <Input
                            id="revenueMin"
                            type="text"
                            className="border-[#d0d5dd] pl-8"
                            value={formatNumberWithCommas(formData.targetCriteria.revenueMin)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, "")
                              if (value === "" || /^\d+$/.test(value)) {
                                handleNestedChange("targetCriteria", "revenueMin", value ? Number(value) : undefined)
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Label htmlFor="revenueMax" className="text-[#667085] text-sm w-10">
                          Max
                        </Label>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            {formData.selectedCurrency === "USD"
                              ? "$"
                              : formData.selectedCurrency === "EUR"
                                ? "€"
                                : formData.selectedCurrency === "GBP"
                                  ? "£"
                                  : formData.selectedCurrency}
                          </div>
                          <Input
                            id="revenueMax"
                            type="text"
                            className="border-[#d0d5dd] pl-8"
                            value={formatNumberWithCommas(formData.targetCriteria.revenueMax)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, "")
                              if (value === "" || /^\d+$/.test(value)) {
                                handleNestedChange("targetCriteria", "revenueMax", value ? Number(value) : undefined)
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#667085] text-sm mb-1.5 block">EBITDA Range</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Label htmlFor="ebitdaMin" className="text-[#667085] text-sm w-10">
                          Min
                        </Label>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            {formData.selectedCurrency === "USD"
                              ? "$"
                              : formData.selectedCurrency === "EUR"
                                ? "€"
                                : formData.selectedCurrency === "GBP"
                                  ? "£"
                                  : formData.selectedCurrency}
                          </div>
                          <Input
                            id="ebitdaMin"
                            type="text"
                            className="border-[#d0d5dd] pl-8"
                            value={formatNumberWithCommas(formData.targetCriteria.ebitdaMin)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, "")
                              if (value === "" || /^\d+$/.test(value)) {
                                handleNestedChange("targetCriteria", "ebitdaMin", value ? Number(value) : undefined)
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Label htmlFor="ebitdaMax" className="text-[#667085] text-sm w-10">
                          Max
                        </Label>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            {formData.selectedCurrency === "USD"
                              ? "$"
                              : formData.selectedCurrency === "EUR"
                                ? "€"
                                : formData.selectedCurrency === "GBP"
                                  ? "£"
                                  : formData.selectedCurrency}
                          </div>
                          <Input
                            id="ebitdaMax"
                            type="text"
                            className="border-[#d0d5dd] pl-8"
                            value={formatNumberWithCommas(formData.targetCriteria.ebitdaMax)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, "")
                              if (value === "" || /^\d+$/.test(value)) {
                                handleNestedChange("targetCriteria", "ebitdaMax", value ? Number(value) : undefined)
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#667085] text-sm mb-1.5 block">Transaction Size Range</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Label htmlFor="transactionSizeMin" className="text-[#667085] text-sm w-10">
                          Min
                        </Label>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            {formData.selectedCurrency === "USD"
                              ? "$"
                              : formData.selectedCurrency === "EUR"
                                ? "€"
                                : formData.selectedCurrency === "GBP"
                                  ? "£"
                                  : formData.selectedCurrency}
                          </div>
                          <Input
                            id="transactionSizeMin"
                            type="text"
                            className="border-[#d0d5dd] pl-8"
                            value={formatNumberWithCommas(formData.targetCriteria.transactionSizeMin)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, "")
                              if (value === "" || /^\d+$/.test(value)) {
                                handleNestedChange(
                                  "targetCriteria",
                                  "transactionSizeMin",
                                  value ? Number(value) : undefined,
                                )
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Label htmlFor="transactionSizeMax" className="text-[#667085] text-sm w-10">
                          Max
                        </Label>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            {formData.selectedCurrency === "USD"
                              ? "$"
                              : formData.selectedCurrency === "EUR"
                                ? "€"
                                : formData.selectedCurrency === "GBP"
                                  ? "£"
                                  : formData.selectedCurrency}
                          </div>
                          <Input
                            id="transactionSizeMax"
                            type="text"
                            className="border-[#d0d5dd] pl-8"
                            value={formatNumberWithCommas(formData.targetCriteria.transactionSizeMax)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, "")
                              if (value === "" || /^\d+$/.test(value)) {
                                handleNestedChange(
                                  "targetCriteria",
                                  "transactionSizeMax",
                                  value ? Number(value) : undefined,
                                )
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="minStakePercent" className="text-[#667085] text-sm mb-1.5 block">
                      Minimum Stake Percentage (%)
                    </Label>
                    <Input
                      id="minStakePercent"
                      type="number"
                      min="0"
                      max="100"
                      className="border-[#d0d5dd]"
                      value={formData.targetCriteria.minStakePercent || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "targetCriteria",
                          "minStakePercent",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="minYearsInBusiness" className="text-[#667085] text-sm mb-1.5 block">
                      Minimum Years in Business
                    </Label>
                    <Input
                      id="minYearsInBusiness"
                      type="number"
                      min="0"
                      className="border-[#d0d5dd]"
                      value={formData.targetCriteria.minYearsInBusiness || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "targetCriteria",
                          "minYearsInBusiness",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Business Models */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-[#2f2b43] text-lg font-medium mb-4">Preferred Business Models</h2>
                <div className="flex flex-wrap gap-6">
                  {BUSINESS_MODELS.map((model) => (
                    <div key={model} className="flex items-center space-x-2">
                      <Checkbox
                        id={`model-${model}`}
                        className="border-[#d0d5dd]"
                        checked={formData.targetCriteria.preferredBusinessModels.includes(model)}
                        onCheckedChange={() => toggleBusinessModel(model)}
                      />
                      <Label htmlFor={`model-${model}`} className="text-[#344054]">
                        {model}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Management Team Preference */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-[#2f2b43] text-lg font-medium mb-4">Management Future Preferences</h2>
                <div className="flex flex-wrap gap-6">
                  {MANAGEMENT_PREFERENCES.map((preference) => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox
                        id={`preference-${preference}`}
                        className="border-[#d0d5dd]"
                        checked={extendedFormState.selectedManagementPreferences.includes(preference)}
                        onCheckedChange={() => toggleManagementPreference(preference)}
                      />
                      <Label htmlFor={`preference-${preference}`} className="text-[#344054]">
                        {preference}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description of Ideal Target(s) */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-[#2f2b43] text-lg font-medium mb-4">Description of Ideal Target(s)</h2>
                <Textarea
                  placeholder="Add additional information about company types you are pursuing especially specific industries and activities."
                  className="min-h-[100px] border-[#d0d5dd]"
                  value={formData.targetCriteria.description || ""}
                  onChange={(e) => handleNestedChange("targetCriteria", "description", e.target.value)}
                />
              </div>
              {/* General Preferences */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-[#2f2b43] text-lg font-medium mb-4">General Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <Checkbox
                      id="stopSendingDeals"
                      className="mt-1 border-[#d0d5dd]"
                      checked={formData.preferences.stopSendingDeals}
                      onCheckedChange={(checked) =>
                        handleNestedChange("preferences", "stopSendingDeals", checked === true)
                      }
                    />
                    <Label htmlFor="stopSendingDeals" className="text-[#344054]">
                      Stop sending deals
                    </Label>
                  </div>

                  <div className="flex items-end space-x-2">
                    <Checkbox
                      id="dontShowMyDeals"
                      className="mt-1 border-[#d0d5dd]"
                      checked={formData.preferences.dontShowMyDeals}
                      onCheckedChange={(checked) =>
                        handleNestedChange("preferences", "dontShowMyDeals", checked === true)
                      }
                    />
                    <Label htmlFor="dontShowMyDeals" className="text-[#344054]">
                      Don't show sellers your company details until you engage. You will show as "Anonymous Buyer"
                    </Label>
                  </div>

                  <div className="flex items-end space-x-2">
                    <Checkbox
                      id="dontSendDealsToMyCompetitors"
                      className="mt-1 border-[#d0d5dd]"
                      checked={formData.preferences.dontSendDealsToMyCompetitors}
                      onCheckedChange={(checked) =>
                        handleNestedChange("preferences", "dontSendDealsToMyCompetitors", checked === true)
                      }
                    />
                    <Label htmlFor="dontSendDealsToMyCompetitors" className="text-[#344054]">
                      Do not send deals that are currently marketed on other deal marketplaces
                    </Label>
                  </div>

                  <div className="flex items-end space-x-2">
                    <Checkbox
                      id="allowBuyerLikeDeals"
                      className="mt-1 border-[#d0d5dd]"
                      checked={formData.preferences.allowBuyerLikeDeals}
                      onCheckedChange={(checked) =>
                        handleNestedChange("preferences", "allowBuyerLikeDeals", checked === true)
                      }
                    />
                    <Label htmlFor="allowBuyerLikeDeals" className="text-[#344054]">
                      Allow buy side fee deals (charged by seller above CIM Amplify Fees)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Terms and Agreements */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <Checkbox
                      id="termsAndConditions"
                      className="mt-1 border-[#d0d5dd]"
                      checked={formData.agreements.termsAndConditionsAccepted}
                      onCheckedChange={(checked) =>
                        handleNestedChange("agreements", "termsAndConditionsAccepted", checked === true)
                      }
                      required
                    />
                    <Label htmlFor="termsAndConditions" className="text-[#344054]">
                      I have read and agree to the website <span className="text-[#3aafa9]">terms and conditions</span>
                    </Label>
                  </div>

                  <div className="flex items-end space-x-2">
                    <Checkbox
                      id="nda"
                      className="mt-1 border-[#d0d5dd]"
                      checked={formData.agreements.ndaAccepted}
                      onCheckedChange={(checked) => handleNestedChange("agreements", "ndaAccepted", checked === true)}
                      required
                    />
                    <Label htmlFor="nda" className="text-[#344054]">
                      I have read and agree to the universal NDA so that I can go straight to CIM
                    </Label>
                  </div>

                  <div className="flex items-end space-x-2">
                    <Checkbox
                      id="feeAgreement"
                      className="mt-1 border-[#d0d5dd]"
                      checked={formData.agreements.feeAgreementAccepted}
                      onCheckedChange={(checked) =>
                        handleNestedChange("agreements", "feeAgreementAccepted", checked === true)
                      }
                      required
                    />
                    <Label htmlFor="feeAgreement" className="text-[#344054]">
                      I have read and agree to the fee agreement
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" className="bg-[#3aafa9] hover:bg-[#2a9d8f] text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Profile"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
