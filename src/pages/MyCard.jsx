import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Target,
  Star,
  Award,
  Crown,
  ChevronLeft,
  QrCode,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Palette
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getCurrentUserId, getMember } from '../firebase/members'
import { getMemberCheckinsByCategory } from '../firebase/checkins'
import { getAllBusinesses } from '../firebase/businesses'
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

// Category badge configuration
const CATEGORY_BADGES = {
  food: {
    name: 'Food Explorer',
    Icon: UtensilsCrossed,
    color: '#e67e22',
    thresholds: [
      { count: 3, level: 'bronze', label: 'Taster' },
      { count: 10, level: 'silver', label: 'Regular' },
      { count: 25, level: 'gold', label: 'Connoisseur' }
    ]
  },
  retail: {
    name: 'Shop Local Hero',
    Icon: ShoppingBag,
    color: '#3498db',
    thresholds: [
      { count: 3, level: 'bronze', label: 'Browser' },
      { count: 10, level: 'silver', label: 'Shopper' },
      { count: 25, level: 'gold', label: 'VIP' }
    ]
  },
  services: {
    name: 'Service Supporter',
    Icon: Briefcase,
    color: '#9b59b6',
    thresholds: [
      { count: 3, level: 'bronze', label: 'Visitor' },
      { count: 10, level: 'silver', label: 'Regular' },
      { count: 25, level: 'gold', label: 'Loyal' }
    ]
  },
  arts: {
    name: 'Culture Seeker',
    Icon: Palette,
    color: '#1abc9c',
    thresholds: [
      { count: 3, level: 'bronze', label: 'Curious' },
      { count: 10, level: 'silver', label: 'Enthusiast' },
      { count: 25, level: 'gold', label: 'Patron' }
    ]
  }
}

const BADGE_LEVEL_COLORS = {
  none: { bg: '#f3f4f6', border: '#e5e7eb', text: '#9ca3af' },
  bronze: { bg: '#fef3e2', border: '#cd7f32', text: '#cd7f32' },
  silver: { bg: '#f1f5f9', border: '#a8a9ad', text: '#71717a' },
  gold: { bg: '#fef9c3', border: '#c9a227', text: '#92710c' }
}

function getBadgeLevel(count, thresholds) {
  let level = 'none'
  let nextThreshold = thresholds[0]
  let currentLabel = null

  for (const threshold of thresholds) {
    if (count >= threshold.count) {
      level = threshold.level
      currentLabel = threshold.label
      const nextIndex = thresholds.indexOf(threshold) + 1
      nextThreshold = thresholds[nextIndex] || null
    }
  }

  return { level, currentLabel, nextThreshold, count }
}

function MyCard() {
  const { user, profile, isAuthenticated } = useAuth()
  const [member, setMember] = useState(null)
  const [categoryCheckins, setCategoryCheckins] = useState({ food: 0, retail: 0, services: 0, arts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const userId = getCurrentUserId()
      const [memberData, businesses] = await Promise.all([
        getMember(userId),
        getAllBusinesses()
      ])
      setMember(memberData)

      // Get check-ins by category
      if (userId) {
        const catCounts = await getMemberCheckinsByCategory(userId, businesses)
        setCategoryCheckins(catCounts)
      }

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
              {/* Member Name & Tier */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: 'var(--kb-navy)',
                    marginBottom: '0.15rem',
                  }}>
                    {isAuthenticated && profile?.displayName
                      ? profile.displayName
                      : 'OK Member'}
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    color: 'var(--kb-gray-500)',
                  }}>
                    {memberNumber}
                  </div>
                </div>
                {/* Tier Badge */}
                <div style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  borderRadius: '12px',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                }}>
                  <TierIcon size={18} />
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{tier.name}</span>
                </div>
              </div>

              {/* Category Badges - THE NEW FOCUS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}>
                {Object.entries(CATEGORY_BADGES).map(([category, config]) => {
                  const count = categoryCheckins[category] || 0
                  const badge = getBadgeLevel(count, config.thresholds)
                  const levelColors = BADGE_LEVEL_COLORS[badge.level]
                  const Icon = config.Icon

                  return (
                    <div
                      key={category}
                      style={{
                        background: levelColors.bg,
                        border: `2px solid ${levelColors.border}`,
                        borderRadius: '12px',
                        padding: '0.75rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        marginBottom: '0.35rem',
                      }}>
                        <Icon size={16} color={config.color} />
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: config.color,
                          textTransform: 'uppercase',
                        }}>
                          {category}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: badge.level === 'none' ? 'var(--kb-gray-400)' : levelColors.text,
                        lineHeight: 1,
                      }}>
                        {count}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: badge.level === 'none' ? 'var(--kb-gray-400)' : levelColors.text,
                        marginTop: '0.15rem',
                      }}>
                        {badge.currentLabel || (badge.nextThreshold ? `${badge.nextThreshold.count - count} to ${badge.nextThreshold.label}` : 'check-ins')}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total Stats Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                padding: '0.75rem 0',
                borderTop: '1px solid var(--kb-gray-200)',
                borderBottom: '1px solid var(--kb-gray-200)',
                marginBottom: '1rem',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--kb-navy)',
                  }}>
                    {uniqueCount}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--kb-gray-500)',
                  }}>
                    Businesses
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--kb-navy)',
                  }}>
                    {member?.totalCheckins || 0}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--kb-gray-500)',
                  }}>
                    Total Check-ins
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div style={{
                background: 'var(--kb-cream)',
                borderRadius: '10px',
                padding: '0.75rem',
                textAlign: 'center',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem',
                  color: 'var(--kb-navy)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}>
                  <QrCode size={16} />
                  Scan QR codes to earn badges
                </div>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--kb-gray-500)',
                  margin: 0,
                }}>
                  Visit businesses to level up your categories
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
