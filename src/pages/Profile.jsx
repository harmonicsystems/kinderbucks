import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Target,
  Star,
  Award,
  Crown,
  Check,
  Compass,
  MapPin,
  User,
  LogIn,
  Store,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CreditCard
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getCurrentUserId, getMember } from '../firebase/members'
import { getAllBusinesses } from '../firebase/businesses'
import { TIERS, getProgressToNextTier } from '../utils/tiers'
import Header from '../components/Header'
import Footer from '../components/Footer'

const TIER_ICONS = {
  curious: Target,
  hooked: Star,
  lineAndSinker: Award,
  patron: Crown,
}

const TIER_COLORS = {
  curious: '#888888',
  hooked: '#2e7d32',
  lineAndSinker: '#1565c0',
  patron: '#c9a227',
}

function Profile() {
  const { user, profile, isAuthenticated } = useAuth()
  const [member, setMember] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const userId = getCurrentUserId()
      const memberData = await getMember(userId)
      const allBusinesses = await getAllBusinesses()

      setMember(memberData)
      setBusinesses(allBusinesses.filter(b => b.isActive))
      setLoading(false)
    }
    load()
  }, [user])

  const tierKey = member?.tier || 'curious'
  const tier = TIERS[tierKey]
  const uniqueCount = member?.businessesVisited?.length || 0
  const progress = getProgressToNextTier(uniqueCount)

  // Map business codes to names
  const visitedBusinessNames = member?.businessesVisited?.map(code => {
    const biz = businesses.find(b => b.code === code)
    return biz ? biz.name : code
  }) || []

  // Get unvisited businesses
  const unvisitedBusinesses = businesses.filter(
    b => !member?.businessesVisited?.includes(b.code)
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: 'var(--kb-cream)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ color: 'var(--kb-gray-500)' }}>Loading your profile...</div>
            </div>
          ) : !member ? (
            /* New User Welcome */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Welcome Card */}
              <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}>
                  <Sparkles size={36} color="var(--kb-gold)" />
                </div>

                <h1 style={{ color: 'var(--kb-navy)', marginBottom: '0.75rem' }}>
                  Welcome to Kinderbucks!
                </h1>
                <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                  You haven't checked in anywhere yet. Visit a local business and scan their QR code to start building your OK Member status!
                </p>

                {!isAuthenticated && (
                  <div style={{
                    background: 'rgba(201, 162, 39, 0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                  }}>
                    <p style={{ color: 'var(--kb-gray-700)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      Sign in to save your progress across devices
                    </p>
                    <Link to="/login" className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <LogIn size={18} /> Sign In or Create Account
                    </Link>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link to="/businesses" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} /> Find Businesses
                  </Link>
                  <Link to="/card" className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={18} /> View My Card
                  </Link>
                </div>
              </div>

              {/* How it works */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem', textAlign: 'center' }}>
                  How to Get Started
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { step: 1, text: 'Visit any participating Kinderhook business', icon: Store },
                    { step: 2, text: 'Scan their check-in QR code with your phone', icon: Target },
                    { step: 3, text: 'Build your tier to unlock better exchange rates', icon: TrendingUp },
                  ].map(item => (
                    <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: 'var(--kb-navy)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <item.icon size={20} color="var(--kb-gold)" />
                      </div>
                      <div style={{ color: 'var(--kb-gray-700)' }}>{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Tiers */}
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem', textAlign: 'center' }}>
                  Tier Rewards
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {Object.entries(TIERS).map(([key, t]) => {
                    const TierIcon = TIER_ICONS[key]
                    return (
                      <div
                        key={key}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '1rem',
                          textAlign: 'center',
                          border: '1px solid var(--kb-gray-200)',
                        }}
                      >
                        <TierIcon size={24} color={TIER_COLORS[key]} style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontWeight: '600', color: TIER_COLORS[key], marginBottom: '0.25rem' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                          {Math.round(t.bonus * 100)}% bonus
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Existing Member Profile */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* User Info (if logged in) */}
              {isAuthenticated && profile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '12px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--kb-gray-100)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <User size={24} color="var(--kb-gray-500)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>
                      {profile.displayName || user.email}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                      {user.email}
                    </div>
                  </div>
                </div>
              )}

              {/* Tier Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: `linear-gradient(135deg, ${TIER_COLORS[tierKey]} 0%, ${TIER_COLORS[tierKey]}dd 100%)`,
                  borderRadius: '20px',
                  padding: '2rem',
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                {(() => {
                  const TierIcon = TIER_ICONS[tierKey] || Target
                  return <TierIcon size={48} color="white" strokeWidth={1.5} style={{ marginBottom: '0.5rem' }} />
                })()}
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {tier.name}
                </div>
                <div style={{ opacity: 0.9, fontSize: '1rem' }}>
                  {Math.round(tier.bonus * 100)}% Kinderbuck Exchange Bonus
                </div>
              </motion.div>

              {/* Show My Card Button - BIG and prominent */}
              <Link
                to="/card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, var(--kb-gold) 0%, #d4af37 100%)',
                  color: 'var(--kb-navy)',
                  borderRadius: '16px',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 12px rgba(201, 162, 39, 0.3)',
                }}
              >
                <CreditCard size={28} />
                SHOW MY OK CARD
              </Link>

              {/* Progress Card */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem', textAlign: 'center' }}>
                  {uniqueCount} Business{uniqueCount !== 1 ? 'es' : ''} Visited
                </h3>

                {progress.nextTier ? (
                  <>
                    <div style={{
                      background: 'var(--kb-gray-100)',
                      borderRadius: '10px',
                      height: '28px',
                      overflow: 'hidden',
                      marginBottom: '0.75rem'
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progress}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        style={{
                          background: `linear-gradient(90deg, ${TIER_COLORS[tierKey]}, ${progress.nextTier.color})`,
                          height: '100%',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {uniqueCount}/{progress.nextTier.threshold}
                      </motion.div>
                    </div>
                    <p style={{ color: 'var(--kb-gray-600)', textAlign: 'center' }}>
                      <strong>{progress.remaining}</strong> more to reach{' '}
                      <strong style={{ color: progress.nextTier.color }}>{progress.nextTier.name}</strong>
                    </p>
                  </>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'var(--kb-gold-dark)',
                    fontWeight: '600',
                  }}>
                    <Crown size={20} /> Maximum tier reached! You're a true Village Patron!
                  </div>
                )}
              </div>

              {/* Visited Businesses */}
              {visitedBusinessNames.length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{
                    color: 'var(--kb-navy)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Check size={20} color="var(--kb-green)" /> Visited
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {visitedBusinessNames.map((name, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: '#e8f5e9',
                          borderRadius: '6px',
                          color: '#2e7d32',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Check size={14} /> {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Still to Explore */}
              {unvisitedBusinesses.length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{
                    color: 'var(--kb-navy)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Compass size={20} /> Still to Explore ({unvisitedBusinesses.length})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {unvisitedBusinesses.slice(0, 10).map((biz) => (
                      <span
                        key={biz.code}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: 'var(--kb-gray-100)',
                          borderRadius: '6px',
                          color: 'var(--kb-gray-600)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {biz.name}
                      </span>
                    ))}
                    {unvisitedBusinesses.length > 10 && (
                      <span style={{
                        padding: '0.4rem 0.8rem',
                        color: 'var(--kb-gray-500)',
                        fontSize: '0.9rem',
                      }}>
                        +{unvisitedBusinesses.length - 10} more
                      </span>
                    )}
                  </div>
                  <Link
                    to="/businesses"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '1rem',
                      color: 'var(--kb-navy)',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                    }}
                  >
                    View all businesses <ArrowRight size={16} />
                  </Link>
                </div>
              )}

              {/* Stats Footer */}
              <div style={{
                textAlign: 'center',
                color: 'var(--kb-gray-500)',
                fontSize: '0.9rem',
              }}>
                Total Check-ins: {member.totalCheckins || 0}
              </div>

              {/* Sign in prompt for guests */}
              {!isAuthenticated && (
                <div style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'rgba(201, 162, 39, 0.1)',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}>
                  <p style={{ color: 'var(--kb-gray-700)', marginBottom: '0.75rem' }}>
                    Sign in to save your progress across devices
                  </p>
                  <Link to="/login" className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LogIn size={18} /> Sign In
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Profile
