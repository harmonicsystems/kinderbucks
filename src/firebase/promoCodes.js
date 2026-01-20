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
  where,
  orderBy
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'promoCodes'

/**
 * Get all promo codes for a business
 */
export async function getBusinessPromoCodes(businessCode) {
  const q = query(
    collection(db, COLLECTION),
    where('businessCode', '==', businessCode),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Create a new promo code
 */
export async function createPromoCode({
  businessCode,
  code,
  description,
  discountType, // 'percent' or 'fixed'
  discountValue,
  minTier, // minimum member tier required
  expiresAt,
  usageLimit,
}) {
  const promoId = `${businessCode}-${code.toUpperCase()}`
  await setDoc(doc(db, COLLECTION, promoId), {
    businessCode,
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minTier: minTier || null,
    expiresAt: expiresAt || null,
    usageLimit: usageLimit || null,
    usageCount: 0,
    isActive: true,
    createdAt: serverTimestamp()
  })
  return promoId
}

/**
 * Toggle promo code active status
 */
export async function togglePromoCodeActive(promoId, isActive) {
  const docRef = doc(db, COLLECTION, promoId)
  await updateDoc(docRef, { isActive })
}

/**
 * Delete a promo code
 */
export async function deletePromoCode(promoId) {
  await deleteDoc(doc(db, COLLECTION, promoId))
}

/**
 * Validate and get a promo code
 */
export async function validatePromoCode(businessCode, code) {
  const promoId = `${businessCode}-${code.toUpperCase()}`
  const docRef = doc(db, COLLECTION, promoId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return { valid: false, error: 'Code not found' }
  }

  const promo = { id: docSnap.id, ...docSnap.data() }

  if (!promo.isActive) {
    return { valid: false, error: 'Code is no longer active' }
  }

  if (promo.expiresAt && promo.expiresAt.toDate() < new Date()) {
    return { valid: false, error: 'Code has expired' }
  }

  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return { valid: false, error: 'Code usage limit reached' }
  }

  return { valid: true, promo }
}

/**
 * Increment promo code usage
 */
export async function incrementPromoUsage(promoId) {
  const docRef = doc(db, COLLECTION, promoId)
  await updateDoc(docRef, {
    usageCount: (await getDoc(docRef)).data().usageCount + 1
  })
}
