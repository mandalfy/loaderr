/**
 * Firebase Security Rules for Firestore
 *
 * These rules should be added to your Firebase console under Firestore Database > Rules
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Allow users to read and write their own orders
 *     match /orders/{orderId} {
 *       allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
 *       allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
 *     }
 *
 *     // Allow admin users to read and write all orders
 *     match /orders/{orderId} {
 *       allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
 *     }
 *
 *     // Allow users to read and write their own data
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *
 *     // Allow admin users to read all user data
 *     match /users/{userId} {
 *       allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
 *     }
 *
 *     // Allow all authenticated users to read driver data
 *     match /drivers/{driverId} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
 *     }
 *
 *     // Allow all authenticated users to read risk zones
 *     match /riskZones/{zoneId} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
 *     }
 *
 *     // Allow all authenticated users to read vehicle data
 *     match /vehicles/{vehicleId} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
 *     }
 *
 *     // Allow users to create their own profile on first login
 *     match /users/{userId} {
 *       allow create: if request.auth != null && request.auth.uid == userId;
 *     }
 *   }
 * }
 */

// This file is for documentation purposes only
export {}

