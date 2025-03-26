"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function FuelEfficiencyChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted/20 rounded-md">
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            name="Standard Routes"
            dataKey="standard"
            stroke="hsl(var(--destructive))"
            fill="hsl(var(--destructive)/30)"
          />
          <Area
            type="monotone"
            name="AI Optimized Routes"
            dataKey="optimized"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary)/30)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const data = [
  {
    month: "Jan",
    standard: 1200,
    optimized: 1000,
  },
  {
    month: "Feb",
    standard: 1150,
    optimized: 920,
  },
  {
    month: "Mar",
    standard: 1300,
    optimized: 1050,
  },
  {
    month: "Apr",
    standard: 1400,
    optimized: 1100,
  },
  {
    month: "May",
    standard: 1350,
    optimized: 1020,
  },
  {
    month: "Jun",
    standard: 1500,
    optimized: 1150,
  },
]

