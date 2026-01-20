import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getBusiness, incrementBusinessCheckins } from '../firebase/businesses'
import { getVisitorId, updateMemberCheckin, getMember } from '../firebase/members'
import { hasRecentCheckin, recordCheckin } from '../firebase/checkins'
import { TIERS, calculateTier, getProgressToNextTier } from '../utils/tiers'
import Confetti from '../components/Confetti'

function CheckIn() {
  const { businessCode } = useParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkinResult, setCheckinResult] = useState(null)
  const [onCooldown, setOnCooldown] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

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

        // 2. Get visitor ID
        const visitorId = getVisitorId()

        // 3. Check cooldown
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

        // 4. Record check-in and update member
        const member = await getMember(visitorId)
        const currentTier = member?.tier || null

        const result = await updateMemberCheckin(visitorId, businessCode)
        await recordCheckin(visitorId, businessCode, result.newTier)
        await incrementBusinessCheckins(businessCode)

        setCheckinResult(result)

        // 5. Show confetti on tier promotion
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
  }, [businessCode])

  if (loading) {
    return (
      <div className="page page-center" style={{ background: '#faf8f3', minHeight: '100vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '3rem' }}
        >
          🎣
        </motion.div>
        <p style={{ marginTop: '1rem', color: '#5a6c7d' }}>Checking in...</p>
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div className="page page-center" style={{ background: '#faf8f3', minHeight: '100vh' }}>
        <h1 style={{ color: '#c0392b' }}>Business Not Found</h1>
        <p style={{ color: '#5a6c7d' }}>This check-in code doesn't match any participating business.</p>
        <Link to="/" className="btn" style={{ marginTop: '1rem' }}>Go Home</Link>
      </div>
    )
  }

  if (error === 'inactive') {
    return (
      <div className="page page-center" style={{ background: '#faf8f3', minHeight: '100vh' }}>
        <h1 style={{ color: '#e67e22' }}>Business Not Active</h1>
        <p style={{ color: '#5a6c7d' }}>This business is not currently participating in Kinderhooker.</p>
        <Link to="/" className="btn" style={{ marginTop: '1rem' }}>Go Home</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page page-center" style={{ background: '#faf8f3', minHeight: '100vh' }}>
        <h1 style={{ color: '#c0392b' }}>Something went wrong</h1>
        <p style={{ color: '#5a6c7d' }}>Please try scanning again.</p>
        <Link to="/" className="btn" style={{ marginTop: '1rem' }}>Go Home</Link>
      </div>
    )
  }

  const tierKey = checkinResult?.newTier || 'curious'
  const tier = TIERS[tierKey]
  const uniqueCount = checkinResult?.businessesVisited?.length || 0
  const progress = getProgressToNextTier(uniqueCount)

  return (
    <div className="page page-center" style={{ background: '#faf8f3', minHeight: '100vh', padding: '2rem' }}>
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}
      >
        {onCooldown ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
            <h2 style={{ color: '#5a6c7d', marginBottom: '0.5rem' }}>Already Checked In!</h2>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>
              You visited <strong>{business.name}</strong> recently.<br />
              Come back in an hour for another check-in!
            </p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
              <h2 style={{ color: '#1a5f2a', marginBottom: '0.5rem' }}>
                Welcome to {business.name}!
              </h2>
              <p style={{ color: '#5a6c7d', marginBottom: '1.5rem' }}>Check-in recorded!</p>
            </motion.div>

            {checkinResult?.tierChanged && checkinResult?.newTier && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                style={{
                  background: tier.bgColor,
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>{tier.emoji}</div>
                <div style={{ color: tier.color, fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {checkinResult.oldTier ? 'NEW TIER UNLOCKED!' : 'WELCOME, KINDERHOOKER!'}
                </div>
                <div style={{ color: tier.color, fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {tier.name}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Tier Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: tier.bgColor,
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ fontSize: '2rem' }}>{tier.emoji}</div>
          <div style={{ color: tier.color, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {tier.name}
          </div>
          <div style={{ color: '#5a6c7d', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {Math.round(tier.bonus * 100)}% Kinderbuck Match Bonus
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
            You've visited <strong>{uniqueCount}</strong> business{uniqueCount !== 1 ? 'es' : ''}
          </p>

          {progress.nextTier && (
            <>
              <div style={{
                background: '#e0e0e0',
                borderRadius: '10px',
                height: '20px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  style={{
                    background: `linear-gradient(90deg, ${tier.color}, ${progress.nextTier.color})`,
                    height: '100%',
                    borderRadius: '10px'
                  }}
                />
              </div>
              <p style={{ color: '#5a6c7d', fontSize: '0.85rem' }}>
                {progress.remaining} more to reach <strong style={{ color: progress.nextTier.color }}>{progress.nextTier.name}</strong>!
              </p>
            </>
          )}

          {!progress.nextTier && (
            <p style={{ color: '#c9a227', fontWeight: 'bold' }}>
              👑 Maximum tier reached! You're a true Village Patron!
            </p>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            to="/profile"
            className="btn"
            style={{ background: '#1a5f2a' }}
          >
            View My Profile
          </Link>
          <Link
            to="/"
            className="btn btn-secondary"
          >
            Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default CheckIn
