"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { CompanyProfile } from "@/types/company-profile"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Search, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const COMPANY_TYPES = [
  "Private Equity",
  "Venture Capital",
  "Family Office",
  "Corporate",
  "Investment Bank",
  "Individual Investor",
]

const CAPITAL_ENTITIES = ["Fund", "Holding Company", "SPV", "Direct Investment"]

const BUSINESS_MODELS = ["Recurring Revenue", "Project-Based", "Asset Light", "Asset Heavy"]

const MANAGEMENT_PREFERENCES = ["Owner(s) Departing", "Owner(s) Staying", "Management Team Staying", "No Preference"]

// Sample countries and industries for demonstration
const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Nigeria",
  "South Africa",
]

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Goods",
  "Manufacturing",
  "Energy",
  "Telecommunications",
  "Real Estate",
  "Transportation",
  "Media & Entertainment",
  "Coal",
  "Oil & Gas",
]

// Default API URL
const DEFAULT_API_URL = "https://cim-amp.onrender.com"

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
      console.log("Token set from URL:", cleanToken.substring(0, 10) + "...")
    } else {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        const cleanToken = storedToken.trim()
        setAuthToken(cleanToken)
        console.log("Token set from localStorage:", cleanToken.substring(0, 10) + "...")
      }
    }

    // Set userId from URL or localStorage
    if (urlUserId) {
      const cleanUserId = urlUserId.trim()
      localStorage.setItem("userId", cleanUserId)
      setBuyerId(cleanUserId)
      console.log("Buyer ID set from URL:", cleanUserId)
    } else {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        const cleanUserId = storedUserId.trim()
        setBuyerId(cleanUserId)
        console.log("Buyer ID set from localStorage:", cleanUserId)
      }
    }

    // Set API URL from localStorage or use default
    const storedApiUrl = localStorage.getItem("apiUrl")
    if (storedApiUrl) {
      setApiUrl(storedApiUrl)
    }
  }, [searchParams])

  // Form state
  const [formData, setFormData] = useState<CompanyProfile>({
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
      allowBuyerLikeDeals: true,
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
      managementTeamPreference: undefined,
      description: "",
    },
    agreements: {
      termsAndConditionsAccepted: false,
      ndaAccepted: false,
      feeAgreementAccepted: false,
    },
  })

  // Selected countries and industries for UI management
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [countrySearchTerm, setCountrySearchTerm] = useState("")
  const [industrySearchTerm, setIndustrySearchTerm] = useState("")

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

  // Toggle country selection
  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== country))
      handleNestedChange(
        "targetCriteria",
        "countries",
        formData.targetCriteria.countries.filter((c) => c !== country),
      )
    } else {
      setSelectedCountries([...selectedCountries, country])
      handleNestedChange("targetCriteria", "countries", [...formData.targetCriteria.countries, country])
    }
  }

  // Toggle industry selection
  const toggleIndustry = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industry))
      handleNestedChange(
        "targetCriteria",
        "industrySectors",
        formData.targetCriteria.industrySectors.filter((i) => i !== industry),
      )
    } else {
      setSelectedIndustries([...selectedIndustries, industry])
      handleNestedChange("targetCriteria", "industrySectors", [...formData.targetCriteria.industrySectors, industry])
    }
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

  // Filter countries based on search term
  const filteredCountries = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(countrySearchTerm.toLowerCase()),
  )

  // Filter industries based on search term
  const filteredIndustries = INDUSTRIES.filter((industry) =>
    industry.toLowerCase().includes(industrySearchTerm.toLowerCase()),
  )

  // Form validation
  const validateForm = () => {
    // Basic validation
    if (!formData.companyName) return "Company name is required"
    if (!formData.website) return "Website is required"
    if (!formData.companyType) return "Company type is required"
    if (!formData.capitalEntity) return "Capital entity is required"

    // Contact validation
    if (formData.contacts.length === 0) return "At least one contact is required"
    for (const contact of formData.contacts) {
      if (!contact.name) return "Contact name is required"
      if (!contact.email) return "Contact email is required"
      if (!contact.phone) return "Contact phone is required"
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

      console.log("Submitting to API:", apiUrl)
      console.log("Using token:", authToken.substring(0, 10) + "...")
      console.log("Authorization header:", `Bearer ${authToken}`)
      if (buyerId) {
        console.log("Buyer ID:", buyerId)
      }

      // Submit the data
      const response = await fetch(`${apiUrl}/company-profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, // Ensure proper format with space after Bearer
        },
        body: JSON.stringify(profileData),
        credentials: "include", // Include cookies if any
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error Response:", errorData)
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log("Submission successful:", result)

      setSubmitStatus("success")
      toast({
        title: "Profile Submitted",
        description: "Your company profile has been successfully submitted.",
        variant: "default",
      })

      // Redirect after successful submission
      setTimeout(() => {
        router.push("/dashboard?profileSubmitted=true")
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

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2f2b43] mb-6">Company Profile</h1>
        </div>

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
          {/* General Preferences */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-[#2f2b43] text-lg font-medium mb-4">General Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="stopSendingDeals"
                  className="mt-1 border-[#d0d5dd]"
                  checked={formData.preferences.stopSendingDeals}
                  onCheckedChange={(checked) => handleNestedChange("preferences", "stopSendingDeals", checked === true)}
                />
                <Label htmlFor="stopSendingDeals" className="text-[#344054]">
                  Stop sending deals
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dontShowMyDeals"
                  className="mt-1 border-[#d0d5dd]"
                  checked={formData.preferences.dontShowMyDeals}
                  onCheckedChange={(checked) => handleNestedChange("preferences", "dontShowMyDeals", checked === true)}
                />
                <Label htmlFor="dontShowMyDeals" className="text-[#344054]">
                  Don't show sellers your company details until you engage. You will show as "Anonymous Buyer"
                </Label>
              </div>

              <div className="flex items-start space-x-2">
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

              <div className="flex items-start space-x-2">
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

          {/* Company Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-[#2f2b43] text-lg font-medium mb-4">Company Information</h2>

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

            <div className="mb-6">
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
                <Label htmlFor="capitalEntity" className="text-[#667085] text-sm mb-1.5 block">
                  Capital Entity <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.capitalEntity} onValueChange={(value) => handleChange("capitalEntity", value)}>
                  <SelectTrigger className="border-[#d0d5dd]">
                    <SelectValue placeholder="Select Capital Entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPITAL_ENTITIES.map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {entity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onChange={(e) => handleChange("averageDealSize", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Target Criteria */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-[#2f2b43] text-lg font-medium mb-4">Target Criteria</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="text-[#667085] text-sm mb-1.5 block">Countries</Label>
                <div className="border border-[#d0d5dd] rounded-md p-4 h-80 overflow-y-auto">
                  <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#667085]" />
                    <Input
                      placeholder="Search countries..."
                      className="pl-8 border-[#d0d5dd]"
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                    />
                  </div>

                  {selectedCountries.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-[#667085] mb-1">Selected Countries</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedCountries.map((country) => (
                          <span
                            key={country}
                            className="bg-gray-100 text-[#344054] text-xs rounded-full px-2 py-0.5 flex items-center"
                          >
                            {country}
                            <button
                              type="button"
                              onClick={() => toggleCountry(country)}
                              className="ml-1 text-[#98a2b3] hover:text-[#667085]"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {filteredCountries.map((country) => (
                      <div key={country} className="flex items-center">
                        <Checkbox
                          id={`country-${country}`}
                          checked={selectedCountries.includes(country)}
                          onCheckedChange={() => toggleCountry(country)}
                          className="mr-2 border-[#d0d5dd]"
                        />
                        <Label htmlFor={`country-${country}`} className="text-[#344054] cursor-pointer">
                          {country}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[#667085] text-sm mb-1.5 block">Industry Sectors</Label>
                <div className="border border-[#d0d5dd] rounded-md p-4 h-80 overflow-y-auto">
                  <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#667085]" />
                    <Input
                      placeholder="Search industries..."
                      className="pl-8 border-[#d0d5dd]"
                      value={industrySearchTerm}
                      onChange={(e) => setIndustrySearchTerm(e.target.value)}
                    />
                  </div>

                  {selectedIndustries.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-[#667085] mb-1">Selected Industries</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedIndustries.map((industry) => (
                          <span
                            key={industry}
                            className="bg-gray-100 text-[#344054] text-xs rounded-full px-2 py-0.5 flex items-center"
                          >
                            {industry}
                            <button
                              type="button"
                              onClick={() => toggleIndustry(industry)}
                              className="ml-1 text-[#98a2b3] hover:text-[#667085]"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {filteredIndustries.map((industry) => (
                      <div key={industry} className="flex items-center">
                        <Checkbox
                          id={`industry-${industry}`}
                          checked={selectedIndustries.includes(industry)}
                          onCheckedChange={() => toggleIndustry(industry)}
                          className="mr-2 border-[#d0d5dd]"
                        />
                        <Label htmlFor={`industry-${industry}`} className="text-[#344054] cursor-pointer">
                          {industry}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-[#667085] text-sm mb-1.5 block">Revenue Size Range ($)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Label htmlFor="revenueMin" className="text-[#667085] text-sm w-10">
                      Min
                    </Label>
                    <Input
                      id="revenueMin"
                      type="number"
                      className="border-[#d0d5dd]"
                      value={formData.targetCriteria.revenueMin || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "targetCriteria",
                          "revenueMin",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="revenueMax" className="text-[#667085] text-sm w-10">
                      Max
                    </Label>
                    <Input
                      id="revenueMax"
                      type="number"
                      className="border-[#d0d5dd]"
                      value={formData.targetCriteria.revenueMax || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "targetCriteria",
                          "revenueMax",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[#667085] text-sm mb-1.5 block">EBITDA Range ($)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Label htmlFor="ebitdaMin" className="text-[#667085] text-sm w-10">
                      Min
                    </Label>
                    <Input
                      id="ebitdaMin"
                      type="number"
                      className="border-[#d0d5dd]"
                      value={formData.targetCriteria.ebitdaMin || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "targetCriteria",
                          "ebitdaMin",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="ebitdaMax" className="text-[#667085] text-sm w-10">
                      Max
                    </Label>
                    <Input
                      id="ebitdaMax"
                      type="number"
                      className="border-[#d0d5dd]"
                      value={formData.targetCriteria.ebitdaMax || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "targetCriteria",
                          "ebitdaMax",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[#667085] text-sm mb-1.5 block">Transaction Size Range ($)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Label htmlFor="transactionSizeMin" className="text-[#667085] text-sm w-10">
                      Min
                    </Label>
                    <Input
                      id="transactionSizeMin"
                      type="number"
                      className="border-[#d0d5dd]"
                      value={formData.targetCriteria.transactionSizeMin || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "targetCriteria",
                          "transactionSizeMin",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="transactionSizeMax" className="text-[#667085] text-sm w-10">
                      Max
                    </Label>
                    <Input
                      id="transactionSizeMax"
                      type="number"
                      className="border-[#d0d5dd]"
                      value={formData.targetCriteria.transactionSizeMax || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "targetCriteria",
                          "transactionSizeMax",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
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
            <div className="space-y-4">
              <RadioGroup
                value={formData.targetCriteria.managementTeamPreference || ""}
                onValueChange={(value) => handleNestedChange("targetCriteria", "managementTeamPreference", value)}
              >
                {MANAGEMENT_PREFERENCES.map((preference) => (
                  <div key={preference} className="flex items-center space-x-2">
                    <RadioGroupItem value={preference} id={`preference-${preference}`} />
                    <Label htmlFor={`preference-${preference}`}>{preference}</Label>
                  </div>
                ))}
              </RadioGroup>
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

          {/* Terms and Agreements */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
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

              <div className="flex items-start space-x-2">
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

              <div className="flex items-start space-x-2">
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
        {/* Debug Information (only visible in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-medium mb-2">Debug Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>API URL:</strong> {apiUrl}
              </div>
              <div>
                <strong>Token Status:</strong> {authToken ? "Set" : "Not Set"}
                {authToken && (
                  <span className="ml-2 text-gray-500">(First 10 chars: {authToken.substring(0, 10)}...)</span>
                )}
              </div>
              <div>
                <strong>Buyer ID:</strong> {buyerId || "Not Set"}
              </div>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Current token:", authToken)
                    console.log("Current buyer ID:", buyerId)
                    toast({
                      title: "Auth Debug",
                      description: `Token: ${authToken ? "Set" : "Not Set"}, Buyer ID: ${buyerId || "Not Set"}`,
                    })
                  }}
                >
                  Test Auth
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
