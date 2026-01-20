import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Target,
  Star,
  Award,
  Crown,
  ChevronLeft,
  QrCode
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getCurrentUserId, getMember } from '../firebase/members'
import { TIERS } from '../utils/tiers'

const TIER_ICONS = {
  curious: Target,
  hooked: Star,
  lineAndSinker: Award,
  patron: Crown,
}

const TIER_COLORS = {
  curious: { primary: '#6b7280', secondary: '#9ca3af', bg: '#f3f4f6' },
  hooked: { primary: '#16a34a', secondary: '#22c55e', bg: '#dcfce7' },
  lineAndSinker: { primary: '#2563eb', secondary: '#3b82f6', bg: '#dbeafe' },
  patron: { primary: '#ca8a04', secondary: '#eab308', bg: '#fef3c7' },
}

function MyCard() {
  const { user, profile, isAuthenticated } = useAuth()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const userId = getCurrentUserId()
      const memberData = await getMember(userId)
      setMember(memberData)
      setLoading(false)
    }
    load()
  }, [user])

  const tierKey = member?.tier || 'curious'
  const tier = TIERS[tierKey]
  const colors = TIER_COLORS[tierKey]
  const TierIcon = TIER_ICONS[tierKey]
  const uniqueCount = member?.businessesVisited?.length || 0
  const bonusPercent = Math.round(tier.bonus * 100)

  // Generate member number from user ID
  const userId = getCurrentUserId()
  const memberNumber = userId ? `OK-${userId.substring(0, 6).toUpperCase()}` : 'OK-GUEST'

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--kb-navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--kb-navy) 0%, #1a3a5c 100%)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <Link
          to="/map"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'white',
            opacity: 0.8,
            textDecoration: 'none',
            fontSize: '1rem',
          }}
        >
          <ChevronLeft size={20} /> Village Map
        </Link>
        <Link
          to="/profile"
          style={{
            color: 'white',
            opacity: 0.8,
            textDecoration: 'none',
            fontSize: '1rem',
          }}
        >
          My Profile
        </Link>
      </div>

      {/* Card Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: '100%',
            maxWidth: '380px',
          }}
        >
          {/* The Physical-Style Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: '3px solid var(--kb-gold)',
          }}>
            {/* Card Header - Navy bar */}
            <div style={{
              background: 'var(--kb-navy)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  color: 'var(--kb-gold)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '700',
                  fontSize: '1.5rem',
                  letterSpacing: '0.02em',
                }}>
                  KINDERBUCKS
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                  marginTop: '0.1rem',
                }}>
                  OK MEMBER CARD
                </div>
              </div>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'var(--kb-gold)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--kb-navy)',
                fontFamily: 'var(--font-display)',
                fontWeight: '700',
                fontSize: '1.75rem',
              }}>
                K
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '1.5rem' }}>
              {/* Member Name */}
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--kb-navy)',
                marginBottom: '0.25rem',
              }}>
                {isAuthenticated && profile?.displayName
                  ? profile.displayName
                  : 'OK Member'}
              </div>

              {/* Member Number */}
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                color: 'var(--kb-gray-500)',
                marginBottom: '1.5rem',
              }}>
                {memberNumber}
              </div>

              {/* Tier Display - THE BIG FOCUS */}
              <div style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                color: 'white',
                marginBottom: '1.5rem',
              }}>
                <TierIcon size={40} strokeWidth={1.5} style={{ marginBottom: '0.5rem' }} />
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem',
                }}>
                  {tier.name}
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  lineHeight: 1,
                }}>
                  {bonusPercent}%
                </div>
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.9,
                  marginTop: '0.25rem',
                }}>
                  Exchange Bonus
                </div>
              </div>

              {/* Stats Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                padding: '1rem 0',
                borderTop: '1px solid var(--kb-gray-200)',
                borderBottom: '1px solid var(--kb-gray-200)',
                marginBottom: '1.5rem',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: 'var(--kb-navy)',
                  }}>
                    {uniqueCount}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--kb-gray-500)',
                  }}>
                    Businesses
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: 'var(--kb-navy)',
                  }}>
                    {member?.totalCheckins || 0}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--kb-gray-500)',
                  }}>
                    Check-ins
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div style={{
                background: 'var(--kb-cream)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: 'var(--kb-navy)',
                  fontWeight: '600',
                }}>
                  <QrCode size={20} />
                  How to use
                </div>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--kb-gray-600)',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  Scan the business QR code<br />
                  to check in and get your discount code
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div style={{
              background: 'var(--kb-cream)',
              padding: '0.75rem 1.5rem',
              textAlign: 'center',
              borderTop: '1px solid var(--kb-gray-200)',
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--kb-gray-500)',
              }}>
                Village of Kinderhook • Est. 2026
              </div>
            </div>
          </div>

          {/* CTA below card */}
          <Link
            to="/businesses"
            className="btn btn-gold"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              marginTop: '1.5rem',
              padding: '1rem',
              fontSize: '1.1rem',
            }}
          >
            <QrCode size={22} />
            Find a Business to Check In
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default MyCard
