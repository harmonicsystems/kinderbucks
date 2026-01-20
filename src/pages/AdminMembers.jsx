import { useState, useEffect } from 'react'
import {
  Users,
  Target,
  Star,
  Award,
  Crown,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { TIERS } from '../utils/tiers'
import { getAllBusinesses } from '../firebase/businesses'

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

function AdminMembers() {
  const [members, setMembers] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('checkins')
  const [filterTier, setFilterTier] = useState('all')

  useEffect(() => {
    async function loadData() {
      try {
        const membersSnap = await getDocs(collection(db, 'members'))
        const membersData = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const businessData = await getAllBusinesses()

        setMembers(membersData)
        setBusinesses(businessData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading members:', err)
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Get business name by code
  const getBusinessName = (code) => {
    const biz = businesses.find(b => b.code === code)
    return biz ? biz.name : code
  }

  // Sort members
  const sortedMembers = [...members].sort((a, b) => {
    switch (sortBy) {
      case 'checkins':
        return (b.totalCheckins || 0) - (a.totalCheckins || 0)
      case 'businesses':
        return (b.businessesVisited?.length || 0) - (a.businessesVisited?.length || 0)
      case 'recent':
        const aDate = a.lastCheckin?.toDate?.() || new Date(0)
        const bDate = b.lastCheckin?.toDate?.() || new Date(0)
        return bDate - aDate
      default:
        return 0
    }
  })

  // Filter by tier
  const filtered = filterTier === 'all'
    ? sortedMembers
    : sortedMembers.filter(m => m.tier === filterTier)

  // Stats
  const stats = {
    total: members.length,
    curious: members.filter(m => m.tier === 'curious').length,
    hooked: members.filter(m => m.tier === 'hooked').length,
    lineAndSinker: members.filter(m => m.tier === 'lineAndSinker').length,
    patron: members.filter(m => m.tier === 'patron').length,
    totalCheckins: members.reduce((sum, m) => sum + (m.totalCheckins || 0), 0),
  }

  if (loading) {
    return (
      <AdminLayout title="Member Management">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading members...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Member Management">
      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Total Members</div>
        </div>
        {Object.entries(TIER_ICONS).map(([key, Icon]) => (
          <div key={key} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Icon size={20} color={TIER_COLORS[key]} />
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: TIER_COLORS[key] }}>
                {stats[key]}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)', textTransform: 'capitalize' }}>
              {TIERS[key]?.name || key}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Tier Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterTier('all')}
            className={filterTier === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '0.5rem 1rem' }}
          >
            All
          </button>
          {Object.entries(TIER_ICONS).map(([key, Icon]) => (
            <button
              key={key}
              onClick={() => setFilterTier(key)}
              className={filterTier === key ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '0.5rem' }}
          >
            <option value="checkins">Most Check-ins</option>
            <option value="businesses">Most Businesses</option>
            <option value="recent">Recent Activity</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No members found</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 2fr',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderBottom: '2px solid var(--kb-navy)',
              fontWeight: '600',
              color: 'var(--kb-navy)',
              fontSize: '0.85rem',
            }}>
              <div>Member</div>
              <div>Tier</div>
              <div>Activity</div>
              <div>Businesses Visited</div>
            </div>

            {/* Rows */}
            {filtered.map(member => {
              const TierIcon = TIER_ICONS[member.tier] || Target
              const tierColor = TIER_COLORS[member.tier] || '#888'
              const tier = TIERS[member.tier] || TIERS.curious
              const visitedCount = member.businessesVisited?.length || 0

              return (
                <div
                  key={member.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 2fr',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: '1px solid var(--kb-gray-100)',
                    alignItems: 'center',
                  }}
                >
                  {/* Member ID */}
                  <div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: 'var(--kb-gray-500)',
                      wordBreak: 'break-all',
                    }}>
                      {member.id.substring(0, 16)}...
                    </div>
                    {member.lastCheckin && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--kb-gray-400)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.25rem',
                      }}>
                        <Calendar size={12} />
                        Last: {member.lastCheckin?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </div>
                    )}
                  </div>

                  {/* Tier */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: tierColor,
                      fontWeight: '600',
                    }}>
                      <TierIcon size={20} />
                      {tier.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                      {Math.round(tier.bonus * 100)}% bonus
                    </div>
                  </div>

                  {/* Activity */}
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--kb-navy)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      <TrendingUp size={16} />
                      {member.totalCheckins || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                      check-ins
                    </div>
                  </div>

                  {/* Businesses Visited */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginBottom: '0.5rem',
                      color: 'var(--kb-gray-600)',
                    }}>
                      <MapPin size={14} />
                      <span style={{ fontWeight: '500' }}>{visitedCount}</span>
                      <span style={{ fontSize: '0.85rem' }}>businesses</span>
                    </div>
                    {member.businessesVisited?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {member.businessesVisited.slice(0, 3).map(code => (
                          <span
                            key={code}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.15rem 0.5rem',
                              background: 'var(--kb-gray-100)',
                              borderRadius: '4px',
                              color: 'var(--kb-gray-600)',
                            }}
                          >
                            {getBusinessName(code)}
                          </span>
                        ))}
                        {member.businessesVisited.length > 3 && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--kb-gray-400)',
                          }}>
                            +{member.businessesVisited.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'var(--kb-gray-50)',
        borderRadius: '8px',
        textAlign: 'center',
        color: 'var(--kb-gray-600)',
        fontSize: '0.9rem',
      }}>
        Total of <strong>{stats.totalCheckins}</strong> check-ins across <strong>{stats.total}</strong> members
      </div>
    </AdminLayout>
  )
}

export default AdminMembers
