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
  orderBy,
  where
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'businesses'
const CHECKINS_COLLECTION = 'checkins'
const TRANSACTIONS_COLLECTION = 'transactions'

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
 * Get all businesses (excludes soft-deleted by default)
 * @param {boolean} includeDeleted - Include soft-deleted businesses
 */
export async function getAllBusinesses(includeDeleted = false) {
  const q = query(collection(db, COLLECTION), orderBy('name'))
  const snapshot = await getDocs(q)
  const businesses = snapshot.docs.map(doc => ({ code: doc.id, ...doc.data() }))

  if (includeDeleted) {
    return businesses
  }
  return businesses.filter(b => !b.isDeleted)
}

/**
 * Get only soft-deleted businesses (for admin restore UI)
 */
export async function getDeletedBusinesses() {
  const all = await getAllBusinesses(true)
  return all.filter(b => b.isDeleted)
}

/**
 * Create a new business
 * @param {string} code - Unique business code
 * @param {string} name - Business name
 * @param {string} category - Category (food, retail, services, arts)
 * @param {object} extras - Optional extra fields (address, placeId, phone, website)
 */
export async function createBusiness(code, name, category, extras = {}) {
  const data = {
    code,
    name,
    category,
    isActive: true,
    checkinCount: 0,
    createdAt: serverTimestamp()
  }

  // Add optional fields if provided
  if (extras.address) data.address = extras.address
  if (extras.placeId) data.placeId = extras.placeId
  if (extras.phone) data.phone = extras.phone
  if (extras.website) data.website = extras.website
  if (extras.photoUrl) data.photoUrl = extras.photoUrl

  await setDoc(doc(db, COLLECTION, code), data)
}

/**
 * Check if a business has any associated data that should prevent deletion
 * Returns an object with counts and whether deletion is safe
 */
export async function getBusinessDeletionInfo(code) {
  const business = await getBusiness(code)
  if (!business) {
    return { exists: false, canDelete: false, reason: 'Business not found' }
  }

  // Check check-ins
  const checkinsQuery = query(
    collection(db, CHECKINS_COLLECTION),
    where('businessCode', '==', code)
  )
  const checkinsSnap = await getDocs(checkinsQuery)
  const checkinCount = checkinsSnap.size

  // Check transactions
  const txnQuery = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('businessCode', '==', code)
  )
  const txnSnap = await getDocs(txnQuery)
  const transactionCount = txnSnap.size

  // Check balance
  const balance = business.kinderbucksBalance || 0

  const hasData = checkinCount > 0 || transactionCount > 0 || balance > 0

  return {
    exists: true,
    code,
    name: business.name,
    checkinCount,
    transactionCount,
    balance,
    hasData,
    canSafeDelete: !hasData,
    reason: hasData
      ? `Has ${checkinCount} check-ins, ${transactionCount} transactions, $${balance} balance`
      : 'No associated data'
  }
}

/**
 * Soft delete a business (marks as deleted, doesn't remove data)
 * @param {string} code - Business code
 * @param {string} deletedBy - UID of user performing deletion
 * @param {boolean} force - Force delete even if business has data (still soft delete)
 */
export async function deleteBusiness(code, deletedBy = null, force = false) {
  const info = await getBusinessDeletionInfo(code)

  if (!info.exists) {
    throw new Error('Business not found')
  }

  if (info.hasData && !force) {
    throw new Error(`Cannot delete: ${info.reason}. Use force=true to soft delete anyway.`)
  }

  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: deletedBy,
    isActive: false // Also deactivate
  })

  return { success: true, wasForced: info.hasData && force }
}

/**
 * Restore a soft-deleted business
 */
export async function restoreBusiness(code) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    restoredAt: serverTimestamp()
  })
}

/**
 * Permanently delete a business (use with caution - only for businesses with no data)
 */
export async function permanentlyDeleteBusiness(code) {
  const info = await getBusinessDeletionInfo(code)

  if (info.hasData) {
    throw new Error(`Cannot permanently delete: ${info.reason}`)
  }

  const { deleteDoc: firebaseDeleteDoc } = await import('firebase/firestore')
  await firebaseDeleteDoc(doc(db, COLLECTION, code))
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

/**
 * Get business with KB balance fields
 * Returns business with kinderbucksBalance, lifetimeAccepted, lifetimeRedeemed
 */
export async function getBusinessWithBalance(code) {
  const business = await getBusiness(code)
  if (!business) return null

  return {
    ...business,
    kinderbucksBalance: business.kinderbucksBalance || 0,
    lifetimeAccepted: business.lifetimeAccepted || 0,
    lifetimeRedeemed: business.lifetimeRedeemed || 0
  }
}

/**
 * Initialize KB balance fields for a business (if not already set)
 */
export async function initializeBusinessKBFields(code) {
  const docRef = doc(db, COLLECTION, code)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const data = docSnap.data()
    if (data.kinderbucksBalance === undefined) {
      await updateDoc(docRef, {
        kinderbucksBalance: 0,
        lifetimeAccepted: 0,
        lifetimeRedeemed: 0
      })
    }
  }
}

/**
 * Update business photo URL
 */
export async function updateBusinessPhoto(code, photoUrl) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    photoUrl,
    photoUpdatedAt: serverTimestamp()
  })
}

// ==================== OK MEMBER DISCOUNTS ====================

/**
 * OK Member Discount schema:
 * {
 *   okMemberDiscount: string (e.g., "10% off", "Free drink with purchase"),
 *   kinderbucksSpecials: [
 *     { amount: number, description: string }
 *   ]
 * }
 */

/**
 * Update business OK Member discount
 */
export async function updateBusinessOKDiscount(code, okMemberDiscount) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    okMemberDiscount,
    discountUpdatedAt: serverTimestamp()
  })
}

/**
 * Update business Kinderbucks specials
 */
export async function updateBusinessKBSpecials(code, kinderbucksSpecials) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    kinderbucksSpecials,
    specialsUpdatedAt: serverTimestamp()
  })
}

/**
 * Get business with discount info
 */
export async function getBusinessWithDiscounts(code) {
  const business = await getBusiness(code)
  if (!business) return null

  return {
    ...business,
    okMemberDiscount: business.okMemberDiscount || null,
    kinderbucksSpecials: business.kinderbucksSpecials || []
  }
}

// ==================== LOYALTY REWARDS ====================

/**
 * Loyalty reward tier schema:
 * {
 *   checkinsRequired: number,
 *   reward: string (description),
 *   rewardType: 'discount' | 'freeItem' | 'credit',
 *   rewardValue: number (percentage for discount, or item value)
 * }
 */

/**
 * Update business loyalty rewards configuration
 */
export async function updateBusinessLoyaltyRewards(code, rewards) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    loyaltyRewards: rewards,
    loyaltyUpdatedAt: serverTimestamp()
  })
}

/**
 * Get business with loyalty rewards
 */
export async function getBusinessWithRewards(code) {
  const business = await getBusiness(code)
  if (!business) return null

  return {
    ...business,
    loyaltyRewards: business.loyaltyRewards || []
  }
}

// ==================== CROSS-BUSINESS REWARDS ====================

/**
 * Cross-business reward schema:
 * {
 *   id: string (unique ID),
 *   partnerBusiness: string (businessCode where activity is required),
 *   requiredCheckins: number (check-ins needed at partner),
 *   reward: string (description of what they get),
 *   rewardType: 'discount' | 'freeItem' | 'credit',
 *   rewardValue: number (percentage for discount, or item value),
 *   isActive: boolean
 * }
 */

/**
 * Update business cross-rewards configuration
 * These are rewards THIS business offers to customers who visit partner businesses
 */
export async function updateBusinessCrossRewards(code, crossRewards) {
  const docRef = doc(db, COLLECTION, code)
  await updateDoc(docRef, {
    crossRewards: crossRewards,
    crossRewardsUpdatedAt: serverTimestamp()
  })
}

/**
 * Get all cross-rewards across all businesses
 * Returns array of { offeringBusiness, partnerBusiness, reward details }
 */
export async function getAllCrossRewards() {
  const businesses = await getAllBusinesses()
  const allRewards = []

  for (const biz of businesses) {
    if (biz.crossRewards && biz.crossRewards.length > 0) {
      for (const reward of biz.crossRewards) {
        if (reward.isActive) {
          allRewards.push({
            ...reward,
            offeringBusiness: biz.code,
            offeringBusinessName: biz.name
          })
        }
      }
    }
  }

  return allRewards
}

/**
 * Get cross-rewards that a member can earn based on their check-in history
 * Returns rewards with progress info
 */
export async function getCrossRewardsForMember(memberId, memberCheckinsByBusiness) {
  const allRewards = await getAllCrossRewards()
  const businesses = await getAllBusinesses()
  const bizMap = Object.fromEntries(businesses.map(b => [b.code, b]))

  return allRewards.map(reward => {
    const partnerCheckins = memberCheckinsByBusiness[reward.partnerBusiness]?.count || 0
    const isUnlocked = partnerCheckins >= reward.requiredCheckins
    const progress = Math.min(100, (partnerCheckins / reward.requiredCheckins) * 100)

    return {
      ...reward,
      partnerBusinessName: bizMap[reward.partnerBusiness]?.name || reward.partnerBusiness,
      currentCheckins: partnerCheckins,
      isUnlocked,
      progress,
      checkinsRemaining: Math.max(0, reward.requiredCheckins - partnerCheckins)
    }
  })
}
