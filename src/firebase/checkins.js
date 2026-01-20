import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'checkins'
const COOLDOWN_MS = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Check if visitor has checked in at this business recently
 * Returns false if there's an error (allows checkin to proceed)
 */
export async function hasRecentCheckin(visitorId, businessCode) {
  try {
    const oneHourAgo = new Date(Date.now() - COOLDOWN_MS)

    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, COLLECTION),
      where('visitorId', '==', visitorId),
      where('businessCode', '==', businessCode)
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return false
    }

    // Check if any checkin was within the last hour
    for (const doc of snapshot.docs) {
      const data = doc.data()
      const checkinTime = data.timestamp?.toDate() || new Date(0)
      if (checkinTime > oneHourAgo) {
        return true
      }
    }

    return false
  } catch (err) {
    // If there's an index error or any other issue, allow checkin to proceed
    console.error('hasRecentCheckin error (allowing checkin):', err)
    return false
  }
}

/**
 * Record a check-in
 */
export async function recordCheckin(visitorId, businessCode, memberTier) {
  await addDoc(collection(db, COLLECTION), {
    visitorId,
    businessCode,
    timestamp: serverTimestamp(),
    kinderbucksMatched: false,
    boostApplied: 0,
    memberTier: memberTier || 'curious'
  })
}

/**
 * Get check-in stats for admin
 */
export async function getCheckinStats() {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return {
    total: snapshot.size
  }
}

/**
 * Get all check-ins for a specific business
 */
export async function getCheckinsByBusiness(businessCode) {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('businessCode', '==', businessCode)
    )

    const snapshot = await getDocs(q)
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Sort by timestamp client-side to avoid index requirement
    return results.sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || new Date(0)
      const timeB = b.timestamp?.toDate?.() || new Date(0)
      return timeB - timeA
    }).slice(0, 100)
  } catch (err) {
    console.error('getCheckinsByBusiness error:', err)
    return []
  }
}
