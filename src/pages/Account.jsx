import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getVisitorId, getMember } from '../firebase/members'
import { getAllBusinesses } from '../firebase/businesses'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { TIERS, getProgressToNextTier } from '../utils/tiers'

function Account() {
  const [member, setMember] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function load() {
      const visitorId = getVisitorId()
      const memberData = await getMember(visitorId)
      const allBusinesses = await getAllBusinesses()

      // Get exchange history
      try {
        const q = query(
          collection(db, 'exchanges'),
          where('visitorId', '==', visitorId),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        setExchanges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        console.error('Error loading exchanges:', err)
      }

      setMember(memberData)
      setBusinesses(allBusinesses)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="page page-center" style={{ flex: 1 }}>
          <div style={{ fontSize: '2rem' }}>Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  const tierKey = member?.tier || null
  const tier = tierKey ? TIERS[tierKey] : null
  const uniqueCount = member?.businessesVisited?.length || 0
  const progress = getProgressToNextTier(uniqueCount)

  const visitedBusinessNames = member?.businessesVisited?.map(code => {
    const biz = businesses.find(b => b.code === code)
    return biz ? biz.name : code
  }) || []

  const unvisitedBusinesses = businesses.filter(
    b => b.isActive && !member?.businessesVisited?.includes(b.code)
  )

  const totalExchanged = exchanges.reduce((sum, ex) => sum + (ex.kinderbucksAmount || 0), 0)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Account Header */}
      <section style={{
        background: 'var(--kb-navy)',
        color: 'var(--kb-white)',
        padding: '2rem 1rem',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: tier ? tier.color : 'var(--kb-gray-500)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}>
              {tier ? tier.emoji : '🎣'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--kb-gray-300)', marginBottom: '0.25rem' }}>
                OK Membership
              </div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                {tier ? tier.name : 'New Member'}
              </h1>
              <div style={{ fontSize: '0.9rem', color: 'var(--kb-gold)' }}>
                {tier ? `${Math.round(tier.bonus * 100)}% Exchange Bonus` : 'Start exploring to earn rewards'}
              </div>
            </div>
            <Link to="/exchange" className="btn btn-gold">
              Get Kinderbucks
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{
        background: 'var(--kb-white)',
        borderBottom: '1px solid var(--kb-gray-200)',
        position: 'sticky',
        top: '70px',
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          gap: '2rem',
          padding: '0 1rem',
        }}>
          {['overview', 'progress', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem 0',
                fontSize: '0.95rem',
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? 'var(--kb-navy)' : 'var(--kb-gray-500)',
                borderBottom: activeTab === tab ? '2px solid var(--kb-gold)' : '2px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <section style={{ padding: '2rem 1rem', background: 'var(--kb-cream)', flex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div className="stat-value">{uniqueCount}</div>
                  <div className="stat-label">Businesses Visited</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div className="stat-value">{member?.totalCheckins || 0}</div>
                  <div className="stat-label">Total Check-ins</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ color: 'var(--kb-gold)' }}>
                    ${totalExchanged.toFixed(0)}
                  </div>
                  <div className="stat-label">Kinderbucks Exchanged</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  <Link to="/exchange" className="btn btn-gold" style={{ textAlign: 'center' }}>
                    💵 Exchange
                  </Link>
                  <Link to="/businesses" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                    🏪 Find Businesses
                  </Link>
                  <Link to="/benefits" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                    ⭐ View Benefits
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Tier Progress */}
              {tier && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>Tier Progress</h3>

                  {progress.nextTier ? (
                    <>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: tier.color, fontWeight: '600' }}>{tier.name}</span>
                        <span style={{ color: 'var(--kb-gray-400)', margin: '0 0.5rem' }}>→</span>
                        <span style={{ color: progress.nextTier.color, fontWeight: '600' }}>{progress.nextTier.name}</span>
                      </div>
                      <div className="progress-bar" style={{ height: '12px', marginBottom: '0.5rem' }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress.progress}%`, background: tier.color }}
                        />
                      </div>
                      <p style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>
                        {progress.remaining} more business{progress.remaining !== 1 ? 'es' : ''} to reach {progress.nextTier.name}
                      </p>
                    </>
                  ) : (
                    <p style={{ color: 'var(--kb-gold)', fontWeight: '600' }}>
                      👑 Maximum tier reached! You're a Village Patron!
                    </p>
                  )}
                </div>
              )}

              {/* Visited */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
                  ✓ Businesses Visited ({visitedBusinessNames.length})
                </h3>
                {visitedBusinessNames.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {visitedBusinessNames.map((name, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#d4edda',
                          color: 'var(--kb-green)',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '100px',
                          fontSize: '0.85rem',
                        }}
                      >
                        ✓ {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--kb-gray-500)' }}>No businesses visited yet</p>
                )}
              </div>

              {/* Still to Visit */}
              {unvisitedBusinesses.length > 0 && (
                <div className="card">
                  <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
                    🎯 Still to Explore ({unvisitedBusinesses.length})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {unvisitedBusinesses.slice(0, 12).map((biz) => (
                      <span
                        key={biz.code}
                        style={{
                          background: 'var(--kb-gray-100)',
                          color: 'var(--kb-gray-600)',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '100px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {biz.name}
                      </span>
                    ))}
                    {unvisitedBusinesses.length > 12 && (
                      <span style={{ color: 'var(--kb-gray-500)', padding: '0.4rem' }}>
                        +{unvisitedBusinesses.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="card">
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>Exchange History</h3>
                {exchanges.length > 0 ? (
                  <div>
                    {exchanges.map((ex, i) => (
                      <div
                        key={ex.id}
                        style={{
                          padding: '1rem 0',
                          borderBottom: i < exchanges.length - 1 ? '1px solid var(--kb-gray-100)' : 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>
                            ${ex.usdAmount} → ${ex.kinderbucksAmount?.toFixed(2)} KB
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                            {ex.createdAt?.toDate?.()?.toLocaleDateString() || 'Pending'}
                            {' • '}
                            {Math.round(ex.bonusRate * 100)}% bonus
                          </div>
                        </div>
                        <span
                          className="badge"
                          style={{
                            background: ex.status === 'completed' ? '#d4edda' : '#fff3cd',
                            color: ex.status === 'completed' ? 'var(--kb-green)' : '#856404',
                          }}
                        >
                          {ex.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--kb-gray-500)' }}>
                    <p style={{ marginBottom: '1rem' }}>No exchanges yet</p>
                    <Link to="/exchange" className="btn btn-gold">
                      Make Your First Exchange
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Account
