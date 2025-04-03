import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate risk zones data for MVP
    const riskZones = simulateRiskZones()

    return NextResponse.json({ riskZones })
  } catch (error) {
    console.error("Error fetching risk zones:", error)
    return NextResponse.json({ error: "Failed to fetch risk zones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    // Simulate Gemini API response for MVP
    const simulatedResponse = simulateGeminiResponse(query)

    return NextResponse.json(simulatedResponse)
  } catch (error) {
    console.error("Error fetching crime data:", error)
    return NextResponse.json({ error: "Failed to fetch crime data" }, { status: 500 })
  }
}

// Function to simulate risk zones for MVP
function simulateRiskZones() {
  return [
    {
      id: "1",
      area: "NH48 Highway",
      location: "Mumbai-Pune Expressway",
      riskLevel: "High",
      coordinates: { lat: 19.033, lng: 73.0297 },
      description: "Multiple theft incidents reported between 2-5 PM. Cargo types: electronics, machinery.",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "2",
      area: "Outer Ring Road",
      location: "Bangalore",
      riskLevel: "Medium",
      coordinates: { lat: 13.0827, lng: 77.5877 },
      description: "Incidents reported during night hours. Recommend avoiding after 10 PM.",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "3",
      area: "NH44 Junction",
      location: "Hyderabad-Vijayawada",
      riskLevel: "High",
      coordinates: { lat: 17.385, lng: 78.4867 },
      description: "High-value cargo thefts reported. Police checkpoints recommended.",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "4",
      area: "Industrial Zone",
      location: "Delhi-NCR",
      riskLevel: "Medium",
      coordinates: { lat: 28.6139, lng: 77.209 },
      description: "Incidents during early morning hours. Increased security recommended.",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "5",
      area: "Eastern Bypass",
      location: "Kolkata",
      riskLevel: "Low",
      coordinates: { lat: 22.5726, lng: 88.3639 },
      description: "Minor incidents reported. General caution advised.",
      lastUpdated: new Date().toISOString(),
    },
  ]
}

// Function to simulate Gemini API response for MVP
function simulateGeminiResponse(query) {
  // Generate a random risk zone based on the query
  const locations = {
    Mumbai: { lat: 19.076, lng: 72.8777 },
    Delhi: { lat: 28.6139, lng: 77.209 },
    Bangalore: { lat: 12.9716, lng: 77.5946 },
    Hyderabad: { lat: 17.385, lng: 78.4867 },
    Chennai: { lat: 13.0827, lng: 80.2707 },
    Kolkata: { lat: 22.5726, lng: 88.3639 },
    Pune: { lat: 18.5204, lng: 73.8567 },
    Jaipur: { lat: 26.9124, lng: 75.7873 },
    Ahmedabad: { lat: 23.0225, lng: 72.5714 },
    Surat: { lat: 21.1702, lng: 72.8311 },
  }

  const location = Object.keys(locations).find((loc) => query.includes(loc)) || "Mumbai"
  const coordinates = locations[location]

  const riskLevels = ["High", "Medium", "Low"]
  const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]

  const descriptions = [
    "Recent cargo theft reported in this area. Exercise caution.",
    "Multiple incidents of vehicle hijacking in the past month.",
    "Suspicious activity reported by drivers. Avoid night travel.",
    "Police checkpoint recommended due to recent incidents.",
    "Low visibility area with history of theft attempts.",
  ]

  return {
    riskZones: [
      {
        id: Date.now().toString(),
        area: `${location} Outskirts`,
        location: location,
        riskLevel: riskLevel,
        coordinates: coordinates,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        lastUpdated: new Date().toISOString(),
      },
    ],
  }
}

