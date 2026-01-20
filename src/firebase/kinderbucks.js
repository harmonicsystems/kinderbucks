import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  addDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'kinderbucks'
const SCANS_COLLECTION = 'scans'

/**
 * Get a single Kinderbuck by serial number
 */
export async function getKinderbuck(serial) {
  const docRef = doc(db, COLLECTION, serial)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { serial: docSnap.id, ...docSnap.data() }
  }
  return null
}

/**
 * Get all Kinderbucks
 */
export async function getAllKinderbucks() {
  const q = query(collection(db, COLLECTION), orderBy('serial'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ serial: doc.id, ...doc.data() }))
}

/**
 * Create multiple Kinderbucks with a given denomination
 */
export async function createKinderbucks(serials, denomination) {
  const promises = serials.map(serial =>
    setDoc(doc(db, COLLECTION, serial), {
      serial,
      denomination,
      status: 'draft',
      scanCount: 0,
      createdAt: serverTimestamp(),
    })
  )
  await Promise.all(promises)
}

/**
 * Update Kinderbuck status (issue, activate, redeem, retire)
 */
export async function updateKinderbuckStatus(serial, status, issuedTo = null) {
  const docRef = doc(db, COLLECTION, serial)
  const update = {
    status,
    ...(status === 'issued' && { issuedAt: serverTimestamp() }),
    ...(issuedTo && { issuedTo }),
  }
  await updateDoc(docRef, update)
}

/**
 * Record a scan event
 */
export async function recordScan(serial) {
  // Update scan count on the Kinderbuck
  const docRef = doc(db, COLLECTION, serial)
  await updateDoc(docRef, {
    scanCount: increment(1),
    lastScanned: serverTimestamp(),
    status: 'active', // Mark as active once scanned
  })

  // Record individual scan event
  await addDoc(collection(db, SCANS_COLLECTION), {
    serial,
    scannedAt: serverTimestamp(),
    userAgent: navigator.userAgent || null,
  })
}

/**
 * Validate a Kinderbuck for payment acceptance
 * Returns { valid: true, kb } or { valid: false, error }
 */
export async function validateForPayment(serial) {
  const kb = await getKinderbuck(serial)

  if (!kb) {
    return { valid: false, error: 'Kinderbuck not found' }
  }

  if (kb.status !== 'active') {
    return { valid: false, error: `Kinderbuck status is "${kb.status}" - must be "active"` }
  }

  if (kb.currentHolder && kb.holderType === 'business') {
    return { valid: false, error: 'Kinderbuck is already held by a business' }
  }

  return { valid: true, kb }
}

/**
 * Get Kinderbuck with full holder information
 */
export async function getKinderbuckWithHolder(serial) {
  return getKinderbuck(serial)
}
