import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Banknote,
  ArrowRightLeft,
  Users,
  Store,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  QrCode,
  Send
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { getAllKinderbucks } from '../firebase/kinderbucks'
import { getAllBusinesses } from '../firebase/businesses'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCurrency: 0,
    inCirculation: 0,
    circulationValue: 0,
    pendingExchanges: 0,
    pendingValue: 0,
    totalMembers: 0,
    activeBusinesses: 0,
    totalCheckins: 0,
  })
  const [recentExchanges, setRecentExchanges] = useState([])
  const [denominationBreakdown, setDenominationBreakdown] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Get Kinderbucks data
        const kinderbucks = await getAllKinderbucks()
        const issued = kinderbucks.filter(k => k.status === 'issued' || k.status === 'active')

        // Denomination breakdown
        const breakdown = {}
        issued.forEach(k => {
          const denom = k.denomination || 0
          breakdown[denom] = (breakdown[denom] || 0) + 1
        })
        setDenominationBreakdown(breakdown)

        // Get businesses
        const businesses = await getAllBusinesses()
        const activeBusinesses = businesses.filter(b => b.isActive)
        const totalCheckins = businesses.reduce((sum, b) => sum + (b.checkinCount || 0), 0)

        // Get pending exchanges
        const exchangesQuery = query(
          collection(db, 'exchanges'),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        )
        const exchangesSnap = await getDocs(exchangesQuery)
        const pending = exchangesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const pendingValue = pending.reduce((sum, ex) => sum + (ex.kinderbucksAmount || 0), 0)

        // Get recent exchanges (all statuses)
        const recentQuery = query(
          collection(db, 'exchanges'),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const recentSnap = await getDocs(recentQuery)
        setRecentExchanges(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

        // Get members count
        const membersSnap = await getDocs(collection(db, 'members'))

        setStats({
          totalCurrency: kinderbucks.length,
          inCirculation: issued.length,
          circulationValue: issued.reduce((sum, k) => sum + (k.denomination || 0), 0),
          pendingExchanges: pending.length,
          pendingValue,
          totalMembers: membersSnap.size,
          activeBusinesses: activeBusinesses.length,
          totalCheckins,
        })

        setLoading(false)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const StatCard = ({ icon: Icon, label, value, subtext, color, to }) => (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: '700',
            color: color || 'var(--kb-navy)',
          }}>
            {value}
          </div>
          {subtext && (
            <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {subtext}
            </div>
          )}
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          background: `${color || 'var(--kb-navy)'}15`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={24} color={color || 'var(--kb-navy)'} />
        </div>
      </div>
      {to && (
        <Link to={to} style={{
          display: 'block',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--kb-gray-100)',
          color: 'var(--kb-navy)',
          fontSize: '0.85rem',
          fontWeight: '500',
        }}>
          View Details →
        </Link>
      )}
    </div>
  )

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <StatCard
          icon={Banknote}
          label="In Circulation"
          value={`$${stats.circulationValue.toLocaleString()}`}
          subtext={`${stats.inCirculation} bills issued`}
          color="var(--kb-green)"
        />
        <StatCard
          icon={Clock}
          label="Pending Exchanges"
          value={stats.pendingExchanges}
          subtext={`$${stats.pendingValue.toFixed(2)} value`}
          color={stats.pendingExchanges > 0 ? '#e67e22' : 'var(--kb-gray-400)'}
          to="/admin/exchanges"
        />
        <StatCard
          icon={Users}
          label="OK Members"
          value={stats.totalMembers}
          subtext={`${stats.totalCheckins} total check-ins`}
          color="var(--kb-navy)"
          to="/admin/members"
        />
        <StatCard
          icon={Store}
          label="Active Businesses"
          value={stats.activeBusinesses}
          color="var(--kb-gold-dark)"
          to="/admin/businesses"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Exchanges */}
        <div className="card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{ color: 'var(--kb-navy)', margin: 0 }}>Recent Exchanges</h3>
            <Link to="/admin/exchanges" style={{ fontSize: '0.85rem', color: 'var(--kb-navy)' }}>
              View All →
            </Link>
          </div>

          {recentExchanges.length === 0 ? (
            <p style={{ color: 'var(--kb-gray-500)' }}>No exchanges yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentExchanges.map(ex => (
                <div
                  key={ex.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--kb-gray-50)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {ex.status === 'completed' ? (
                      <CheckCircle size={18} color="var(--kb-green)" />
                    ) : ex.status === 'pending' ? (
                      <Clock size={18} color="#e67e22" />
                    ) : (
                      <AlertCircle size={18} color="var(--kb-gray-400)" />
                    )}
                    <div>
                      <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                        ${ex.usdAmount} → ${ex.kinderbucksAmount?.toFixed(2)} KB
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                        {ex.createdAt?.toDate?.()?.toLocaleDateString() || 'Pending'}
                      </div>
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: ex.status === 'completed' ? '#d4edda' :
                                  ex.status === 'pending' ? '#fff3cd' : '#f8f9fa',
                      color: ex.status === 'completed' ? 'var(--kb-green)' :
                             ex.status === 'pending' ? '#856404' : 'var(--kb-gray-600)',
                    }}
                  >
                    {ex.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Circulation Breakdown */}
        <div className="card">
          <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem' }}>Circulation by Denomination</h3>

          {Object.keys(denominationBreakdown).length === 0 ? (
            <p style={{ color: 'var(--kb-gray-500)' }}>No currency in circulation yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 5, 10, 20].map(denom => {
                const count = denominationBreakdown[denom] || 0
                const maxCount = Math.max(...Object.values(denominationBreakdown), 1)
                const percentage = (count / maxCount) * 100
                const colors = {
                  1: '#27ae60',
                  5: '#3498db',
                  10: '#9b59b6',
                  20: '#c9a227',
                }
                return (
                  <div key={denom}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}>
                      <span style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>${denom}</span>
                      <span style={{ color: 'var(--kb-gray-500)' }}>
                        {count} bills (${count * denom})
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'var(--kb-gray-100)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: colors[denom],
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin/generate" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={18} /> Generate QR Codes
          </Link>
          <Link to="/admin/issue" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} /> Issue Currency
          </Link>
          <Link to="/admin/exchanges" className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightLeft size={18} /> Process Exchanges
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
