"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createContext, useContext } from "react"

type GoMapsContextType = {
  isLoaded: boolean
  error: Error | null
}

const GoMapsContext = createContext<GoMapsContextType>({
  isLoaded: false,
  error: null,
})

export const useGoMapsStatus = () => useContext(GoMapsContext)

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    // Check if we're on a page that needs Google Maps
    const pathname = window.location.pathname
    const mapsRequiredPaths = ["/dashboard", "/tracking", "/routes", "/risk-zones"]
    const needsMaps = mapsRequiredPaths.some((path) => pathname.startsWith(path))

    // Skip loading maps on pages that don't need it (like /auth)
    if (!needsMaps) {
      // Still set isLoaded to true so components don't show loading states
      setIsLoaded(true)
      return
    }

    // Skip if already loaded
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Skip if script is already being loaded
    if (scriptLoaded) {
      return
    }

    // Skip if script is already in the document
    const existingScript = document.querySelector('script[src*="/api/maps/proxy"]')
    if (existingScript) {
      const checkGoMaps = () => {
        if (window.google?.maps) {
          setIsLoaded(true)
        } else if (window.googleMapsError) {
          setError(new Error("Failed to load GoMaps API"))
          simulateMapLoading()
        } else {
          setTimeout(checkGoMaps, 100)
        }
      }
      checkGoMaps()
      return
    }

    const loadGoMaps = () => {
      try {
        setScriptLoaded(true)
        const script = document.createElement("script")
        // Use our proxy endpoint instead of directly accessing GoMaps
        script.src = `/api/maps/proxy?libraries=places&t=${Date.now()}` // Add timestamp to prevent caching
        script.async = true
        script.defer = true

        script.onload = () => {
          // Add a small delay to ensure the API is fully initialized
          setTimeout(() => {
            // Check if the script loaded successfully
            if (window.google?.maps) {
              setIsLoaded(true)
            } else {
              console.error("GoMaps script loaded but google.maps is not defined")
              setError(new Error("Failed to initialize GoMaps API"))
              // Simulate successful loading for MVP
              simulateMapLoading()
            }
          }, 200)
        }

        script.onerror = (e) => {
          console.error("GoMaps script loading error:", e)
          setError(new Error("Failed to load GoMaps API"))
          // Simulate successful loading for MVP
          simulateMapLoading()
        }

        document.head.appendChild(script)
      } catch (err) {
        console.error("Error setting up GoMaps:", err)
        setError(err instanceof Error ? err : new Error("Unknown error loading GoMaps"))
        // Simulate successful loading for MVP
        simulateMapLoading()
      }
    }

    // Function to simulate map loading for MVP
    const simulateMapLoading = () => {
      console.log("Falling back to simulated maps")
      // Create a simulated maps object for the MVP
      window.google = {
        maps: {
          Map: function (element, options) {
            this.element = element
            this.options = options
            this.setCenter = () => {}
            this.setZoom = () => {}
            this.fitBounds = () => {}
            this.addListener = (event, callback) => {}
            return this
          },
          Marker: function (options) {
            this.options = options
            this.setMap = () => {}
            this.addListener = (event, callback) => {}
            return this
          },
          Circle: function (options) {
            this.options = options
            this.setMap = () => {}
            this.addListener = (event, callback) => {}
            return this
          },
          InfoWindow: function (options) {
            this.options = options
            this.setPosition = () => {}
            this.open = () => {}
            this.close = () => {}
            return this
          },
          DirectionsRenderer: function (options) {
            this.options = options
            this.setMap = () => {}
            this.setDirections = () => {}
            return this
          },
          DirectionsService: function () {
            this.route = (request, callback) => {
              // Simulate a successful response
              callback(
                {
                  routes: [
                    {
                      legs: [
                        {
                          start_location: { lat: 0, lng: 0 },
                          end_location: { lat: 1, lng: 1 },
                        },
                      ],
                    },
                  ],
                },
                "OK",
              )
            }
            return this
          },
          LatLngBounds: function () {
            this.extend = () => this
            return this
          },
          Size: function (width, height) {
            this.width = width
            this.height = height
            return this
          },
          TravelMode: {
            DRIVING: "DRIVING",
          },
          DirectionsStatus: {
            OK: "OK",
          },
        },
      }

      // Set loaded state to true
      setTimeout(() => {
        setIsLoaded(true)
      }, 500)
    }

    loadGoMaps()
  }, [scriptLoaded])

  return <GoMapsContext.Provider value={{ isLoaded, error }}>{children}</GoMapsContext.Provider>
}

// Add global type definition for GoMaps
declare global {
  interface Window {
    google?: any
    googleMapsError?: boolean
  }
}

