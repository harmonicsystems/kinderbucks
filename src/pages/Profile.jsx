import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getVisitorId, getMember } from '../firebase/members'
import { getAllBusinesses } from '../firebase/businesses'
import { TIERS, getProgressToNextTier } from '../utils/tiers'

function Profile() {
  const [member, setMember] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const visitorId = getVisitorId()
      const memberData = await getMember(visitorId)
      const allBusinesses = await getAllBusinesses()

      setMember(memberData)
      setBusinesses(allBusinesses)
      setLoading(false)
    }
    load()
  }, [])

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
      </div>
    )
  }

  if (!member) {
    return (
      <div className="page page-center" style={{ background: '#faf8f3', minHeight: '100vh', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎣</div>
          <h1 style={{ color: '#1a5f2a', marginBottom: '1rem' }}>Kinderhooker</h1>
          <p style={{ color: '#5a6c7d', marginBottom: '1.5rem' }}>
            Start exploring local businesses to build your profile!
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Scan a QR code at any participating business to check in and earn rewards.
          </p>
          <Link to="/" className="btn" style={{ background: '#1a5f2a' }}>
            Find Businesses
          </Link>
        </motion.div>
      </div>
    )
  }

  const tierKey = member.tier || 'curious'
  const tier = TIERS[tierKey]
  const uniqueCount = member.businessesVisited?.length || 0
  const progress = getProgressToNextTier(uniqueCount)

  // Map business codes to names
  const visitedBusinessNames = member.businessesVisited?.map(code => {
    const biz = businesses.find(b => b.code === code)
    return biz ? biz.name : code
  }) || []

  // Get unvisited businesses
  const unvisitedBusinesses = businesses.filter(
    b => b.isActive && !member.businessesVisited?.includes(b.code)
  )

  return (
    <div className="page" style={{ background: '#faf8f3', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <h1 style={{ color: '#1a5f2a', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            🎣 KINDERHOOKER PROFILE
          </h1>
        </motion.div>

        {/* Tier Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}dd 100%)`,
            borderRadius: '20px',
            padding: '2rem',
            color: 'white',
            textAlign: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{tier.emoji}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            {tier.name}
          </div>
          <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>
            {Math.round(tier.bonus * 100)}% Kinderbuck Match Bonus
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>
            You've supported {uniqueCount} local business{uniqueCount !== 1 ? 'es' : ''}!
          </h3>

          {progress.nextTier && (
            <>
              <p style={{ color: '#5a6c7d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Progress to <strong style={{ color: progress.nextTier.color }}>{progress.nextTier.name}</strong>:
              </p>
              <div style={{
                background: '#e0e0e0',
                borderRadius: '10px',
                height: '24px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  style={{
                    background: `linear-gradient(90deg, ${tier.color}, ${progress.nextTier.color})`,
                    height: '100%',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {uniqueCount}/{progress.nextTier.threshold}
                </motion.div>
              </div>
              <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center' }}>
                {progress.remaining} more business{progress.remaining !== 1 ? 'es' : ''} to go!
              </p>
            </>
          )}

          {!progress.nextTier && (
            <p style={{ color: '#c9a227', fontWeight: 'bold', textAlign: 'center' }}>
              👑 Maximum tier reached! You're a true Village Patron!
            </p>
          )}
        </motion.div>

        {/* Visited Businesses */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
            ✓ Businesses Visited
          </h3>
          {visitedBusinessNames.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {visitedBusinessNames.map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: '#e8f5e9',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{ color: '#2e7d32' }}>✓</span>
                  <span style={{ color: '#2c3e50' }}>{name}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888' }}>No businesses visited yet</p>
          )}
        </motion.div>

        {/* Unvisited Businesses */}
        {unvisitedBusinesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
              🎯 Still to Explore
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {unvisitedBusinesses.map((biz, i) => (
                <div
                  key={biz.code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{ color: '#888' }}>○</span>
                  <span style={{ color: '#5a6c7d' }}>{biz.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Total Check-ins */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', color: '#888', marginBottom: '1.5rem' }}
        >
          Total check-ins: {member.totalCheckins || 0}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
        >
          <Link to="/" className="btn" style={{ background: '#1a5f2a' }}>
            Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
