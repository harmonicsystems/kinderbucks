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
  serverTimestamp
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
 * Sign up a new user with email and password
 */
export async function signUp(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Update display name
  await updateProfile(user, { displayName })

  // Create user document in Firestore
  await setDoc(doc(db, USERS_COLLECTION, user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    role: ROLES.MEMBER, // Default role
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
      role: ROLES.MEMBER,
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
 * Update user role (admin only)
 */
export async function updateUserRole(uid, newRole) {
  if (!Object.values(ROLES).includes(newRole)) {
    throw new Error('Invalid role')
  }
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    role: newRole,
    updatedAt: serverTimestamp()
  })
}

/**
 * Assign business to a user (admin only)
 */
export async function assignBusinessToUser(uid, businessCode) {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    role: ROLES.BUSINESS,
    businessCode,
    updatedAt: serverTimestamp()
  })
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
 * Get users by role
 */
export async function getUsersByRole(role) {
  const q = query(collection(db, USERS_COLLECTION), where('role', '==', role))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Check if user has specific role
 */
export function hasRole(userProfile, ...roles) {
  if (!userProfile) return false
  return roles.includes(userProfile.role)
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
    const userData = docSnap.data()
    // Check if there are any admins
    const admins = await getUsersByRole(ROLES.ADMIN)
    if (admins.length === 0) {
      // Make this user the first admin
      await updateDoc(userRef, { role: ROLES.ADMIN })
      return true
    }
    return false
  }
  return false
}
