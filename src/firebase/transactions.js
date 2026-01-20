import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'transactions'

/**
 * Record a payment transaction (business accepts KB from customer)
 * Uses batch write to atomically:
 * 1. Update KB with business as holder
 * 2. Increment business KB balance
 * 3. Create transaction record
 */
export async function recordPayment(serial, businessCode, businessName) {
  const batch = writeBatch(db)

  // Get the kinderbuck to get its denomination
  const kbRef = doc(db, 'kinderbucks', serial)
  const kbSnap = await getDoc(kbRef)

  if (!kbSnap.exists()) {
    throw new Error('Kinderbuck not found')
  }

  const kb = kbSnap.data()
  const amount = kb.denomination

  // 1. Update kinderbuck with holder info
  batch.update(kbRef, {
    currentHolder: businessCode,
    holderType: 'business',
    lastTransferAt: serverTimestamp()
  })

  // 2. Update business balance
  const businessRef = doc(db, 'businesses', businessCode)
  batch.update(businessRef, {
    kinderbucksBalance: increment(amount),
    lifetimeAccepted: increment(amount)
  })

  // 3. Create transaction record
  const txnRef = doc(collection(db, COLLECTION))
  batch.set(txnRef, {
    type: 'payment',
    kinderbuckSerial: serial,
    denomination: amount,
    businessCode,
    businessName,
    amount,
    status: 'completed',
    createdAt: serverTimestamp()
  })

  await batch.commit()

  return { serial, amount, businessCode }
}

/**
 * Get transaction history for a business
 */
export async function getBusinessTransactions(businessCode, limitCount = 50) {
  const q = query(
    collection(db, COLLECTION),
    where('businessCode', '==', businessCode),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.slice(0, limitCount).map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Create a redemption request (business wants to convert KB to USD)
 */
export async function createRedemptionRequest(businessCode, businessName, amount) {
  const txnRef = await addDoc(collection(db, COLLECTION), {
    type: 'redemption',
    businessCode,
    businessName,
    amount,
    status: 'pending',
    createdAt: serverTimestamp()
  })

  return { id: txnRef.id, amount, businessCode }
}

/**
 * Process a redemption request (admin approves or rejects)
 * On approval:
 * 1. Update transaction status
 * 2. Decrement business KB balance
 * 3. Increment business lifetime redeemed
 * 4. Mark affected KB bills as 'redeemed'
 */
export async function processRedemption(txnId, approved, adminId) {
  const txnRef = doc(db, COLLECTION, txnId)
  const txnSnap = await getDoc(txnRef)

  if (!txnSnap.exists()) {
    throw new Error('Transaction not found')
  }

  const txn = txnSnap.data()

  if (txn.status !== 'pending') {
    throw new Error('Transaction already processed')
  }

  const batch = writeBatch(db)

  // Update transaction status
  batch.update(txnRef, {
    status: approved ? 'approved' : 'rejected',
    processedBy: adminId,
    processedAt: serverTimestamp()
  })

  if (approved) {
    // Update business balance
    const businessRef = doc(db, 'businesses', txn.businessCode)
    batch.update(businessRef, {
      kinderbucksBalance: increment(-txn.amount),
      lifetimeRedeemed: increment(txn.amount)
    })

    // Find KB bills held by this business and mark as redeemed
    // We'll mark bills up to the redemption amount
    const kbQuery = query(
      collection(db, 'kinderbucks'),
      where('currentHolder', '==', txn.businessCode),
      where('status', '==', 'active')
    )

    const kbSnap = await getDocs(kbQuery)
    let remaining = txn.amount
    const redeemedSerials = []

    for (const kbDoc of kbSnap.docs) {
      if (remaining <= 0) break

      const kb = kbDoc.data()
      batch.update(kbDoc.ref, {
        status: 'redeemed',
        redeemedAt: serverTimestamp(),
        redeemedInTransaction: txnId
      })

      remaining -= kb.denomination
      redeemedSerials.push(kbDoc.id)
    }

    // Update transaction with redeemed serials
    batch.update(txnRef, {
      redeemedSerials
    })
  }

  await batch.commit()

  return { txnId, approved, status: approved ? 'approved' : 'rejected' }
}

/**
 * Get all pending redemption requests (for admin)
 */
export async function getPendingRedemptions() {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'redemption'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Get all redemption requests (for admin - all statuses)
 */
export async function getAllRedemptions() {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'redemption'),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}
