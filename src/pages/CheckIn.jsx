import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Star, Award, Crown, Check, Clock, Loader2, ShieldCheck, UserPlus, Gift, TrendingUp } from 'lucide-react'
import { getBusiness, incrementBusinessCheckins } from '../firebase/businesses'
import { getCurrentUserId, updateMemberCheckin, getMember } from '../firebase/members'
import { hasRecentCheckin, recordCheckin } from '../firebase/checkins'
import { TIERS, getProgressToNextTier } from '../utils/tiers'
import { useAuth } from '../contexts/AuthContext'
import Confetti from '../components/Confetti'

const TIER_ICONS = {
  curious: Target,
  hooked: Star,
  lineAndSinker: Award,
  patron: Crown,
}

const TIER_COLORS = {
  curious: '#6b7280',
  hooked: '#16a34a',
  lineAndSinker: '#2563eb',
  patron: '#ca8a04',
}

// Generate a verification code based on business, user, and time
function generateVerificationCode(businessCode, visitorId) {
  const now = new Date()
  const timeComponent = now.getHours().toString().padStart(2, '0') +
                        now.getMinutes().toString().padStart(2, '0')
  const userComponent = visitorId.substring(0, 4).toUpperCase()
  const bizShort = businessCode.substring(0, 3).toUpperCase()
  return `${bizShort}-${userComponent}-${timeComponent}`
}

function CheckIn() {
  const { businessCode } = useParams()
  const { isAuthenticated } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkinResult, setCheckinResult] = useState(null)
  const [onCooldown, setOnCooldown] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  useEffect(() => {
    async function doCheckin() {
      try {
        // 1. Get business
        const biz = await getBusiness(businessCode)
        if (!biz) {
          setError('not_found')
          setLoading(false)
          return
        }
        if (!biz.isActive) {
          setError('inactive')
          setLoading(false)
          return
        }
        setBusiness(biz)

        // 2. If not authenticated, stop here - show sign up prompt
        if (!isAuthenticated) {
          setLoading(false)
          return
        }

        // 3. Get user ID (must be authenticated at this point)
        const visitorId = getCurrentUserId()

        // 4. Generate verification code
        setVerificationCode(generateVerificationCode(businessCode, visitorId))

        // 5. Check cooldown
        const recentCheckin = await hasRecentCheckin(visitorId, businessCode)
        if (recentCheckin) {
          setOnCooldown(true)
          // Still get member data to show progress
          const member = await getMember(visitorId)
          if (member) {
            setCheckinResult({
              tierChanged: false,
              newTier: member.tier,
              businessesVisited: member.businessesVisited || [],
              totalCheckins: member.totalCheckins || 0,
              isNewBusiness: false
            })
          }
          setLoading(false)
          return
        }

        // 6. Record check-in and update member
        const result = await updateMemberCheckin(visitorId, businessCode)
        await recordCheckin(visitorId, businessCode, result.newTier)
        await incrementBusinessCheckins(businessCode)

        setCheckinResult(result)

        // 7. Show confetti on tier promotion
        if (result.tierChanged && result.newTier) {
          setShowConfetti(true)
        }

        setLoading(false)
      } catch (err) {
        console.error('Check-in error:', err)
        setError('error')
        setLoading(false)
      }
    }

    doCheckin()
  }, [businessCode, isAuthenticated])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--kb-navy) 0%, #1a3a5c 100%)',
        padding: '2rem',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={64} color="var(--kb-gold)" />
        </motion.div>
        <p style={{ marginTop: '1.5rem', color: 'white', fontSize: '1.25rem' }}>
          Checking in...
        </p>
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fef2f2',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
        }}>?</div>
        <h1 style={{ color: '#dc2626', fontSize: '1.75rem', marginBottom: '0.75rem' }}>
          Business Not Found
        </h1>
        <p style={{ color: '#7f1d1d', fontSize: '1.1rem', marginBottom: '2rem' }}>
          This QR code doesn't match any participating business.
        </p>
        <Link to="/" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
          Go Home
        </Link>
      </div>
    )
  }

  if (error === 'inactive') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fffbeb',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#d97706', fontSize: '1.75rem', marginBottom: '0.75rem' }}>
          Business Not Active
        </h1>
        <p style={{ color: '#92400e', fontSize: '1.1rem', marginBottom: '2rem' }}>
          This business is not currently participating.
        </p>
        <Link to="/" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
          Go Home
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fef2f2',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#dc2626', fontSize: '1.75rem', marginBottom: '0.75rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#7f1d1d', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Please try scanning again.
        </p>
        <Link to="/" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
          Go Home
        </Link>
      </div>
    )
  }

  const tierKey = checkinResult?.newTier || 'curious'
  const tier = TIERS[tierKey]
  const tierColor = TIER_COLORS[tierKey]
  const TierIcon = TIER_ICONS[tierKey]
  const bonusPercent = Math.round(tier.bonus * 100)

  // Determine background color based on state
  const bgColor = !isAuthenticated
    ? 'var(--kb-navy)'
    : onCooldown
      ? '#6b7280'
      : tierColor

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {showConfetti && <Confetti />}

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '400px',
        margin: '0 auto',
        width: '100%',
      }}>
        {onCooldown ? (
          /* Already Checked In State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', color: 'white' }}
          >
            <Clock size={80} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.8 }} />
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Already Checked In
            </h1>
            <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>
              at {business.name}
            </p>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
              Come back in about an hour<br />for another check-in!
            </p>
          </motion.div>
        ) : !isAuthenticated ? (
          /* Sign In Required - Must sign in before seeing discount */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%' }}
          >
            {/* Welcome Header */}
            <div style={{ textAlign: 'center', color: 'white', marginBottom: '1.5rem' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <UserPlus size={40} strokeWidth={1.5} />
                </div>
              </motion.div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                Welcome to {business.name}!
              </h1>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                Sign in to complete your check-in and unlock your discount
              </p>
            </div>

            {/* Sign Up Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                background: 'var(--kb-gold)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <Gift size={28} color="var(--kb-navy)" />
              </div>

              <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Your Discount is Waiting!
              </h2>
              <p style={{ color: 'var(--kb-gray-600)', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Create a free OK Member account to unlock your exclusive bonus discount.
              </p>

              {/* Benefits */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                background: 'var(--kb-cream)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--kb-gray-700)' }}>
                  <div style={{ width: '24px', height: '24px', background: 'var(--kb-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="white" />
                  </div>
                  Unlock your discount code
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--kb-gray-700)' }}>
                  <div style={{ width: '24px', height: '24px', background: 'var(--kb-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="white" />
                  </div>
                  Track your tier progress
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--kb-gray-700)' }}>
                  <div style={{ width: '24px', height: '24px', background: 'var(--kb-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="white" />
                  </div>
                  Get your digital OK Member Card
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--kb-gray-700)' }}>
                  <div style={{ width: '24px', height: '24px', background: 'var(--kb-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="white" />
                  </div>
                  Earn higher bonuses as you level up
                </div>
              </div>

              <Link
                to={`/login?redirect=/checkin/${businessCode}`}
                className="btn btn-gold"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  fontSize: '1.15rem',
                  marginBottom: '0.75rem',
                }}
              >
                <UserPlus size={22} />
                Sign Up Free
              </Link>
              <p style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                Already have an account? <Link to={`/login?redirect=/checkin/${businessCode}`} style={{ color: 'var(--kb-navy)', fontWeight: '600' }}>Sign In</Link>
              </p>
            </motion.div>
          </motion.div>
        ) : (
          /* Success State - THE KEY SCREEN (Authenticated Users Only) */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%' }}
          >
            {/* Success Header */}
            <div style={{ textAlign: 'center', color: 'white', marginBottom: '1.5rem' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <Check size={48} strokeWidth={2.5} />
                </div>
              </motion.div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                Checked In!
              </h1>
              <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
                {business.name}
              </p>
            </div>

            {/* THE DISCOUNT CARD - Show to Cashier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              }}
            >
              {/* Tier Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}>
                <TierIcon size={28} color={tierColor} />
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: tierColor,
                  textTransform: 'uppercase',
                }}>
                  {tier.name}
                </span>
              </div>

              {/* BIG BONUS DISPLAY */}
              <div style={{
                background: `${tierColor}15`,
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: '800',
                  color: tierColor,
                  lineHeight: 1,
                }}>
                  {bonusPercent}%
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  color: 'var(--kb-gray-600)',
                  marginTop: '0.25rem',
                }}>
                  Exchange Bonus
                </div>
              </div>

              {/* Verification Code */}
              <div style={{
                background: 'var(--kb-navy)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}>
                  <ShieldCheck size={18} color="var(--kb-gold)" />
                  <span style={{ color: 'var(--kb-gold)', fontSize: '0.85rem', fontWeight: '600' }}>
                    VERIFICATION CODE
                  </span>
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: 'white',
                  letterSpacing: '0.1em',
                }}>
                  {verificationCode}
                </div>
              </div>

              {/* Instructions */}
              <p style={{
                fontSize: '1.1rem',
                color: 'var(--kb-gray-600)',
                lineHeight: 1.5,
              }}>
                Show this screen to the cashier<br />
                to receive your <strong>{bonusPercent}% bonus</strong>
              </p>
            </motion.div>

            {/* Tier Progress (smaller) */}
            {checkinResult?.tierChanged && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: 'white',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🎉</span>
                <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>
                  You just leveled up to {tier.name}!
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <Link
            to="/profile"
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
            }}
          >
            My Profile
          </Link>
          <Link
            to="/"
            className="btn"
            style={{
              background: 'white',
              color: 'var(--kb-navy)',
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
            }}
          >
            Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default CheckIn
