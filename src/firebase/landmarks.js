import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'landmarks'

/**
 * Landmark schema:
 * {
 *   code: string (unique ID, e.g., "VAN-BUREN-SITE"),
 *   name: string,
 *   description: string,
 *   category: 'historic' | 'nature' | 'art' | 'scenic' | 'trail',
 *   location: { lat: number, lng: number },
 *   address: string,
 *   photoUrl: string (optional),
 *   isActive: boolean,
 *   scanCount: number,
 *   createdAt: timestamp
 * }
 */

/**
 * Get a single landmark by code
 */
export async function getLandmark(code) {
  const docRef = doc(db, COLLECTION, code)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { code: docSnap.id, ...docSnap.data() }
  }
  return null
}

/**
 * Get all landmarks
 */
export async function getAllLandmarks(includeInactive = false) {
  const q = query(collection(db, COLLECTION), orderBy('name'))
  const snapshot = await getDocs(q)
  const landmarks = snapshot.docs.map(doc => ({ code: doc.id, ...doc.data() }))

  if (includeInactive) {
    return landmarks
  }
  return landmarks.filter(l => l.isActive)
}

/**
 * Get landmarks by category
 */
export async function getLandmarksByCategory(category) {
  const q = query(
    collection(db, COLLECTION),
    where('category', '==', category),
    where('isActive', '==', true)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ code: doc.id, ...doc.data() }))
}

/**
 * Create a new landmark
 */
export async function createLandmark(code, data) {
  const landmarkData = {
    code,
    name: data.name,
    description: data.description || '',
    category: data.category || 'scenic',
    location: data.location || null,
    address: data.address || '',
    photoUrl: data.photoUrl || null,
    isActive: true,
    scanCount: 0,
    createdAt: serverTimestamp()
  }

  await setDoc(doc(db, COLLECTION, code), landmarkData)
  return landmarkData
}

/**
 * Update a landmark
 */
export async function updateLandmark(code, updates) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a landmark
 */
export async function deleteLandmark(code) {
  await deleteDoc(doc(db, COLLECTION, code))
}

/**
 * Increment landmark scan count
 */
export async function incrementLandmarkScans(code) {
  const { increment } = await import('firebase/firestore')
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    scanCount: increment(1),
    lastScanned: serverTimestamp()
  })
}

// ==================== LANDMARK CATEGORIES ====================

export const LANDMARK_CATEGORIES = {
  historic: {
    name: 'Historic',
    color: '#8B4513',
    description: 'Historic sites and markers'
  },
  nature: {
    name: 'Nature',
    color: '#228B22',
    description: 'Parks, trails, and natural areas'
  },
  art: {
    name: 'Public Art',
    color: '#9932CC',
    description: 'Sculptures, murals, and installations'
  },
  scenic: {
    name: 'Scenic',
    color: '#4169E1',
    description: 'Viewpoints and photo spots'
  },
  trail: {
    name: 'Rail Trail',
    color: '#CD853F',
    description: 'Rail trail markers and access points'
  }
}
