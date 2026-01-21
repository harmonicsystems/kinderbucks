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
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'

const HUNTS_COLLECTION = 'hunts'
const PROGRESS_COLLECTION = 'huntProgress'

/**
 * Hunt schema:
 * {
 *   id: string (auto-generated),
 *   name: string,
 *   description: string,
 *   type: 'weekly' | 'seasonal' | 'special' | 'permanent',
 *   landmarks: string[] (landmark codes required),
 *   startDate: timestamp,
 *   endDate: timestamp (null for permanent),
 *   badge: { name: string, icon: string, color: string },
 *   reward: { type: 'bonus' | 'badge' | 'both', bonusPercent: number, duration: number },
 *   sponsorBusinessCode: string | null,
 *   sponsorBusinessName: string | null,
 *   isActive: boolean,
 *   completionCount: number,
 *   createdAt: timestamp
 * }
 */

/**
 * Hunt Progress schema:
 * {
 *   odaId: string (odaId_odaId format),
 *   odaId: string,
 *   odaId: string,
 *   landmarksScanned: string[] (landmark codes),
 *   completedAt: timestamp | null,
 *   startedAt: timestamp
 * }
 */

// ==================== HUNTS CRUD ====================

/**
 * Get a single hunt by ID
 */
export async function getHunt(huntId) {
  const docRef = doc(db, HUNTS_COLLECTION, huntId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

/**
 * Get all hunts
 */
export async function getAllHunts(includeInactive = false) {
  const q = query(collection(db, HUNTS_COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  const hunts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  if (includeInactive) {
    return hunts
  }
  return hunts.filter(h => h.isActive)
}

/**
 * Get active hunts (within date range and active)
 */
export async function getActiveHunts() {
  const now = Timestamp.now()
  const hunts = await getAllHunts()

  return hunts.filter(hunt => {
    if (!hunt.isActive) return false

    const startDate = hunt.startDate?.toDate ? hunt.startDate.toDate() : new Date(hunt.startDate)
    const endDate = hunt.endDate?.toDate ? hunt.endDate.toDate() : null

    const hasStarted = startDate <= now.toDate()
    const hasNotEnded = !endDate || endDate >= now.toDate()

    return hasStarted && hasNotEnded
  })
}

/**
 * Create a new hunt
 */
export async function createHunt(data) {
  const huntId = `hunt-${Date.now()}`
  const huntData = {
    name: data.name,
    description: data.description || '',
    type: data.type || 'special',
    landmarks: data.landmarks || [],
    startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : Timestamp.now(),
    endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
    badge: data.badge || { name: data.name, icon: 'map', color: '#c9a227' },
    reward: data.reward || { type: 'badge', bonusPercent: 0, duration: 0 },
    sponsorBusinessCode: data.sponsorBusinessCode || null,
    sponsorBusinessName: data.sponsorBusinessName || null,
    isActive: true,
    completionCount: 0,
    createdAt: serverTimestamp()
  }

  await setDoc(doc(db, HUNTS_COLLECTION, huntId), huntData)
  return { id: huntId, ...huntData }
}

/**
 * Update a hunt
 */
export async function updateHunt(huntId, updates) {
  const docRef = doc(db, HUNTS_COLLECTION, huntId)

  // Convert date strings to Timestamps if provided
  if (updates.startDate && typeof updates.startDate === 'string') {
    updates.startDate = Timestamp.fromDate(new Date(updates.startDate))
  }
  if (updates.endDate && typeof updates.endDate === 'string') {
    updates.endDate = Timestamp.fromDate(new Date(updates.endDate))
  }

  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a hunt
 */
export async function deleteHunt(huntId) {
  await deleteDoc(doc(db, HUNTS_COLLECTION, huntId))
}

/**
 * Toggle hunt active status
 */
export async function toggleHuntActive(huntId, isActive) {
  const docRef = doc(db, HUNTS_COLLECTION, huntId)
  await updateDoc(docRef, { isActive })
}

// ==================== HUNT PROGRESS ====================

/**
 * Get user's progress on a specific hunt
 */
export async function getHuntProgress(memberId, huntId) {
  const progressId = `${memberId}_${huntId}`
  const docRef = doc(db, PROGRESS_COLLECTION, progressId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

/**
 * Get all hunt progress for a member
 */
export async function getMemberHuntProgress(memberId) {
  const q = query(
    collection(db, PROGRESS_COLLECTION),
    where('memberId', '==', memberId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Record a landmark scan for hunt progress
 * Returns { updated: boolean, completed: boolean, hunt: object }
 */
export async function recordLandmarkScan(memberId, landmarkCode, huntId) {
  const hunt = await getHunt(huntId)
  if (!hunt || !hunt.landmarks.includes(landmarkCode)) {
    return { updated: false, completed: false, hunt: null }
  }

  const progressId = `${memberId}_${huntId}`
  const docRef = doc(db, PROGRESS_COLLECTION, progressId)
  const existing = await getDoc(docRef)

  let landmarksScanned = []
  if (existing.exists()) {
    landmarksScanned = existing.data().landmarksScanned || []
  }

  // Don't double-count
  if (landmarksScanned.includes(landmarkCode)) {
    return {
      updated: false,
      completed: landmarksScanned.length === hunt.landmarks.length,
      hunt,
      progress: {
        landmarksScanned,
        total: hunt.landmarks.length
      }
    }
  }

  // Add new landmark
  landmarksScanned.push(landmarkCode)
  const isCompleted = landmarksScanned.length === hunt.landmarks.length

  const progressData = {
    memberId,
    huntId,
    landmarksScanned,
    startedAt: existing.exists() ? existing.data().startedAt : serverTimestamp(),
    completedAt: isCompleted ? serverTimestamp() : null,
    updatedAt: serverTimestamp()
  }

  await setDoc(docRef, progressData)

  // If completed, increment hunt completion count
  if (isCompleted) {
    const { increment } = await import('firebase/firestore')
    const huntRef = doc(db, HUNTS_COLLECTION, huntId)
    await updateDoc(huntRef, {
      completionCount: increment(1)
    })
  }

  return {
    updated: true,
    completed: isCompleted,
    hunt,
    progress: {
      landmarksScanned,
      total: hunt.landmarks.length
    }
  }
}

/**
 * Get member's completed hunts
 */
export async function getMemberCompletedHunts(memberId) {
  const progress = await getMemberHuntProgress(memberId)
  return progress.filter(p => p.completedAt !== null)
}

/**
 * Get hunts with member progress attached
 */
export async function getHuntsWithProgress(memberId) {
  const [hunts, progress] = await Promise.all([
    getActiveHunts(),
    getMemberHuntProgress(memberId)
  ])

  const progressMap = Object.fromEntries(
    progress.map(p => [p.huntId, p])
  )

  return hunts.map(hunt => ({
    ...hunt,
    progress: progressMap[hunt.id] || null,
    landmarksScanned: progressMap[hunt.id]?.landmarksScanned || [],
    isCompleted: progressMap[hunt.id]?.completedAt !== null
  }))
}

// ==================== HUNT TYPES ====================

export const HUNT_TYPES = {
  weekly: {
    name: 'Weekly Challenge',
    description: 'Resets every week',
    color: '#3498db'
  },
  seasonal: {
    name: 'Seasonal Event',
    description: 'Limited time seasonal hunt',
    color: '#e67e22'
  },
  special: {
    name: 'Special Event',
    description: 'One-time special event',
    color: '#9b59b6'
  },
  permanent: {
    name: 'Permanent',
    description: 'Always available',
    color: '#27ae60'
  }
}
