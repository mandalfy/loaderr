"use client"

import { useState, useEffect } from "react"

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    const loadScript = () => {
      try {
        // Create the script element
        const script = document.createElement("script")
        script.src = `https://maps.gomaps.pro/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMap`
        script.async = true
        script.defer = true

        // Define the callback function
        window.initMap = () => {
          setIsLoaded(true)
        }

        // Handle errors
        script.onerror = () => {
          setError(new Error("Failed to load Google Maps API"))
        }

        // Append the script to the document
        document.head.appendChild(script)
      } catch (err) {
        setError(err)
      }
    }

    loadScript()

    // Cleanup function
    return () => {
      // Remove the global callback if the component unmounts before the script loads
      if (window.initMap) {
        delete window.initMap
      }
    }
  }, [])

  return { isLoaded, error }
}

// Add this to make TypeScript happy
declare global {
  interface Window {
    initMap?: () => void
    google?: {
      maps: any
    }
  }
}

