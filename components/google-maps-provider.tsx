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
  const [attemptedLoad, setAttemptedLoad] = useState(false)

  useEffect(() => {
    // Skip if already loaded
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Skip if we've already attempted to load and failed
    if (attemptedLoad) {
      // Just use the fallback
      simulateMapLoading()
      return
    }

    // Skip if script is already being loaded
    if (scriptLoaded) {
      return
    }

    // Skip if script is already in the document
    const existingScript = document.querySelector('script[src*="maps/api/js"]')
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
        setAttemptedLoad(true)

        // Try to load directly from Google Maps if we have an API key
        const apiKey = process.env.NEXT_PUBLIC_GOMAPS_API_KEY

        if (apiKey) {
          const script = document.createElement("script")
          script.src = `https://maps.gomaps.pro/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`
          script.async = true
          script.defer = true

          // Define the callback function
          window.initMap = () => {
            setIsLoaded(true)
          }

          script.onerror = () => {
            console.error("Error loading Google Maps script directly")
            simulateMapLoading()
          }

          document.head.appendChild(script)
        } else {
          // No API key available, use fallback immediately
          console.warn("No Google Maps API key available, using fallback")
          simulateMapLoading()
        }
      } catch (err) {
        console.error("Error setting up GoMaps:", err)
        setError(err instanceof Error ? err : new Error("Unknown error loading GoMaps"))
        simulateMapLoading()
      }
    }

    // Function to simulate map loading for MVP
    function simulateMapLoading() {
      console.log("Using fallback map implementation")

      // Create a simulated maps object for the MVP
      window.google = window.google || {}
      window.google.maps = {
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
        // Add more mock implementations as needed
        places: {
          Autocomplete: () => ({
            addListener: () => {},
            getPlace: () => ({ geometry: { location: { lat: () => 0, lng: () => 0 } } }),
          }),
        },
        Geocoder: () => ({
          geocode: (request, callback) => {
            callback([{ geometry: { location: { lat: () => 0, lng: () => 0 } } }], "OK")
          },
        }),
        event: {
          addListener: () => {},
          removeListener: () => {},
        },
      }

      // Set loaded state to true
      setTimeout(() => {
        setIsLoaded(true)
      }, 500)
    }

    loadGoMaps()
  }, [scriptLoaded, attemptedLoad])

  return <GoMapsContext.Provider value={{ isLoaded, error }}>{children}</GoMapsContext.Provider>
}

// Add global type definition for GoMaps
declare global {
  interface Window {
    google?: any
    googleMapsError?: boolean
    initMap?: () => void
  }
}

