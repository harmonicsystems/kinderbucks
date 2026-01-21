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
  Palette,
  Gift,
  ChevronRight,
  Check,
  Flame,
  Calendar,
  Map,
  Heart,
  Compass
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getCurrentUserId, getMember } from '../firebase/members'
import { getMemberCheckinsByCategory, getMemberCheckinsByBusiness, getMemberCheckins } from '../firebase/checkins'
import { getAllBusinesses, getCrossRewardsForMember } from '../firebase/businesses'
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
  const [crossRewards, setCrossRewards] = useState([])
  const [recentCheckins, setRecentCheckins] = useState([])
  const [thisWeekCount, setThisWeekCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const userId = getCurrentUserId()
      const [memberData, businesses] = await Promise.all([
        getMember(userId),
        getAllBusinesses()
      ])
      setMember(memberData)

      // Get check-ins by category and by business
      if (userId) {
        const [catCounts, bizCheckins, allCheckins] = await Promise.all([
          getMemberCheckinsByCategory(userId, businesses),
          getMemberCheckinsByBusiness(userId, businesses),
          getMemberCheckins(userId)
        ])
        setCategoryCheckins(catCounts)

        // Calculate this week's check-ins
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekCheckins = allCheckins.filter(c => {
          const date = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp)
          return date > weekAgo
        })
        setThisWeekCount(weekCheckins.length)

        // Get recent check-ins (last 5)
        const sorted = allCheckins.sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
          return dateB - dateA
        })
        setRecentCheckins(sorted.slice(0, 5))

        // Get cross-rewards with progress
        const rewards = await getCrossRewardsForMember(userId, bizCheckins)
        setCrossRewards(rewards)
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

  // Helper function for time ago
  const getTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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

              {/* Achievement Badges */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                {/* Explorer Badge - 5 different businesses */}
                {uniqueCount >= 5 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(37, 99, 235, 0.1)',
                    border: '1px solid #2563eb',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#2563eb',
                  }}>
                    <Compass size={14} />
                    Explorer
                  </div>
                )}

                {/* Regular Badge - 10+ total check-ins */}
                {(member?.totalCheckins || 0) >= 10 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(39, 174, 96, 0.1)',
                    border: '1px solid #27ae60',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#27ae60',
                  }}>
                    <Star size={14} />
                    Regular
                  </div>
                )}

                {/* On Fire Badge - 7+ check-ins this week */}
                {thisWeekCount >= 7 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(230, 126, 34, 0.1)',
                    border: '1px solid #e67e22',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#e67e22',
                  }}>
                    <Flame size={14} />
                    On Fire!
                  </div>
                )}

                {/* Completionist Badge - visited all businesses (assume 19 for now) */}
                {uniqueCount >= 15 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(201, 162, 39, 0.15)',
                    border: '2px solid var(--kb-gold)',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--kb-gold-dark)',
                  }}>
                    <Crown size={14} />
                    Completionist
                  </div>
                )}

                {/* Loyalist Badge - 5+ visits to same business */}
                {Object.values(categoryCheckins).some(count => count >= 5) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(155, 89, 182, 0.1)',
                    border: '1px solid #9b59b6',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#9b59b6',
                  }}>
                    <Heart size={14} />
                    Loyalist
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                padding: '0.75rem 0',
                borderTop: '1px solid var(--kb-gray-200)',
                borderBottom: '1px solid var(--kb-gray-200)',
                marginBottom: '1rem',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: 'var(--kb-navy)',
                  }}>
                    {uniqueCount}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--kb-gray-500)',
                  }}>
                    Businesses
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: thisWeekCount > 0 ? 'var(--kb-green)' : 'var(--kb-navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                  }}>
                    {thisWeekCount > 0 && <Flame size={16} color="var(--kb-green)" />}
                    {thisWeekCount}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--kb-gray-500)',
                  }}>
                    This Week
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: 'var(--kb-navy)',
                  }}>
                    {member?.totalCheckins || 0}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--kb-gray-500)',
                  }}>
                    All Time
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

          {/* Partner Rewards Section */}
          {crossRewards.length > 0 && (
            <div style={{
              marginTop: '1.5rem',
              background: 'white',
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                color: 'var(--kb-navy)',
                fontWeight: '600',
              }}>
                <Gift size={18} color="var(--kb-green)" />
                Partner Rewards
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {crossRewards.slice(0, 3).map((reward) => (
                  <div
                    key={reward.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem',
                      background: reward.isUnlocked ? 'rgba(39, 174, 96, 0.1)' : 'var(--kb-gray-50)',
                      borderRadius: '10px',
                      border: reward.isUnlocked ? '1px solid var(--kb-green)' : '1px solid var(--kb-gray-200)',
                    }}
                  >
                    {reward.isUnlocked ? (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--kb-green)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check size={16} color="white" />
                      </div>
                    ) : (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '2px solid var(--kb-gray-200)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--kb-gray-500)',
                      }}>
                        {reward.currentCheckins}/{reward.requiredCheckins}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: reward.isUnlocked ? 'var(--kb-green)' : 'var(--kb-navy)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {reward.reward}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--kb-gray-500)',
                      }}>
                        {reward.isUnlocked
                          ? `Unlocked! Redeem at ${reward.offeringBusinessName}`
                          : `${reward.checkinsRemaining} more visits to ${reward.partnerBusinessName}`
                        }
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--kb-gray-400)" />
                  </div>
                ))}
              </div>
              {crossRewards.length > 3 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--kb-gray-500)',
                }}>
                  +{crossRewards.length - 3} more rewards available
                </div>
              )}
            </div>
          )}

          {/* Recent Activity */}
          {recentCheckins.length > 0 && (
            <div style={{
              marginTop: '1.5rem',
              background: 'white',
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                color: 'var(--kb-navy)',
                fontWeight: '600',
              }}>
                <Calendar size={18} color="var(--kb-navy)" />
                Recent Activity
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentCheckins.map((checkin, idx) => {
                  const date = checkin.timestamp?.toDate ? checkin.timestamp.toDate() : new Date(checkin.timestamp)
                  const timeAgo = getTimeAgo(date)

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: 'var(--kb-gray-50)',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', color: 'var(--kb-navy)' }}>
                        {checkin.businessName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--kb-gray-500)' }}>
                        {timeAgo}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* CTA below card */}
          <Link
            to="/map"
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
