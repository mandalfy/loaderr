import { NextResponse } from "next/server"

// The API key provided by the user
const API_KEY = "AlzaSywHpvnIWhD15dSYpwZN6et-mT20KbFb6eT"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get("endpoint")
    const params = Object.fromEntries(searchParams.entries())

    // Remove our internal params
    delete params.endpoint

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint parameter is required" }, { status: 400 })
    }

    // Construct the GoMaps API URL
    const url = new URL(`https://maps.gomaps.pro/maps/api/${endpoint}/json`)

    // Add the API key
    url.searchParams.append("key", API_KEY)

    // Add all other parameters
    for (const [key, value] of Object.entries(params)) {
      if (key !== "key") {
        // Don't add key twice
        url.searchParams.append(key, value)
      }
    }

    console.log(`Proxying request to: ${url.toString()}`)

    // Set a timeout for the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`GoMaps API returned status: ${response.status}`)
      throw new Error(`GoMaps API returned status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in maps proxy:", error)
    return NextResponse.json({ error: "Failed to proxy request to GoMaps API" }, { status: 500 })
  }
}

