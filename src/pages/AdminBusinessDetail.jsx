import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Store,
  TrendingUp,
  Users,
  QrCode,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  Copy,
  Download,
  Target,
  Star,
  Award,
  Crown
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { getBusiness } from '../firebase/businesses'
import { getCheckinsByBusiness } from '../firebase/checkins'
import QRCode from '../components/QRCode'

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

function AdminBusinessDetail() {
  const { businessCode } = useParams()
  const [business, setBusiness] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [bizData, checkinData] = await Promise.all([
        getBusiness(businessCode),
        getCheckinsByBusiness(businessCode)
      ])

      setBusiness(bizData)
      setCheckins(checkinData)
      setLoading(false)
    }

    loadData()
  }, [businessCode])

  const copyUrl = () => {
    const url = `https://harmonicsystems.github.io/kinderbucks/#/checkin/${businessCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate stats
  const todayCheckins = checkins.filter(c => {
    const date = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }).length

  const thisWeekCheckins = checkins.filter(c => {
    const date = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date > weekAgo
  }).length

  const uniqueVisitors = new Set(checkins.map(c => c.visitorId)).size

  // Tier breakdown
  const tierBreakdown = checkins.reduce((acc, c) => {
    const tier = c.memberTier || 'curious'
    acc[tier] = (acc[tier] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <AdminLayout title="Business Details">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!business) {
    return (
      <AdminLayout title="Business Details">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Store size={48} color="var(--kb-gray-300)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--kb-navy)' }}>Business Not Found</h2>
          <p style={{ color: 'var(--kb-gray-500)', marginBottom: '1.5rem' }}>
            No business with code "{businessCode}" exists.
          </p>
          <Link to="/admin/businesses" className="btn btn-primary">
            Back to Businesses
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const checkinUrl = `https://harmonicsystems.github.io/kinderbucks/#/checkin/${businessCode}`

  return (
    <AdminLayout title="Business Details">
      {/* Back link */}
      <Link
        to="/admin/businesses"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: 'var(--kb-gray-500)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Directory
      </Link>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            background: business.isActive ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
            color: business.isActive ? 'var(--kb-green)' : '#e74c3c',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
          }}>
            {business.isActive ? 'Active' : 'Inactive'}
          </div>
          <h1 style={{ color: 'var(--kb-navy)', marginBottom: '0.25rem', fontSize: '2rem' }}>
            {business.name}
          </h1>
          <div style={{ fontFamily: 'monospace', color: 'var(--kb-gray-500)' }}>
            {businessCode}
          </div>
        </div>

        {/* QR Code */}
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '1rem',
          }}>
            <QRCode value={checkinUrl} size={120} showFrame={false} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={copyUrl}
              className="btn btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
            >
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
            >
              <Download size={14} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(39, 174, 96, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={22} color="var(--kb-green)" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                {business.checkinCount || 0}
              </div>
              <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                Total Check-ins
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(52, 152, 219, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock size={22} color="#3498db" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                {todayCheckins}
              </div>
              <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                Today
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(155, 89, 182, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calendar size={22} color="#9b59b6" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                {thisWeekCheckins}
              </div>
              <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                This Week
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(201, 162, 39, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={22} color="var(--kb-gold-dark)" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                {uniqueVisitors}
              </div>
              <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                Unique Visitors
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Tier Breakdown */}
        <div className="card">
          <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem' }}>
            Check-ins by Member Tier
          </h3>
          {Object.keys(tierBreakdown).length === 0 ? (
            <p style={{ color: 'var(--kb-gray-500)' }}>No check-ins yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['curious', 'hooked', 'lineAndSinker', 'patron'].map(tierKey => {
                const count = tierBreakdown[tierKey] || 0
                if (count === 0 && !tierBreakdown[tierKey]) return null
                const TierIcon = TIER_ICONS[tierKey]
                const color = TIER_COLORS[tierKey]
                const tierNames = {
                  curious: 'Curious',
                  hooked: 'Hooked',
                  lineAndSinker: 'Line & Sinker',
                  patron: 'Village Patron'
                }
                const maxCount = Math.max(...Object.values(tierBreakdown), 1)
                const percentage = (count / maxCount) * 100

                return (
                  <div key={tierKey}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TierIcon size={18} color={color} />
                        <span style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>{tierNames[tierKey]}</span>
                      </div>
                      <span style={{ color: 'var(--kb-gray-500)', fontWeight: '600' }}>{count}</span>
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
                        background: color,
                        borderRadius: '4px',
                      }} />
                    </div>
                  </div>
                )
              }).filter(Boolean)}
            </div>
          )}
        </div>

        {/* Check-in URL Info */}
        <div className="card">
          <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
            Check-in Information
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontSize: '0.85rem' }}>
              Check-in URL
            </label>
            <input
              type="text"
              value={checkinUrl}
              readOnly
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{
            background: 'var(--kb-cream)',
            borderRadius: '8px',
            padding: '1rem',
          }}>
            <h4 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              How Check-ins Work
            </h4>
            <ul style={{ color: 'var(--kb-gray-600)', fontSize: '0.9rem', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
              <li>Customer scans QR code with phone</li>
              <li>App shows verification code + bonus %</li>
              <li>Customer shows screen to cashier</li>
              <li>1 hour cooldown between check-ins</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{
          color: 'var(--kb-navy)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Clock size={20} /> Recent Check-ins
        </h3>

        {checkins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No check-ins recorded yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checkins.slice(0, 25).map((checkin, i) => {
              const date = checkin.timestamp?.toDate
                ? checkin.timestamp.toDate()
                : new Date(checkin.timestamp)
              const TierIcon = TIER_ICONS[checkin.memberTier] || Target
              const tierColor = TIER_COLORS[checkin.memberTier] || '#6b7280'

              return (
                <div
                  key={checkin.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--kb-gray-50)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'var(--kb-green)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CheckCircle size={18} color="white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: 'var(--kb-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Check-in
                        {checkin.memberTier && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: tierColor,
                            background: `${tierColor}15`,
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                          }}>
                            <TierIcon size={12} />
                            {checkin.memberTier}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)', fontFamily: 'monospace' }}>
                        {checkin.visitorId?.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                    {date.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminBusinessDetail
