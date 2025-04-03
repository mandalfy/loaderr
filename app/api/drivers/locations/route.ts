import { NextResponse } from "next/server"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    // Get driver locations from Firestore
    const driversSnapshot = await getDocs(collection(db, "drivers"))
    const drivers = driversSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ drivers })
  } catch (error) {
    console.error("Error fetching driver locations:", error)
    return NextResponse.json({ error: "Failed to fetch driver locations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { driverId, location } = await request.json()

    // Update driver location in Firestore
    // This would be implemented in a real app

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating driver location:", error)
    return NextResponse.json({ error: "Failed to update driver location" }, { status: 500 })
  }
}

