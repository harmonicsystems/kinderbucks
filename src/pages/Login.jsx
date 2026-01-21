import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import { signIn, signUp, signInWithGoogle } from '../firebase/auth'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

function Login() {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Get redirect destination from query params or state
  const searchParams = new URLSearchParams(location.search)
  const redirectParam = searchParams.get('redirect')
  const from = redirectParam || location.state?.from?.pathname || '/card'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setError('Please enter your name')
          setLoading(false)
          return
        }
        await signUp(email, password, displayName)
      } else {
        await signIn(email, password)
      }
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Auth error:', err)
      // Friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address')
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <section style={{
        flex: 1,
        background: 'linear-gradient(180deg, var(--kb-cream) 0%, var(--kb-white) 100%)',
        padding: '3rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%',
            maxWidth: '420px',
          }}
        >
          {/* Card */}
          <div className="card" style={{ padding: '2rem' }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              marginBottom: '2rem',
              background: 'var(--kb-gray-100)',
              borderRadius: '10px',
              padding: '4px',
            }}>
              <button
                onClick={() => { setMode('login'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: mode === 'login' ? 'white' : 'transparent',
                  color: mode === 'login' ? 'var(--kb-navy)' : 'var(--kb-gray-500)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <LogIn size={18} /> Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: mode === 'signup' ? 'white' : 'transparent',
                  color: mode === 'signup' ? 'var(--kb-navy)' : 'var(--kb-gray-500)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <UserPlus size={18} /> Sign Up
              </button>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>
                {mode === 'login' ? 'Welcome Back' : 'Join OK Kinderhook'}
              </h2>
              <p style={{ color: 'var(--kb-gray-500)', fontSize: '0.95rem' }}>
                {mode === 'login'
                  ? 'Sign in to access your account'
                  : 'Create an account to track your OK Member status'
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#dc2626',
                  fontSize: '0.9rem',
                }}
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'var(--kb-gray-600)',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                  }}>
                    Your Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={18}
                      color="var(--kb-gray-400)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Jane Smith"
                      style={{ width: '100%', paddingLeft: '40px' }}
                      required={mode === 'signup'}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--kb-gray-600)',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    color="var(--kb-gray-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--kb-gray-600)',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    color="var(--kb-gray-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    required
                    minLength={6}
                  />
                </div>
                {mode === 'signup' && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                    At least 6 characters
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-gold"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0',
              gap: '1rem',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--kb-gray-200)' }} />
              <span style={{ color: 'var(--kb-gray-400)', fontSize: '0.85rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--kb-gray-200)' }} />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={async () => {
                setError('')
                setLoading(true)
                try {
                  await signInWithGoogle()
                  navigate(from, { replace: true })
                } catch (err) {
                  console.error('Google sign-in error:', err)
                  if (err.code === 'auth/popup-closed-by-user') {
                    setError('Sign-in cancelled')
                  } else {
                    setError('Could not sign in with Google. Please try again.')
                  }
                }
                setLoading(false)
              }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                background: 'white',
                border: '1px solid var(--kb-gray-300)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: 'var(--kb-gray-700)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Guest option */}
            <div style={{ marginTop: '1rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  color: 'var(--kb-gray-500)',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                Continue as guest (limited features)
              </Link>
            </div>
          </div>

          {/* Benefits reminder */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(201, 162, 39, 0.1)',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--kb-gray-700)', fontSize: '0.9rem', margin: 0 }}>
              Create an account to sync your OK Member status across devices and never lose your tier progress!
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Login
