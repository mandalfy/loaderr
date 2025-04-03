// This file is deprecated and should not be used anymore.
// Use the useGoogleMaps hook instead.
// Keeping this file to avoid breaking existing imports.

export function loadGoogleMapsAPI(): Promise<void> {
  console.warn("loadGoogleMapsAPI is deprecated. Use the useGoogleMaps hook instead.")

  // Return a promise that resolves when Google Maps is loaded
  return new Promise((resolve) => {
    // Just resolve immediately since we're using the GoogleMapsProvider now
    resolve()
  })
}

