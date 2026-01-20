import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthChange, getUserProfile, ROLES } from '../firebase/auth'

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

  // Helper functions
  const isAuthenticated = !!user
  const isAdmin = profile?.role === ROLES.ADMIN
  const isBusiness = profile?.role === ROLES.BUSINESS
  const isMember = profile?.role === ROLES.MEMBER

  const hasRole = (...roles) => {
    if (!profile) return false
    return roles.includes(profile.role)
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
    loading,
    isAuthenticated,
    isAdmin,
    isBusiness,
    isMember,
    hasRole,
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
