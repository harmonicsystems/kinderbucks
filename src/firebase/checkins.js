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

/**
 * Get all check-ins (for village-wide trends)
 */
export async function getAllCheckins() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('getAllCheckins error:', err)
    return []
  }
}

// ==================== MEMBER CHECK-IN STATS ====================

/**
 * Get all check-ins for a specific member
 */
export async function getMemberCheckins(memberId) {
  try {
    // Try memberId field first
    let q = query(
      collection(db, COLLECTION),
      where('memberId', '==', memberId)
    )
    let snapshot = await getDocs(q)

    // Also check visitorId field (legacy)
    if (snapshot.empty) {
      q = query(
        collection(db, COLLECTION),
        where('visitorId', '==', memberId)
      )
      snapshot = await getDocs(q)
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('getMemberCheckins error:', err)
    return []
  }
}

/**
 * Get member check-ins grouped by business
 * Returns: { [businessCode]: { count, lastCheckin, business } }
 */
export async function getMemberCheckinsByBusiness(memberId, businesses) {
  const checkins = await getMemberCheckins(memberId)

  // Group by business
  const grouped = {}
  for (const checkin of checkins) {
    const code = checkin.businessCode
    if (!grouped[code]) {
      grouped[code] = {
        count: 0,
        checkins: [],
        business: businesses.find(b => b.code === code) || { code, name: code }
      }
    }
    grouped[code].count++
    grouped[code].checkins.push(checkin)
  }

  // Sort checkins within each group and get last checkin
  for (const code of Object.keys(grouped)) {
    grouped[code].checkins.sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || new Date(0)
      const timeB = b.timestamp?.toDate?.() || new Date(0)
      return timeB - timeA
    })
    grouped[code].lastCheckin = grouped[code].checkins[0]?.timestamp
  }

  return grouped
}

/**
 * Get member check-ins grouped by category
 * Returns: { food: count, retail: count, services: count, arts: count }
 */
export async function getMemberCheckinsByCategory(memberId, businesses) {
  const checkins = await getMemberCheckins(memberId)

  // Create business code to category map
  const categoryMap = {}
  for (const biz of businesses) {
    categoryMap[biz.code] = biz.category || 'services'
  }

  // Count by category
  const counts = {
    food: 0,
    retail: 0,
    services: 0,
    arts: 0
  }

  for (const checkin of checkins) {
    const category = categoryMap[checkin.businessCode] || 'services'
    if (counts[category] !== undefined) {
      counts[category]++
    }
  }

  return counts
}

/**
 * Get member's progress toward rewards at a specific business
 */
export function getRewardProgress(checkinCount, loyaltyRewards = []) {
  if (!loyaltyRewards.length) return null

  // Sort rewards by checkinsRequired
  const sortedRewards = [...loyaltyRewards].sort((a, b) => a.checkinsRequired - b.checkinsRequired)

  // Find current reward (highest achieved)
  let currentReward = null
  let nextReward = null

  for (const reward of sortedRewards) {
    if (checkinCount >= reward.checkinsRequired) {
      currentReward = reward
    } else if (!nextReward) {
      nextReward = reward
    }
  }

  return {
    currentReward,
    nextReward,
    checkinsUntilNext: nextReward ? nextReward.checkinsRequired - checkinCount : 0,
    progress: nextReward ? (checkinCount / nextReward.checkinsRequired) * 100 : 100
  }
}
