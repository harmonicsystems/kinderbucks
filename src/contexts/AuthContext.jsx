import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthChange, getUserProfile, getUserRoles, hasRole as checkHasRole, ROLES } from '../firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userProfile = await getUserProfile(firebaseUser.uid)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Get user's roles as array
  const roles = getUserRoles(profile)

  // Helper functions - now check roles array
  const isAuthenticated = !!user
  const isAdmin = roles.includes(ROLES.ADMIN)
  const isBusiness = roles.includes(ROLES.BUSINESS)
  const isMember = roles.includes(ROLES.MEMBER) || isAuthenticated // All authenticated users are members

  // Check if user has a specific role
  const hasRole = (role) => {
    return checkHasRole(profile, role)
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (...rolesToCheck) => {
    return rolesToCheck.some(role => roles.includes(role))
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.uid)
      setProfile(userProfile)
    }
  }

  const value = {
    user,
    profile,
    roles,
    loading,
    isAuthenticated,
    isAdmin,
    isBusiness,
    isMember,
    hasRole,
    hasAnyRole,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
