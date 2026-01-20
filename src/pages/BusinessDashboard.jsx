import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Store,
  TrendingUp,
  Users,
  QrCode,
  Calendar,
  Download,
  Copy,
  CheckCircle,
  Clock,
  ArrowUp,
  Home
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getBusiness } from '../firebase/businesses'
import { getCheckinsByBusiness } from '../firebase/checkins'
import QRCode from '../components/QRCode'
import Header from '../components/Header'
import Footer from '../components/Footer'

function BusinessDashboard() {
  const { profile } = useAuth()
  const [business, setBusiness] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!profile?.businessCode) {
        setLoading(false)
        return
      }

      const [bizData, checkinData] = await Promise.all([
        getBusiness(profile.businessCode),
        getCheckinsByBusiness(profile.businessCode)
      ])

      setBusiness(bizData)
      setCheckins(checkinData)
      setLoading(false)
    }

    loadData()
  }, [profile?.businessCode])

  const copyUrl = () => {
    const url = `https://harmonicsystems.github.io/kinderbucks/#/checkin/${profile.businessCode}`
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--kb-cream)',
        }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!profile?.businessCode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--kb-cream)',
          padding: '2rem',
        }}>
          <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <Store size={48} color="var(--kb-gray-400)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>No Business Assigned</h2>
            <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1.5rem' }}>
              Your account doesn't have a business assigned yet. Contact an administrator to get set up.
            </p>
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const checkinUrl = `https://harmonicsystems.github.io/kinderbucks/#/checkin/${profile.businessCode}`

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: 'var(--kb-cream)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
                  Business Dashboard
                </div>
                <h1 style={{ color: 'var(--kb-navy)', marginBottom: '0.25rem' }}>
                  {business?.name || profile.businessCode}
                </h1>
                <p style={{ color: 'var(--kb-gray-500)' }}>
                  Manage your Kinderbucks check-ins
                </p>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <QrCode size={18} />
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            </div>
          </motion.div>

          {/* QR Code Panel */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="card"
              style={{ marginBottom: '2rem', padding: '2rem' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                flexWrap: 'wrap',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--kb-green) 0%, #1e8449 100%)',
                    borderRadius: '16px',
                    padding: '3px',
                    display: 'inline-block',
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '14px',
                      padding: '16px',
                    }}>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'var(--kb-green)',
                        letterSpacing: '2px',
                        marginBottom: '8px',
                      }}>
                        CHECK IN AT
                      </div>
                      <QRCode
                        value={checkinUrl}
                        size={150}
                        denomination={1}
                        showFrame={false}
                      />
                      <div style={{
                        marginTop: '8px',
                        fontWeight: '600',
                        color: 'var(--kb-navy)',
                      }}>
                        {business?.name}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
                    Display This QR Code
                  </h3>
                  <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1rem' }}>
                    Print and display this QR code at your counter. Customers can scan it with their phone to check in and build their Kinderhooker status.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'var(--kb-gray-600)',
                      fontSize: '0.85rem',
                    }}>
                      Check-in URL
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={checkinUrl}
                        readOnly
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                      />
                      <button
                        onClick={copyUrl}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-gold"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Download size={18} /> Print QR Code
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(39, 174, 96, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp size={24} color="var(--kb-green)" />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                    {business?.checkinCount || 0}
                  </div>
                  <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>
                    Total Check-ins
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(52, 152, 219, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Clock size={24} color="#3498db" />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                    {todayCheckins}
                  </div>
                  <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>
                    Today
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(155, 89, 182, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Calendar size={24} color="#9b59b6" />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                    {thisWeekCheckins}
                  </div>
                  <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>
                    This Week
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(201, 162, 39, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Users size={24} color="var(--kb-gold-dark)" />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                    {uniqueVisitors}
                  </div>
                  <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>
                    Unique Visitors
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Check-ins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
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
                <p>No check-ins yet</p>
                <p style={{ fontSize: '0.9rem' }}>Display your QR code to start receiving check-ins!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {checkins.slice(0, 20).map((checkin, i) => {
                  const date = checkin.timestamp?.toDate
                    ? checkin.timestamp.toDate()
                    : new Date(checkin.timestamp)

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
                          <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                            Check-in recorded
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                            {checkin.tier && `${checkin.tier} member`}
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
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default BusinessDashboard
