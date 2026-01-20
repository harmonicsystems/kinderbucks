import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  orderBy
} from 'firebase/firestore'
import { auth, db } from './config'

const USERS_COLLECTION = 'users'

// User roles
export const ROLES = {
  ADMIN: 'admin',
  BUSINESS: 'business',
  MEMBER: 'member'
}

/**
 * Get user's roles as an array (handles multiple formats)
 */
export function getUserRoles(userProfile) {
  if (!userProfile) return []

  // New format: roles array
  if (Array.isArray(userProfile.roles)) {
    return userProfile.roles
  }

  // Also check if 'role' field is an array (alternate format)
  if (Array.isArray(userProfile.role)) {
    return userProfile.role
  }

  // Legacy format: single role string
  if (userProfile.role && typeof userProfile.role === 'string') {
    return [userProfile.role]
  }

  return [ROLES.MEMBER]
}

/**
 * Check if user has a specific role
 */
export function hasRole(userProfile, role) {
  const roles = getUserRoles(userProfile)
  return roles.includes(role)
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userProfile, ...rolesToCheck) {
  const roles = getUserRoles(userProfile)
  return rolesToCheck.some(role => roles.includes(role))
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Update display name
  await updateProfile(user, { displayName })

  // Create user document in Firestore with roles array
  await setDoc(doc(db, USERS_COLLECTION, user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    roles: [ROLES.MEMBER], // Default role as array
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  })

  return user
}

/**
 * Sign in existing user
 */
export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)

  // Update last login
  await updateDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), {
    lastLogin: serverTimestamp()
  })

  return userCredential.user
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)
  const user = userCredential.user

  // Check if user document exists
  const userRef = doc(db, USERS_COLLECTION, user.uid)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    // Create new user document for first-time Google sign-in
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      photoURL: user.photoURL,
      roles: [ROLES.MEMBER], // Default role as array
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      provider: 'google'
    })
  } else {
    // Update last login for existing user
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      photoURL: user.photoURL // Update photo in case it changed
    })
  }

  return user
}

/**
 * Sign out current user
 */
export async function logOut() {
  return signOut(auth)
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid) {
  const docRef = doc(db, USERS_COLLECTION, uid)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return docSnap.data()
  }
  return null
}

/**
 * Add a role to a user
 */
export async function addUserRole(uid, role) {
  if (!Object.values(ROLES).includes(role)) {
    throw new Error('Invalid role')
  }

  const userRef = doc(db, USERS_COLLECTION, uid)
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    const data = userDoc.data()

    // If user has legacy role field, migrate to roles array
    if (!Array.isArray(data.roles)) {
      const existingRoles = data.role ? [data.role] : [ROLES.MEMBER]
      if (!existingRoles.includes(role)) {
        existingRoles.push(role)
      }
      await updateDoc(userRef, {
        roles: existingRoles,
        updatedAt: serverTimestamp()
      })
    } else {
      // Add role to existing array
      await updateDoc(userRef, {
        roles: arrayUnion(role),
        updatedAt: serverTimestamp()
      })
    }
  }
}

/**
 * Remove a role from a user
 */
export async function removeUserRole(uid, role) {
  if (!Object.values(ROLES).includes(role)) {
    throw new Error('Invalid role')
  }

  const userRef = doc(db, USERS_COLLECTION, uid)
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    const data = userDoc.data()
    const currentRoles = getUserRoles(data)

    // Don't allow removing the last role - keep at least member
    if (currentRoles.length === 1 && currentRoles[0] === role) {
      await updateDoc(userRef, {
        roles: [ROLES.MEMBER],
        updatedAt: serverTimestamp()
      })
      return
    }

    // If user has legacy role field, migrate to roles array first
    if (!Array.isArray(data.roles)) {
      const existingRoles = data.role ? [data.role] : [ROLES.MEMBER]
      const newRoles = existingRoles.filter(r => r !== role)
      await updateDoc(userRef, {
        roles: newRoles.length > 0 ? newRoles : [ROLES.MEMBER],
        updatedAt: serverTimestamp()
      })
    } else {
      await updateDoc(userRef, {
        roles: arrayRemove(role),
        updatedAt: serverTimestamp()
      })
    }
  }
}

/**
 * Toggle a role for a user (add if missing, remove if present)
 */
export async function toggleUserRole(uid, role) {
  const userRef = doc(db, USERS_COLLECTION, uid)
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    const data = userDoc.data()
    const currentRoles = getUserRoles(data)

    if (currentRoles.includes(role)) {
      await removeUserRole(uid, role)
    } else {
      await addUserRole(uid, role)
    }
  }
}

/**
 * Set all roles for a user (replaces existing roles)
 */
export async function setUserRoles(uid, roles) {
  const validRoles = roles.filter(r => Object.values(ROLES).includes(r))
  if (validRoles.length === 0) {
    validRoles.push(ROLES.MEMBER)
  }

  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    roles: validRoles,
    updatedAt: serverTimestamp()
  })
}

/**
 * Legacy: Update user role (single role - kept for backwards compatibility)
 * @deprecated Use addUserRole, removeUserRole, or setUserRoles instead
 */
export async function updateUserRole(uid, newRole) {
  if (!Object.values(ROLES).includes(newRole)) {
    throw new Error('Invalid role')
  }
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    roles: [newRole],
    updatedAt: serverTimestamp()
  })
}

/**
 * Assign business to a user (admin only)
 */
export async function assignBusinessToUser(uid, businessCode) {
  const userRef = doc(db, USERS_COLLECTION, uid)
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    const data = userDoc.data()
    const currentRoles = getUserRoles(data)

    // Add business role if not present
    const newRoles = currentRoles.includes(ROLES.BUSINESS)
      ? currentRoles
      : [...currentRoles, ROLES.BUSINESS]

    await updateDoc(userRef, {
      roles: newRoles,
      businessCode,
      updatedAt: serverTimestamp()
    })
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION))
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Get users by role (works with both legacy and new format)
 */
export async function getUsersByRole(role) {
  // Query for new format (roles array)
  const q = query(collection(db, USERS_COLLECTION), where('roles', 'array-contains', role))
  const querySnapshot = await getDocs(q)
  const users = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  // Also check legacy format
  const legacyQ = query(collection(db, USERS_COLLECTION), where('role', '==', role))
  const legacySnapshot = await getDocs(legacyQ)
  const legacyUsers = legacySnapshot.docs
    .filter(doc => !users.some(u => u.id === doc.id)) // Avoid duplicates
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

  return [...users, ...legacyUsers]
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Create initial admin user (for first setup)
 * Call this once to bootstrap the first admin
 */
export async function createAdminIfNotExists(uid) {
  const userRef = doc(db, USERS_COLLECTION, uid)
  const docSnap = await getDoc(userRef)

  if (docSnap.exists()) {
    // Check if there are any admins
    const admins = await getUsersByRole(ROLES.ADMIN)
    if (admins.length === 0) {
      // Make this user the first admin
      await addUserRole(uid, ROLES.ADMIN)
      return true
    }
    return false
  }
  return false
}

// ==================== SOFT DELETE & PROTECTION ====================

/**
 * Get user deletion info - check for associated data
 */
export async function getUserDeletionInfo(uid) {
  const user = await getUserProfile(uid)
  if (!user) {
    return { exists: false, canDelete: false, reason: 'User not found' }
  }

  // Check for check-ins
  const checkinsQuery = query(
    collection(db, 'checkins'),
    where('memberId', '==', uid)
  )
  const checkinsSnap = await getDocs(checkinsQuery)
  const checkinCount = checkinsSnap.size

  // Check for exchange requests
  const exchangesQuery = query(
    collection(db, 'exchanges'),
    where('userId', '==', uid)
  )
  const exchangesSnap = await getDocs(exchangesQuery)
  const exchangeCount = exchangesSnap.size

  // Check if user is a business owner
  const isBusinessOwner = !!user.businessCode

  const hasData = checkinCount > 0 || exchangeCount > 0 || isBusinessOwner

  return {
    exists: true,
    uid,
    displayName: user.displayName,
    email: user.email,
    roles: getUserRoles(user),
    checkinCount,
    exchangeCount,
    isBusinessOwner,
    businessCode: user.businessCode,
    hasData,
    canSafeDelete: !hasData,
    reason: hasData
      ? `Has ${checkinCount} check-ins, ${exchangeCount} exchanges${isBusinessOwner ? ', is business owner' : ''}`
      : 'No associated data'
  }
}

/**
 * Soft delete a user (marks as deleted, doesn't remove data)
 */
export async function softDeleteUser(uid, deletedBy = null, force = false) {
  const info = await getUserDeletionInfo(uid)

  if (!info.exists) {
    throw new Error('User not found')
  }

  if (info.hasData && !force) {
    throw new Error(`Cannot delete: ${info.reason}. Use force=true to soft delete anyway.`)
  }

  const userRef = doc(db, USERS_COLLECTION, uid)
  await updateDoc(userRef, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: deletedBy
  })

  return { success: true, wasForced: info.hasData && force }
}

/**
 * Restore a soft-deleted user
 */
export async function restoreUser(uid) {
  const userRef = doc(db, USERS_COLLECTION, uid)
  await updateDoc(userRef, {
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    restoredAt: serverTimestamp()
  })
}

/**
 * Get all users (optionally including deleted)
 */
export async function getAllUsersWithDeleted(includeDeleted = false) {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION))
  const users = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  if (includeDeleted) {
    return users
  }
  return users.filter(u => !u.isDeleted)
}

/**
 * Get only deleted users (for admin restore UI)
 */
export async function getDeletedUsers() {
  const all = await getAllUsersWithDeleted(true)
  return all.filter(u => u.isDeleted)
}
