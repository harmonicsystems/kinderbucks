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
 */
export async function hasRecentCheckin(visitorId, businessCode) {
  const oneHourAgo = new Date(Date.now() - COOLDOWN_MS)

  const q = query(
    collection(db, COLLECTION),
    where('visitorId', '==', visitorId),
    where('businessCode', '==', businessCode),
    orderBy('timestamp', 'desc'),
    limit(1)
  )

  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return false
  }

  const lastCheckin = snapshot.docs[0].data()
  const lastCheckinTime = lastCheckin.timestamp?.toDate() || new Date(0)

  return lastCheckinTime > oneHourAgo
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
