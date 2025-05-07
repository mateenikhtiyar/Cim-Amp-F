"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { CompanyProfile } from "@/types/company-profile"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Search, AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
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

// Extend the CompanyProfile type to include selectedCurrency
// declare module "@/types/company-profile" {
//   interface CompanyProfile {
//     selectedCurrency: string;
//   }
// }

const COMPANY_TYPES = [
  "Private Equity",
  "Holding Company",
  "Family Office",
  "Independent Sponsor",
  "Entrepreneurship through Acquisition",
  "Single Acquisition Search",
  "Strategic Operating Company",
  "Buy Side Mandate",
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

export default function AcquireProfilePage() {
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
      console.log("Acquire Profile - Token set from URL:", cleanToken.substring(0, 10) + "...")
    } else {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        const cleanToken = storedToken.trim()
        setAuthToken(cleanToken)
        console.log("Acquire Profile - Token set from localStorage:", cleanToken.substring(0, 10) + "...")
      } else {
        console.warn("Acquire Profile - No token found, redirecting to login")
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
      console.log("Acquire Profile - Buyer ID set from URL:", cleanUserId)
    } else {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        const cleanUserId = storedUserId.trim()
        setBuyerId(cleanUserId)
        console.log("Acquire Profile - Buyer ID set from localStorage:", cleanUserId)
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
      console.warn("Acquire Profile - No token found, redirecting to login")
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
        if (profileData.targetCriteria?.managementTeamPreference?.length > 0) {
          setExtendedFormState({
            ...extendedFormState,
            selectedManagementPreferences: [...profileData.targetCriteria.managementTeamPreference],
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

  // Let's add a more robust type definition for the CompanyProfile type
  // Replace the existing form state initialization with this updated version that includes proper type handling

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
      managementTeamPreference: [],
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
      currentPreferences.length > 0 ? currentPreferences : [],
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

}