import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'businesses'

/**
 * Get a single business by code
 */
export async function getBusiness(code) {
  const docRef = doc(db, COLLECTION, code)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { code: docSnap.id, ...docSnap.data() }
  }
  return null
}

/**
 * Get all businesses
 */
export async function getAllBusinesses() {
  const q = query(collection(db, COLLECTION), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ code: doc.id, ...doc.data() }))
}

/**
 * Create a new business
 */
export async function createBusiness(code, name, category) {
  await setDoc(doc(db, COLLECTION, code), {
    code,
    name,
    category,
    isActive: true,
    checkinCount: 0,
    createdAt: serverTimestamp()
  })
}

/**
 * Increment business check-in count
 */
export async function incrementBusinessCheckins(code) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    checkinCount: increment(1)
  })
}

/**
 * Toggle business active status
 */
export async function toggleBusinessActive(code, isActive) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, { isActive })
}

/**
 * Update business location and details
 */
export async function updateBusinessDetails(code, details) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, details)
}

/**
 * Get all active businesses with location data
 */
export async function getActiveBusinessesWithLocations() {
  const businesses = await getAllBusinesses()
  return businesses.filter(b => b.isActive && b.location)
}
