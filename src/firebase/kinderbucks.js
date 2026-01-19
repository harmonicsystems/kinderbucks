// DEMO MODE: Using localStorage instead of Firebase
// Switch to Firebase later by uncommenting the imports and swapping function implementations

// import {
//   collection, doc, getDoc, getDocs, setDoc, updateDoc,
//   increment, serverTimestamp, addDoc, query, orderBy
// } from 'firebase/firestore'
// import { db } from './config'

const STORAGE_KEY = 'kinderbucks_demo'
const SCANS_KEY = 'kinderbucks_scans'

// Demo mode helpers
function getStorage() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

function setStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getScansStorage() {
  const data = localStorage.getItem(SCANS_KEY)
  return data ? JSON.parse(data) : []
}

function setScansStorage(data) {
  localStorage.setItem(SCANS_KEY, JSON.stringify(data))
}

/**
 * Get a single Kinderbuck by serial number
 */
export async function getKinderbuck(serial) {
  const storage = getStorage()
  return storage[serial] || null
}

/**
 * Get all Kinderbucks
 */
export async function getAllKinderbucks() {
  const storage = getStorage()
  return Object.values(storage).sort((a, b) => a.serial.localeCompare(b.serial))
}

/**
 * Create multiple Kinderbucks with a given denomination
 */
export async function createKinderbucks(serials, denomination) {
  const storage = getStorage()
  const now = new Date().toISOString()

  for (const serial of serials) {
    storage[serial] = {
      serial,
      denomination,
      status: 'draft',
      scanCount: 0,
      createdAt: { seconds: Date.now() / 1000 },
    }
  }

  setStorage(storage)
}

/**
 * Update Kinderbuck status (issue, activate, redeem, retire)
 */
export async function updateKinderbuckStatus(serial, status, issuedTo = null) {
  const storage = getStorage()

  if (storage[serial]) {
    storage[serial].status = status
    if (status === 'issued') {
      storage[serial].issuedAt = { seconds: Date.now() / 1000 }
    }
    if (issuedTo) {
      storage[serial].issuedTo = issuedTo
    }
    setStorage(storage)
  }
}

/**
 * Record a scan event
 */
export async function recordScan(serial) {
  const storage = getStorage()

  if (storage[serial]) {
    storage[serial].scanCount = (storage[serial].scanCount || 0) + 1
    storage[serial].lastScanned = { seconds: Date.now() / 1000 }
    storage[serial].status = 'active'
    setStorage(storage)
  }

  // Record individual scan
  const scans = getScansStorage()
  scans.push({
    serial,
    scannedAt: { seconds: Date.now() / 1000 },
    userAgent: navigator.userAgent || null,
  })
  setScansStorage(scans)
}
