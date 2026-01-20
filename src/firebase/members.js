import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  deleteDoc
} from 'firebase/firestore'
import { db, auth } from './config'
import { calculateTier } from '../utils/tiers'

const COLLECTION = 'members'

/**
 * Get the current user's ID (auth UID if logged in, visitor ID if not)
 */
export function getCurrentUserId() {
  // If user is authenticated, use their auth UID
  if (auth.currentUser) {
    return auth.currentUser.uid
  }
  // Otherwise, use the anonymous visitor ID
  return getVisitorId()
}

/**
 * Get or create visitor ID from localStorage (for anonymous users)
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
 * Migrate anonymous member data to authenticated user
 * Call this when a user logs in to merge their anonymous progress
 */
export async function migrateAnonymousData(authUid) {
  const visitorId = localStorage.getItem('kinderhooker_visitor_id')
  if (!visitorId) return null

  // Get anonymous member data
  const anonMember = await getMember(visitorId)
  if (!anonMember) return null

  // Get existing auth user member data
  const authMember = await getMember(authUid)

  if (authMember) {
    // Merge data - combine unique businesses
    const mergedBusinesses = [...new Set([
      ...(authMember.businessesVisited || []),
      ...(anonMember.businessesVisited || [])
    ])]
    const newTier = calculateTier(mergedBusinesses.length)

    await updateDoc(doc(db, COLLECTION, authUid), {
      businessesVisited: mergedBusinesses,
      totalCheckins: (authMember.totalCheckins || 0) + (anonMember.totalCheckins || 0),
      tier: newTier,
      lastCheckin: serverTimestamp()
    })

    // Delete anonymous record
    await deleteDoc(doc(db, COLLECTION, visitorId))

    return { merged: true, businessesVisited: mergedBusinesses, tier: newTier }
  } else {
    // No existing auth member data - migrate everything
    const newTier = calculateTier(anonMember.businessesVisited?.length || 0)

    await setDoc(doc(db, COLLECTION, authUid), {
      visitorId: authUid,
      tier: newTier,
      businessesVisited: anonMember.businessesVisited || [],
      totalCheckins: anonMember.totalCheckins || 0,
      createdAt: serverTimestamp(),
      lastCheckin: serverTimestamp(),
      email: auth.currentUser?.email || null,
      migratedFrom: visitorId
    })

    // Delete anonymous record
    await deleteDoc(doc(db, COLLECTION, visitorId))

    return { migrated: true, businessesVisited: anonMember.businessesVisited, tier: newTier }
  }
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
