import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './config'
import { calculateTier } from '../utils/tiers'

const COLLECTION = 'members'

/**
 * Get or create visitor ID from localStorage
 */
export function getVisitorId() {
  let visitorId = localStorage.getItem('kinderhooker_visitor_id')
  if (!visitorId) {
    visitorId = 'anon_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('kinderhooker_visitor_id', visitorId)
  }
  return visitorId
}

/**
 * Get member profile by visitor ID
 */
export async function getMember(visitorId) {
  const docRef = doc(db, COLLECTION, visitorId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { visitorId: docSnap.id, ...docSnap.data() }
  }
  return null
}

/**
 * Create or update member after check-in
 */
export async function updateMemberCheckin(visitorId, businessCode) {
  const docRef = doc(db, COLLECTION, visitorId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    // Update existing member
    const data = docSnap.data()
    const businessesVisited = data.businessesVisited || []
    const isNewBusiness = !businessesVisited.includes(businessCode)
    const newCount = isNewBusiness ? businessesVisited.length + 1 : businessesVisited.length
    const newTier = calculateTier(newCount)
    const tierChanged = newTier !== data.tier

    await updateDoc(docRef, {
      businessesVisited: arrayUnion(businessCode),
      totalCheckins: increment(1),
      tier: newTier,
      lastCheckin: serverTimestamp()
    })

    return {
      isNewBusiness,
      tierChanged,
      oldTier: data.tier,
      newTier,
      businessesVisited: isNewBusiness ? [...businessesVisited, businessCode] : businessesVisited,
      totalCheckins: (data.totalCheckins || 0) + 1
    }
  } else {
    // Create new member
    const newTier = calculateTier(1)
    await setDoc(docRef, {
      visitorId,
      tier: newTier,
      businessesVisited: [businessCode],
      totalCheckins: 1,
      createdAt: serverTimestamp(),
      lastCheckin: serverTimestamp(),
      email: null
    })

    return {
      isNewBusiness: true,
      tierChanged: true,
      oldTier: null,
      newTier,
      businessesVisited: [businessCode],
      totalCheckins: 1
    }
  }
}
