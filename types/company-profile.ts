export interface Contact {
  name: string
  email: string
  phone: string
}

export interface Preferences {
  stopSendingDeals: boolean
  dontShowMyDeals: boolean
  dontSendDealsToMyCompetitors: boolean
  allowBuyerLikeDeals: boolean
}

export interface TargetCriteria {
  countries: string[]
  industrySectors: string[]
  revenueMin?: number
  revenueMax?: number
  ebitdaMin?: number
  ebitdaMax?: number
  transactionSizeMin?: number
  transactionSizeMax?: number
  revenueGrowth?: number
  minStakePercent?: number
  minYearsInBusiness?: number
  preferredBusinessModels: string[]
  managementTeamPreference: string[]
  description?: string
}

export interface Agreements {
  termsAndConditionsAccepted: boolean
  ndaAccepted: boolean
  feeAgreementAccepted: boolean
}

export interface CompanyProfile {
  companyName: string
  website: string
  contacts: Contact[]
  companyType: string
  capitalEntity: string
  dealsCompletedLast5Years?: number
  averageDealSize?: number
  preferences: Preferences
  targetCriteria: TargetCriteria
  agreements: Agreements
  buyer?: string
}
