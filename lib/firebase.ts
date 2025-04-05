import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return (
    typeof process !== "undefined" &&
    !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}

// Initialize Firebase
let app = null
let auth = null
let db = null
let storage = null
let googleProvider = null

// Only initialize if we're in a browser environment
if (typeof window !== "undefined") {
  try {
    if (isFirebaseConfigured()) {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig)
      } else {
        app = getApp()
      }

      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
      googleProvider = new GoogleAuthProvider()

      // Configure Google provider
      googleProvider.setCustomParameters({
        prompt: "select_account",
      })
    } else {
      console.warn("Firebase configuration is incomplete. Using demo mode.")
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
}

export { app, db, auth, storage, googleProvider }

