// Industry data structure
export interface Activity {
  name: string
  id: string
}

export interface SubIndustry {
  name: string
  id: string
  activities?: Activity[]
}

export interface Industry {
  name: string
  id: string
  subIndustries: SubIndustry[]
}

export interface IndustryGroup {
  name: string
  id: string
  industries: Industry[]
}

export interface Sector {
  name: string
  id: string
  industryGroups: IndustryGroup[]
}

export interface IndustryData {
  sectors: Sector[]
}

// Function to fetch industry data
export async function getIndustryData(): Promise<IndustryData> {
  // In a real application, this would be an API call
  // For now, we'll return the static data
  return {
    sectors: [
      {
        name: "Business Products & Services",
        id: "business-products-services",
        industryGroups: [
          {
            name: "Advertising, Marketing and Media",
            id: "advertising-marketing-media",
            industries: [
              {
                name: "Advertising, Marketing and Media",
                id: "advertising-marketing-media-industry",
                subIndustries: [
                  { name: "Advertising, Marketing and Media", id: "advertising-marketing-media-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Business & Professional Products",
            id: "business-professional-products",
            industries: [
              {
                name: "Business & Professional Products",
                id: "business-professional-products-industry",
                subIndustries: [
                  { name: "Business & Professional Products", id: "business-professional-products-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Business & Professional Services",
            id: "business-professional-services",
            industries: [
              {
                name: "Business & Professional Services",
                id: "business-professional-services-industry",
                subIndustries: [
                  { name: "Business & Professional Services", id: "business-professional-services-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Commercial Construction",
            id: "commercial-construction",
            industries: [
              {
                name: "Commercial Construction",
                id: "commercial-construction-industry",
                subIndustries: [{ name: "Commercial Construction", id: "commercial-construction-subindustry" }],
              },
            ],
          },
          {
            name: "Engineering Services",
            id: "engineering-services",
            industries: [
              {
                name: "Engineering Services",
                id: "engineering-services-industry",
                subIndustries: [{ name: "Engineering Services", id: "engineering-services-subindustry" }],
              },
            ],
          },
          {
            name: "Industrial Products",
            id: "industrial-products",
            industries: [
              {
                name: "Industrial Products",
                id: "industrial-products-industry",
                subIndustries: [{ name: "Industrial Products", id: "industrial-products-subindustry" }],
              },
            ],
          },
          {
            name: "Industrial Services",
            id: "industrial-services",
            industries: [
              {
                name: "Industrial Services",
                id: "industrial-services-industry",
                subIndustries: [{ name: "Industrial Services", id: "industrial-services-subindustry" }],
              },
            ],
          },
          {
            name: "Staffing and Recruiting",
            id: "staffing-recruiting",
            industries: [
              {
                name: "Staffing and Recruiting",
                id: "staffing-recruiting-industry",
                subIndustries: [{ name: "Staffing and Recruiting", id: "staffing-recruiting-subindustry" }],
              },
            ],
          },
          {
            name: "Warehousing, Transportation, Logistics",
            id: "warehousing-transportation-logistics",
            industries: [
              {
                name: "Warehousing, Transportation, Logistics",
                id: "warehousing-transportation-logistics-industry",
                subIndustries: [
                  {
                    name: "Warehousing, Transportation, Logistics",
                    id: "warehousing-transportation-logistics-subindustry",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "Materials & Resources",
        id: "materials-resources",
        industryGroups: [
          {
            name: "Agriculture/Fishing",
            id: "agriculture-fishing",
            industries: [
              {
                name: "Agriculture/Fishing",
                id: "agriculture-fishing-industry",
                subIndustries: [{ name: "Agriculture/Fishing", id: "agriculture-fishing-subindustry" }],
              },
            ],
          },
          {
            name: "Automotive Resources",
            id: "automotive-resources",
            industries: [
              {
                name: "Automotive Resources",
                id: "automotive-resources-industry",
                subIndustries: [{ name: "Automotive Resources", id: "automotive-resources-subindustry" }],
              },
            ],
          },
          {
            name: "Aviation and Aeronautical Resources",
            id: "aviation-aeronautical-resources",
            industries: [
              {
                name: "Aviation and Aeronautical Resources",
                id: "aviation-aeronautical-resources-industry",
                subIndustries: [
                  { name: "Aviation and Aeronautical Resources", id: "aviation-aeronautical-resources-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Chemicals and Gases",
            id: "chemicals-gases",
            industries: [
              {
                name: "Chemicals and Gases",
                id: "chemicals-gases-industry",
                subIndustries: [{ name: "Chemicals and Gases", id: "chemicals-gases-subindustry" }],
              },
            ],
          },
          {
            name: "Construction Materials",
            id: "construction-materials",
            industries: [
              {
                name: "Construction Materials",
                id: "construction-materials-industry",
                subIndustries: [{ name: "Construction Materials", id: "construction-materials-subindustry" }],
              },
            ],
          },
          {
            name: "Containers and Packaging",
            id: "containers-packaging",
            industries: [
              {
                name: "Containers and Packaging",
                id: "containers-packaging-industry",
                subIndustries: [{ name: "Containers and Packaging", id: "containers-packaging-subindustry" }],
              },
            ],
          },
          {
            name: "Forestry",
            id: "forestry",
            industries: [
              {
                name: "Forestry",
                id: "forestry-industry",
                subIndustries: [{ name: "Forestry", id: "forestry-subindustry" }],
              },
            ],
          },
          {
            name: "Metals, Minerals, and Mining",
            id: "metals-minerals-mining",
            industries: [
              {
                name: "Metals, Minerals, and Mining",
                id: "metals-minerals-mining-industry",
                subIndustries: [{ name: "Metals, Minerals, and Mining", id: "metals-minerals-mining-subindustry" }],
              },
            ],
          },
          {
            name: "Other Materials",
            id: "other-materials",
            industries: [
              {
                name: "Other Materials",
                id: "other-materials-industry",
                subIndustries: [{ name: "Other Materials", id: "other-materials-subindustry" }],
              },
            ],
          },
          {
            name: "Textiles",
            id: "textiles",
            industries: [
              {
                name: "Textiles",
                id: "textiles-industry",
                subIndustries: [{ name: "Textiles", id: "textiles-subindustry" }],
              },
            ],
          },
          {
            name: "Water and Wastewater",
            id: "water-wastewater",
            industries: [
              {
                name: "Water and Wastewater",
                id: "water-wastewater-industry",
                subIndustries: [{ name: "Water and Wastewater", id: "water-wastewater-subindustry" }],
              },
            ],
          },
        ],
      },
      {
        name: "Consumer Products & Services",
        id: "consumer-products-services",
        industryGroups: [
          {
            name: "Apparel and Accessories",
            id: "apparel-accessories",
            industries: [
              {
                name: "Apparel and Accessories",
                id: "apparel-accessories-industry",
                subIndustries: [{ name: "Apparel and Accessories", id: "apparel-accessories-subindustry" }],
              },
            ],
          },
          {
            name: "Consumer Durables",
            id: "consumer-durables",
            industries: [
              {
                name: "Consumer Durables",
                id: "consumer-durables-industry",
                subIndustries: [{ name: "Consumer Durables", id: "consumer-durables-subindustry" }],
              },
            ],
          },
          {
            name: "Consumer Non-Durables",
            id: "consumer-non-durables",
            industries: [
              {
                name: "Consumer Non-Durables",
                id: "consumer-non-durables-industry",
                subIndustries: [{ name: "Consumer Non-Durables", id: "consumer-non-durables-subindustry" }],
              },
            ],
          },
          {
            name: "Consumer Services (Non-Financial)",
            id: "consumer-services-non-financial",
            industries: [
              {
                name: "Consumer Services (Non-Financial)",
                id: "consumer-services-non-financial-industry",
                subIndustries: [
                  { name: "Consumer Services (Non-Financial)", id: "consumer-services-non-financial-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Consumer Transportation",
            id: "consumer-transportation",
            industries: [
              {
                name: "Consumer Transportation",
                id: "consumer-transportation-industry",
                subIndustries: [{ name: "Consumer Transportation", id: "consumer-transportation-subindustry" }],
              },
            ],
          },
          {
            name: "Education",
            id: "education",
            industries: [
              {
                name: "Education",
                id: "education-industry",
                subIndustries: [{ name: "Education", id: "education-subindustry" }],
              },
            ],
          },
          {
            name: "Food & Beverage",
            id: "food-beverage",
            industries: [
              {
                name: "Food & Beverage",
                id: "food-beverage-industry",
                subIndustries: [{ name: "Food & Beverage", id: "food-beverage-subindustry" }],
              },
            ],
          },
          {
            name: "Hotels and Leisure",
            id: "hotels-leisure",
            industries: [
              {
                name: "Hotels and Leisure",
                id: "hotels-leisure-industry",
                subIndustries: [{ name: "Hotels and Leisure", id: "hotels-leisure-subindustry" }],
              },
            ],
          },
          {
            name: "Residential Construction",
            id: "residential-construction",
            industries: [
              {
                name: "Residential Construction",
                id: "residential-construction-industry",
                subIndustries: [{ name: "Residential Construction", id: "residential-construction-subindustry" }],
              },
            ],
          },
        ],
      },
      {
        name: "Financial Services",
        id: "financial-services",
        industryGroups: [
          {
            name: "Capital Markets",
            id: "capital-markets",
            industries: [
              {
                name: "Capital Markets",
                id: "capital-markets-industry",
                subIndustries: [{ name: "Capital Markets", id: "capital-markets-subindustry" }],
              },
            ],
          },
          {
            name: "Commercial Banks",
            id: "commercial-banks",
            industries: [
              {
                name: "Commercial Banks",
                id: "commercial-banks-industry",
                subIndustries: [{ name: "Commercial Banks", id: "commercial-banks-subindustry" }],
              },
            ],
          },
          {
            name: "Insurance",
            id: "insurance",
            industries: [
              {
                name: "Insurance",
                id: "insurance-industry",
                subIndustries: [{ name: "Insurance", id: "insurance-subindustry" }],
              },
            ],
          },
          {
            name: "Other Financial Services",
            id: "other-financial-services",
            industries: [
              {
                name: "Other Financial Services",
                id: "other-financial-services-industry",
                subIndustries: [{ name: "Other Financial Services", id: "other-financial-services-subindustry" }],
              },
            ],
          },
        ],
      },
      {
        name: "Information Technology",
        id: "information-technology",
        industryGroups: [
          {
            name: "Communications and Networking",
            id: "communications-networking",
            industries: [
              {
                name: "Communications and Networking",
                id: "communications-networking-industry",
                subIndustries: [{ name: "Communications and Networking", id: "communications-networking-subindustry" }],
              },
            ],
          },
          {
            name: "Computer Hardware",
            id: "computer-hardware",
            industries: [
              {
                name: "Computer Hardware",
                id: "computer-hardware-industry",
                subIndustries: [{ name: "Computer Hardware", id: "computer-hardware-subindustry" }],
              },
            ],
          },
          {
            name: "IT Services",
            id: "it-services",
            industries: [
              {
                name: "IT Services",
                id: "it-services-industry",
                subIndustries: [{ name: "IT Services", id: "it-services-subindustry" }],
              },
            ],
          },
          {
            name: "Other Information Technology",
            id: "other-information-technology",
            industries: [
              {
                name: "Other Information Technology",
                id: "other-information-technology-industry",
                subIndustries: [
                  { name: "Other Information Technology", id: "other-information-technology-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Semiconductors",
            id: "semiconductors",
            industries: [
              {
                name: "Semiconductors",
                id: "semiconductors-industry",
                subIndustries: [{ name: "Semiconductors", id: "semiconductors-subindustry" }],
              },
            ],
          },
          {
            name: "Software",
            id: "software",
            industries: [
              {
                name: "Software",
                id: "software-industry",
                subIndustries: [{ name: "Software", id: "software-subindustry" }],
              },
            ],
          },
        ],
      },
      {
        name: "Energy",
        id: "energy",
        industryGroups: [
          {
            name: "Energy Equipment",
            id: "energy-equipment",
            industries: [
              {
                name: "Energy Equipment",
                id: "energy-equipment-industry",
                subIndustries: [{ name: "Energy Equipment", id: "energy-equipment-subindustry" }],
              },
            ],
          },
          {
            name: "Energy Services",
            id: "energy-services",
            industries: [
              {
                name: "Energy Services",
                id: "energy-services-industry",
                subIndustries: [{ name: "Energy Services", id: "energy-services-subindustry" }],
              },
            ],
          },
          {
            name: "Exploration, Production, and Refining",
            id: "exploration-production-refining",
            industries: [
              {
                name: "Exploration, Production, and Refining",
                id: "exploration-production-refining-industry",
                subIndustries: [
                  { name: "Exploration, Production, and Refining", id: "exploration-production-refining-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Other Energy",
            id: "other-energy",
            industries: [
              {
                name: "Other Energy",
                id: "other-energy-industry",
                subIndustries: [{ name: "Other Energy", id: "other-energy-subindustry" }],
              },
            ],
          },
          {
            name: "Utilities",
            id: "utilities",
            industries: [
              {
                name: "Utilities",
                id: "utilities-industry",
                subIndustries: [{ name: "Utilities", id: "utilities-subindustry" }],
              },
            ],
          },
        ],
      },
      {
        name: "Healthcare",
        id: "healthcare",
        industryGroups: [
          {
            name: "Healthcare Devices and Supplies",
            id: "healthcare-devices-supplies",
            industries: [
              {
                name: "Healthcare Devices and Supplies",
                id: "healthcare-devices-supplies-industry",
                subIndustries: [
                  { name: "Healthcare Devices and Supplies", id: "healthcare-devices-supplies-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Healthcare Services",
            id: "healthcare-services",
            industries: [
              {
                name: "Healthcare Services",
                id: "healthcare-services-industry",
                subIndustries: [{ name: "Healthcare Services", id: "healthcare-services-subindustry" }],
              },
            ],
          },
          {
            name: "Healthcare Technology",
            id: "healthcare-technology",
            industries: [
              {
                name: "Healthcare Technology",
                id: "healthcare-technology-industry",
                subIndustries: [{ name: "Healthcare Technology", id: "healthcare-technology-subindustry" }],
              },
            ],
          },
          {
            name: "Other Healthcare",
            id: "other-healthcare",
            industries: [
              {
                name: "Other Healthcare",
                id: "other-healthcare-industry",
                subIndustries: [{ name: "Other Healthcare", id: "other-healthcare-subindustry" }],
              },
            ],
          },
          {
            name: "Pharmaceuticals and Biotechnology",
            id: "pharmaceuticals-biotechnology",
            industries: [
              {
                name: "Pharmaceuticals and Biotechnology",
                id: "pharmaceuticals-biotechnology-industry",
                subIndustries: [
                  { name: "Pharmaceuticals and Biotechnology", id: "pharmaceuticals-biotechnology-subindustry" },
                ],
              },
            ],
          },
          {
            name: "Wellness, Supplements, Nutraceuticals",
            id: "wellness-supplements-nutraceuticals",
            industries: [
              {
                name: "Wellness, Supplements, Nutraceuticals",
                id: "wellness-supplements-nutraceuticals-industry",
                subIndustries: [
                  {
                    name: "Wellness, Supplements, Nutraceuticals",
                    id: "wellness-supplements-nutraceuticals-subindustry",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}
