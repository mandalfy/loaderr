"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface FallbackMapProps {
  className?: string
  style?: React.CSSProperties
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{ lat: number; lng: number; title?: string }>
  circles?: Array<{ lat: number; lng: number; radius: number; color: string }>
  onMapLoad?: (map: any) => void
}

export function FallbackMap({
  className = "",
  style = {},
  center = { lat: 20.5937, lng: 78.9629 },
  zoom = 5,
  markers = [],
  circles = [],
  onMapLoad,
}: FallbackMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Draw a simple map background
    ctx.fillStyle = "#e8e8e8"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = "#d0d0d0"
    ctx.lineWidth = 1
    const gridSize = 30
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw markers
    markers.forEach((marker, index) => {
      // Convert geo coordinates to canvas coordinates (simplified)
      const x = canvas.width / 2 + (marker.lng - center.lng) * 20
      const y = canvas.height / 2 - (marker.lat - center.lat) * 20

      // Draw marker
      ctx.fillStyle = "#ff0000"
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fill()

      // Draw label
      ctx.fillStyle = "#000000"
      ctx.font = "12px Arial"
      ctx.fillText(marker.title || `Marker ${index + 1}`, x + 8, y + 4)
    })

    // Draw circles
    circles.forEach((circle) => {
      // Convert geo coordinates to canvas coordinates (simplified)
      const x = canvas.width / 2 + (circle.lng - center.lng) * 20
      const y = canvas.height / 2 - (circle.lat - center.lat) * 20

      // Scale radius (simplified)
      const radius = circle.radius / 1000

      // Draw circle
      ctx.fillStyle = circle.color + "40" // Add transparency
      ctx.strokeStyle = circle.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })

    // Notify that the map is loaded
    if (onMapLoad) {
      onMapLoad({
        canvas,
        center,
        zoom,
        addMarker: () => {}, // Stub methods
        addCircle: () => {},
      })
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [center, zoom, markers, circles, onMapLoad])

  return (
    <div className={`relative w-full h-full ${className}`} style={style}>
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 text-xs rounded shadow">
        Fallback Map (API Unavailable)
      </div>
    </div>
  )
}

