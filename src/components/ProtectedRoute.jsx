import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, roles, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--kb-cream)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2
            size={48}
            color="var(--kb-navy)"
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <p style={{ marginTop: '1rem', color: 'var(--kb-gray-500)' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role if specified - user must have at least one of the allowed roles
  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(allowedRole => roles.includes(allowedRole))

    if (!hasAllowedRole) {
      // User doesn't have required role - redirect to home or unauthorized page
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--kb-cream)',
          padding: '2rem',
        }}>
          <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Access Denied</h2>
            <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1.5rem' }}>
              You don't have permission to access this page.
            </p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        </div>
      )
    }
  }

  return children
}

export default ProtectedRoute
