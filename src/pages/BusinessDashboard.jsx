import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Plus,
  Trash2,
  Tag,
  BookOpen,
  BarChart3,
  Percent,
  DollarSign,
  Info,
  Printer,
  Smartphone,
  MapPin,
  Award,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Gift
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getBusinessWithBalance, getAllBusinesses, updateBusinessLoyaltyRewards } from '../firebase/businesses'
import { getCheckinsByBusiness, getAllCheckins } from '../firebase/checkins'
import { getBusinessPromoCodes, createPromoCode, togglePromoCodeActive, deletePromoCode } from '../firebase/promoCodes'
import { getBusinessTransactions } from '../firebase/transactions'
import QRCode from '../components/QRCode'
import Header from '../components/Header'
import Footer from '../components/Footer'
import RedemptionModal from '../components/RedemptionModal'

function BusinessDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [promoCodes, setPromoCodes] = useState([])
  const [allBusinesses, setAllBusinesses] = useState([])
  const [allCheckins, setAllCheckins] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPromoForm, setShowPromoForm] = useState(false)
  const [showRedemptionModal, setShowRedemptionModal] = useState(false)
  const [expandedGuide, setExpandedGuide] = useState(null)
  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: 10,
    minTier: '',
    expiresAt: '',
    usageLimit: ''
  })
  const [savingPromo, setSavingPromo] = useState(false)
  const [loyaltyRewards, setLoyaltyRewards] = useState([])
  const [showLoyaltyForm, setShowLoyaltyForm] = useState(false)
  const [loyaltyForm, setLoyaltyForm] = useState({
    checkinsRequired: 5,
    reward: '',
    rewardType: 'discount',
    rewardValue: 10
  })
  const [savingLoyalty, setSavingLoyalty] = useState(false)

  const loadData = async () => {
    if (!profile?.businessCode) {
      setLoading(false)
      return
    }

    try {
      const [bizData, checkinData, promoData, allBiz, allCheck, txnData] = await Promise.all([
        getBusinessWithBalance(profile.businessCode),
        getCheckinsByBusiness(profile.businessCode),
        getBusinessPromoCodes(profile.businessCode).catch(() => []), // Index may not be ready
        getAllBusinesses(),
        getAllCheckins(),
        getBusinessTransactions(profile.businessCode).catch(() => []) // Index may not be ready
      ])

      setBusiness(bizData)
      setCheckins(checkinData)
      setPromoCodes(promoData)
      setAllBusinesses(allBiz.filter(b => b.isActive))
      setAllCheckins(allCheck)
      setTransactions(txnData)
      setLoyaltyRewards(bizData?.loyaltyRewards || [])
    } catch (err) {
      console.error('Error loading business data:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
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

  const lastWeekCheckins = checkins.filter(c => {
    const date = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp)
    const weekAgo = new Date()
    const twoWeeksAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return date > twoWeeksAgo && date <= weekAgo
  }).length

  const weeklyGrowth = lastWeekCheckins > 0
    ? Math.round(((thisWeekCheckins - lastWeekCheckins) / lastWeekCheckins) * 100)
    : thisWeekCheckins > 0 ? 100 : 0

  const uniqueVisitors = new Set(checkins.map(c => c.visitorId)).size

  // Village-wide trends
  const totalVillageCheckins = allCheckins.length
  const villageThisWeek = allCheckins.filter(c => {
    const date = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date > weekAgo
  }).length

  const topBusinesses = allBusinesses
    .sort((a, b) => (b.checkinCount || 0) - (a.checkinCount || 0))
    .slice(0, 5)

  const myRank = allBusinesses
    .sort((a, b) => (b.checkinCount || 0) - (a.checkinCount || 0))
    .findIndex(b => b.code === profile?.businessCode) + 1

  // Handle promo code creation
  const handleCreatePromo = async (e) => {
    e.preventDefault()
    if (!promoForm.code || !promoForm.description) return

    setSavingPromo(true)
    try {
      await createPromoCode({
        businessCode: profile.businessCode,
        code: promoForm.code,
        description: promoForm.description,
        discountType: promoForm.discountType,
        discountValue: Number(promoForm.discountValue),
        minTier: promoForm.minTier || null,
        expiresAt: promoForm.expiresAt ? new Date(promoForm.expiresAt) : null,
        usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : null
      })

      const updated = await getBusinessPromoCodes(profile.businessCode)
      setPromoCodes(updated)
      setPromoForm({
        code: '',
        description: '',
        discountType: 'percent',
        discountValue: 10,
        minTier: '',
        expiresAt: '',
        usageLimit: ''
      })
      setShowPromoForm(false)
    } catch (err) {
      console.error('Error creating promo:', err)
      alert('Error creating promo code')
    }
    setSavingPromo(false)
  }

  const handleTogglePromo = async (promoId, isActive) => {
    await togglePromoCodeActive(promoId, !isActive)
    const updated = await getBusinessPromoCodes(profile.businessCode)
    setPromoCodes(updated)
  }

  const handleDeletePromo = async (promoId) => {
    if (!confirm('Delete this promo code?')) return
    await deletePromoCode(promoId)
    const updated = await getBusinessPromoCodes(profile.businessCode)
    setPromoCodes(updated)
  }

  // Loyalty reward handlers
  const handleAddLoyaltyReward = async (e) => {
    e.preventDefault()
    if (!loyaltyForm.reward) return

    setSavingLoyalty(true)
    try {
      const newReward = {
        checkinsRequired: Number(loyaltyForm.checkinsRequired),
        reward: loyaltyForm.reward,
        rewardType: loyaltyForm.rewardType,
        rewardValue: Number(loyaltyForm.rewardValue)
      }

      const updatedRewards = [...loyaltyRewards, newReward].sort((a, b) => a.checkinsRequired - b.checkinsRequired)
      await updateBusinessLoyaltyRewards(profile.businessCode, updatedRewards)

      setLoyaltyRewards(updatedRewards)
      setLoyaltyForm({
        checkinsRequired: 5,
        reward: '',
        rewardType: 'discount',
        rewardValue: 10
      })
      setShowLoyaltyForm(false)
    } catch (err) {
      console.error('Error adding loyalty reward:', err)
      alert('Error adding loyalty reward')
    }
    setSavingLoyalty(false)
  }

  const handleRemoveLoyaltyReward = async (index) => {
    if (!confirm('Remove this reward tier?')) return

    const updatedRewards = loyaltyRewards.filter((_, i) => i !== index)
    await updateBusinessLoyaltyRewards(profile.businessCode, updatedRewards)
    setLoyaltyRewards(updatedRewards)
  }

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

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'kinderbucks', label: 'Kinderbucks', icon: Banknote },
    { key: 'loyalty', label: 'Loyalty Rewards', icon: Gift },
    { key: 'qrcode', label: 'QR Code', icon: QrCode },
    { key: 'promos', label: 'Promo Codes', icon: Tag },
    { key: 'trends', label: 'Village Trends', icon: TrendingUp },
    { key: 'guide', label: 'Resource Guide', icon: BookOpen },
  ]

  const guides = [
    {
      id: 'qr-setup',
      title: 'Setting Up Your QR Code',
      icon: QrCode,
      content: [
        'Print your unique QR code and display it prominently at your counter or entrance',
        'Use a stand or frame to keep it visible and accessible for customers',
        'Consider printing multiple codes for different checkout areas',
        'Test the code regularly to ensure it scans correctly'
      ]
    },
    {
      id: 'customer-flow',
      title: 'Customer Check-in Flow',
      icon: Smartphone,
      content: [
        'Customers scan the QR code with their phone camera',
        'They\'re taken to your check-in page (no app download needed)',
        'If signed in, they earn a check-in toward their Kinderhooker status',
        'Their tier badge appears so you can offer appropriate discounts'
      ]
    },
    {
      id: 'tier-discounts',
      title: 'Member Tier Discounts',
      icon: Award,
      content: [
        'Curious (0-4 check-ins): New to Kinderhook - welcome them warmly!',
        'Hooked (5-14 check-ins): Regular visitors - consider small perks',
        'Line & Sinker (15-29 check-ins): Loyal customers - offer meaningful discounts',
        'Village Patron (30+ check-ins): Your best customers - VIP treatment!'
      ]
    },
    {
      id: 'promo-tips',
      title: 'Creating Effective Promos',
      icon: Tag,
      content: [
        'Create tier-specific promos to reward loyalty',
        'Set expiration dates to create urgency',
        'Use memorable, easy-to-type codes',
        'Track usage to see what resonates with customers'
      ]
    }
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: 'var(--kb-cream)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '1.5rem' }}
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
                  Business Resource Center
                </div>
                <h1 style={{ color: 'var(--kb-navy)', marginBottom: '0.25rem' }}>
                  {business?.name || profile.businessCode}
                </h1>
                <p style={{ color: 'var(--kb-gray-500)' }}>
                  Manage check-ins, promos, and see village trends
                </p>
              </div>
              {myRank > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--kb-gold) 0%, var(--kb-gold-dark) 100%)',
                  color: 'white',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Village Rank</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>#{myRank}</div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1rem',
                    background: activeTab === tab.key ? 'var(--kb-navy)' : 'white',
                    color: activeTab === tab.key ? 'white' : 'var(--kb-gray-600)',
                    border: '1px solid var(--kb-gray-200)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card"
                  style={{ padding: '1.25rem' }}
                >
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
                        {business?.checkinCount || 0}
                      </div>
                      <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
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
                  style={{ padding: '1.25rem' }}
                >
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
                      <Calendar size={22} color="#3498db" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                          {thisWeekCheckins}
                        </span>
                        {weeklyGrowth !== 0 && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            background: weeklyGrowth > 0 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                            color: weeklyGrowth > 0 ? 'var(--kb-green)' : '#e74c3c',
                          }}>
                            {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth}%
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                        This Week
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card"
                  style={{ padding: '1.25rem' }}
                >
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card"
                  style={{ padding: '1.25rem' }}
                >
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
                      <Tag size={22} color="#9b59b6" />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                        {promoCodes.filter(p => p.isActive).length}
                      </div>
                      <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                        Active Promos
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
                    <button
                      onClick={() => setActiveTab('qrcode')}
                      className="btn btn-gold"
                      style={{ marginTop: '1rem' }}
                    >
                      View QR Code
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {checkins.slice(0, 10).map((checkin, i) => {
                      const date = checkin.timestamp?.toDate
                        ? checkin.timestamp.toDate()
                        : new Date(checkin.timestamp)

                      const tierColors = {
                        'Village Patron': '#9b59b6',
                        'Line & Sinker': '#c9a227',
                        'Hooked': '#27ae60',
                        'Curious': '#3498db'
                      }

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
                              {checkin.tier && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.1rem 0.5rem',
                                  borderRadius: '4px',
                                  background: `${tierColors[checkin.tier] || '#95a5a6'}20`,
                                  color: tierColors[checkin.tier] || '#95a5a6',
                                  fontWeight: '500',
                                }}>
                                  {checkin.tier}
                                </span>
                              )}
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
            </>
          )}

          {/* Kinderbucks Tab */}
          {activeTab === 'kinderbucks' && (
            <>
              {/* Balance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{
                  marginBottom: '1.5rem',
                  background: 'linear-gradient(135deg, var(--kb-gold) 0%, var(--kb-gold-dark) 100%)',
                  color: 'white',
                  padding: '2rem',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                      Current Kinderbucks Balance
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1 }}>
                      ${(business?.kinderbucksBalance || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
                      Available for redemption to USD
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => navigate('/business/accept-payment')}
                      className="btn"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Plus size={18} />
                      Accept Payment
                    </button>
                    <button
                      onClick={() => setShowRedemptionModal(true)}
                      className="btn"
                      style={{
                        background: 'white',
                        color: 'var(--kb-gold-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                      disabled={(business?.kinderbucksBalance || 0) === 0}
                    >
                      <DollarSign size={18} />
                      Request Redemption
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card"
                  style={{ padding: '1.25rem' }}
                >
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
                      <ArrowDownRight size={22} color="var(--kb-green)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                        ${(business?.lifetimeAccepted || 0).toFixed(0)}
                      </div>
                      <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                        Total Accepted
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card"
                  style={{ padding: '1.25rem' }}
                >
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
                      <ArrowUpRight size={22} color="#3498db" />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                        ${(business?.lifetimeRedeemed || 0).toFixed(0)}
                      </div>
                      <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                        Total Redeemed
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card"
                  style={{ padding: '1.25rem' }}
                >
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
                      <Banknote size={22} color="#9b59b6" />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                        {transactions.filter(t => t.type === 'payment').length}
                      </div>
                      <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                        Payments Received
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
              >
                <h3 style={{
                  color: 'var(--kb-navy)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Clock size={20} /> Recent Transactions
                </h3>

                {transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
                    <Banknote size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No transactions yet</p>
                    <p style={{ fontSize: '0.9rem' }}>Accept Kinderbucks payments to see them here.</p>
                    <button
                      onClick={() => navigate('/business/accept-payment')}
                      className="btn btn-gold"
                      style={{ marginTop: '1rem' }}
                    >
                      Accept First Payment
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {transactions.slice(0, 10).map((txn, i) => {
                      const date = txn.createdAt?.toDate
                        ? txn.createdAt.toDate()
                        : new Date(txn.createdAt)
                      const isPayment = txn.type === 'payment'

                      return (
                        <div
                          key={txn.id || i}
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
                              background: isPayment ? 'rgba(39, 174, 96, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {isPayment ? (
                                <ArrowDownRight size={18} color="var(--kb-green)" />
                              ) : (
                                <ArrowUpRight size={18} color="#3498db" />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                                {isPayment ? 'Payment received' : 'Redemption'}
                              </div>
                              {txn.kinderbuckSerial && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontFamily: 'monospace',
                                  color: 'var(--kb-gray-500)',
                                }}>
                                  {txn.kinderbuckSerial}
                                </span>
                              )}
                              {txn.status === 'pending' && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  background: '#fff3cd',
                                  color: '#856404',
                                  marginLeft: '0.5rem',
                                }}>
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontWeight: '600',
                              color: isPayment ? 'var(--kb-green)' : '#3498db',
                            }}>
                              {isPayment ? '+' : '-'}${txn.amount?.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                              {date.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            </>
          )}

          {/* QR Code Tab */}
          {activeTab === 'qrcode' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: '2rem' }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                alignItems: 'start',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--kb-green) 0%, #1e8449 100%)',
                    borderRadius: '20px',
                    padding: '4px',
                    display: 'inline-block',
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '18px',
                      padding: '20px',
                    }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--kb-green)',
                        letterSpacing: '2px',
                        marginBottom: '12px',
                      }}>
                        CHECK IN AT
                      </div>
                      <QRCode
                        value={checkinUrl}
                        size={180}
                        denomination={1}
                        showFrame={false}
                      />
                      <div style={{
                        marginTop: '12px',
                        fontWeight: '600',
                        color: 'var(--kb-navy)',
                        fontSize: '1.1rem',
                      }}>
                        {business?.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => window.print()}
                      className="btn btn-gold"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Printer size={18} /> Print
                    </button>
                    <button
                      onClick={copyUrl}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                      {copied ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
                    How Customers Use This
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--kb-navy)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}>1</div>
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>Customer scans with phone</div>
                        <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>Using their camera app or QR reader</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--kb-navy)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}>2</div>
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>Opens check-in page</div>
                        <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>No app download required!</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--kb-navy)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}>3</div>
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>They tap "Check In"</div>
                        <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>Earns progress toward their Kinderhooker tier</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--kb-green)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>You see their tier badge</div>
                        <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem' }}>Offer appropriate discounts for their loyalty level</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(201, 162, 39, 0.1)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--kb-gold)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--kb-gold-dark)', fontWeight: '600', marginBottom: '0.5rem' }}>
                      <Info size={16} /> Pro Tip
                    </div>
                    <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.9rem', margin: 0 }}>
                      Place your QR code near the register or on table tents so customers can check in while they wait!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loyalty Rewards Tab */}
          {activeTab === 'loyalty' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ color: 'var(--kb-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Gift size={20} /> Loyalty Rewards
                </h3>
                <button
                  onClick={() => setShowLoyaltyForm(!showLoyaltyForm)}
                  className="btn btn-gold"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={18} /> Add Reward Tier
                </button>
              </div>

              <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1.5rem' }}>
                Set up rewards for customers who check in at your business. The more they visit, the better the rewards!
              </p>

              {/* Add Reward Form */}
              {showLoyaltyForm && (
                <form onSubmit={handleAddLoyaltyReward} style={{
                  padding: '1.5rem',
                  background: 'var(--kb-gray-50)',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                        Check-ins Required
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={loyaltyForm.checkinsRequired}
                        onChange={e => setLoyaltyForm(f => ({ ...f, checkinsRequired: e.target.value }))}
                        style={{ width: '100%' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                        Reward Type
                      </label>
                      <select
                        value={loyaltyForm.rewardType}
                        onChange={e => setLoyaltyForm(f => ({ ...f, rewardType: e.target.value }))}
                        style={{ width: '100%' }}
                      >
                        <option value="discount">% Discount</option>
                        <option value="freeItem">Free Item</option>
                        <option value="credit">$ Credit</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                        {loyaltyForm.rewardType === 'freeItem' ? 'Value ($)' : loyaltyForm.rewardType === 'credit' ? 'Credit ($)' : 'Discount (%)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={loyaltyForm.rewardValue}
                        onChange={e => setLoyaltyForm(f => ({ ...f, rewardValue: e.target.value }))}
                        style={{ width: '100%' }}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                      Reward Description *
                    </label>
                    <input
                      type="text"
                      value={loyaltyForm.reward}
                      onChange={e => setLoyaltyForm(f => ({ ...f, reward: e.target.value }))}
                      placeholder="e.g., Free coffee, 10% off your order, $5 off..."
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingLoyalty || !loyaltyForm.reward}
                    >
                      {savingLoyalty ? 'Saving...' : 'Add Reward'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowLoyaltyForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Rewards List */}
              {loyaltyRewards.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: 'var(--kb-gray-50)',
                  borderRadius: '12px',
                }}>
                  <Gift size={48} color="var(--kb-gray-300)" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--kb-gray-500)', marginBottom: '1rem' }}>
                    No loyalty rewards set up yet.
                  </p>
                  <p style={{ color: 'var(--kb-gray-400)', fontSize: '0.9rem' }}>
                    Add reward tiers to incentivize repeat visits!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {loyaltyRewards.map((reward, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'var(--kb-gray-50)',
                        borderRadius: '10px',
                        borderLeft: `4px solid ${
                          reward.checkinsRequired >= 20 ? 'var(--kb-gold)' :
                          reward.checkinsRequired >= 10 ? 'var(--kb-green)' :
                          'var(--kb-navy)'
                        }`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          background: 'white',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          border: '1px solid var(--kb-gray-200)',
                        }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--kb-navy)', lineHeight: 1 }}>
                            {reward.checkinsRequired}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--kb-gray-500)' }}>visits</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>
                            {reward.reward}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                            {reward.rewardType === 'discount' && `${reward.rewardValue}% off`}
                            {reward.rewardType === 'freeItem' && `$${reward.rewardValue} value`}
                            {reward.rewardType === 'credit' && `$${reward.rewardValue} credit`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveLoyaltyReward(index)}
                        className="btn"
                        style={{
                          padding: '0.5rem',
                          background: 'white',
                          color: 'var(--kb-gray-500)',
                          border: '1px solid var(--kb-gray-200)',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(201, 162, 39, 0.1)',
                borderRadius: '8px',
                borderLeft: '3px solid var(--kb-gold)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--kb-gold-dark)', fontWeight: '600', marginBottom: '0.5rem' }}>
                  <Info size={16} /> How it works
                </div>
                <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.9rem', margin: 0 }}>
                  When customers check in, they'll see their progress toward your rewards. Staff can verify their check-in count and apply the appropriate reward!
                </p>
              </div>
            </motion.div>
          )}

          {/* Promo Codes Tab */}
          {activeTab === 'promos' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ marginBottom: '1.5rem' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{ color: 'var(--kb-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={20} /> Your Promo Codes
                  </h3>
                  <button
                    onClick={() => setShowPromoForm(!showPromoForm)}
                    className="btn btn-gold"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Plus size={18} /> Create Promo
                  </button>
                </div>

                {/* Create Promo Form */}
                {showPromoForm && (
                  <form onSubmit={handleCreatePromo} style={{
                    padding: '1.5rem',
                    background: 'var(--kb-gray-50)',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                          Code *
                        </label>
                        <input
                          type="text"
                          value={promoForm.code}
                          onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                          placeholder="SUMMER20"
                          style={{ width: '100%', fontFamily: 'monospace' }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                          Discount Type
                        </label>
                        <select
                          value={promoForm.discountType}
                          onChange={e => setPromoForm(f => ({ ...f, discountType: e.target.value }))}
                          style={{ width: '100%' }}
                        >
                          <option value="percent">Percent Off</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                          {promoForm.discountType === 'percent' ? 'Percent Off' : 'Amount Off ($)'}
                        </label>
                        <input
                          type="number"
                          value={promoForm.discountValue}
                          onChange={e => setPromoForm(f => ({ ...f, discountValue: e.target.value }))}
                          min="1"
                          max={promoForm.discountType === 'percent' ? 100 : 1000}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                        Description *
                      </label>
                      <input
                        type="text"
                        value={promoForm.description}
                        onChange={e => setPromoForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="10% off your entire purchase"
                        style={{ width: '100%' }}
                        required
                      />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem',
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                          Min. Tier (optional)
                        </label>
                        <select
                          value={promoForm.minTier}
                          onChange={e => setPromoForm(f => ({ ...f, minTier: e.target.value }))}
                          style={{ width: '100%' }}
                        >
                          <option value="">Any tier</option>
                          <option value="Curious">Curious</option>
                          <option value="Hooked">Hooked</option>
                          <option value="Line & Sinker">Line & Sinker</option>
                          <option value="Village Patron">Village Patron</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                          Expires (optional)
                        </label>
                        <input
                          type="date"
                          value={promoForm.expiresAt}
                          onChange={e => setPromoForm(f => ({ ...f, expiresAt: e.target.value }))}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500', fontSize: '0.9rem' }}>
                          Usage Limit (optional)
                        </label>
                        <input
                          type="number"
                          value={promoForm.usageLimit}
                          onChange={e => setPromoForm(f => ({ ...f, usageLimit: e.target.value }))}
                          placeholder="Unlimited"
                          min="1"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={savingPromo}>
                        {savingPromo ? 'Creating...' : 'Create Promo Code'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowPromoForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Promo List */}
                {promoCodes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
                    <Tag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No promo codes yet</p>
                    <p style={{ fontSize: '0.9rem' }}>Create your first promo to reward loyal customers!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {promoCodes.map(promo => (
                      <div
                        key={promo.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          background: promo.isActive ? 'var(--kb-gray-50)' : 'var(--kb-gray-100)',
                          borderRadius: '8px',
                          opacity: promo.isActive ? 1 : 0.6,
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <code style={{
                              padding: '0.25rem 0.5rem',
                              background: 'var(--kb-navy)',
                              color: 'var(--kb-gold)',
                              borderRadius: '4px',
                              fontWeight: '600',
                            }}>
                              {promo.code}
                            </code>
                            <span style={{
                              padding: '0.15rem 0.5rem',
                              background: promo.discountType === 'percent' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                              color: promo.discountType === 'percent' ? 'var(--kb-green)' : '#3498db',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                            }}>
                              {promo.discountType === 'percent' ? <Percent size={12} style={{ marginRight: 4 }} /> : <DollarSign size={12} style={{ marginRight: 4 }} />}
                              {promo.discountValue}{promo.discountType === 'percent' ? '% off' : ' off'}
                            </span>
                          </div>
                          <div style={{ color: 'var(--kb-gray-600)', fontSize: '0.9rem' }}>
                            {promo.description}
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                            {promo.minTier && <span>Min tier: {promo.minTier}</span>}
                            {promo.usageLimit && <span>Limit: {promo.usageCount || 0}/{promo.usageLimit}</span>}
                            {promo.expiresAt && <span>Expires: {new Date(promo.expiresAt.toDate ? promo.expiresAt.toDate() : promo.expiresAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleTogglePromo(promo.id, promo.isActive)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            {promo.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                            {promo.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeletePromo(promo.id)}
                            className="btn"
                            style={{ padding: '0.4rem 0.6rem', background: '#e74c3c', color: 'white' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}

          {/* Village Trends Tab */}
          {activeTab === 'trends' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                  style={{ padding: '1.5rem' }}
                >
                  <h4 style={{ color: 'var(--kb-gray-500)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Village-Wide Check-ins
                  </h4>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                    {totalVillageCheckins}
                  </div>
                  <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                    {villageThisWeek} this week across all businesses
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card"
                  style={{ padding: '1.5rem' }}
                >
                  <h4 style={{ color: 'var(--kb-gray-500)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Participating Businesses
                  </h4>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
                    {allBusinesses.length}
                  </div>
                  <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>
                    Active in the Kinderbucks network
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, var(--kb-gold) 0%, var(--kb-gold-dark) 100%)',
                    color: 'white',
                  }}
                >
                  <h4 style={{ opacity: 0.9, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Your Market Share
                  </h4>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                    {totalVillageCheckins > 0 ? Math.round(((business?.checkinCount || 0) / totalVillageCheckins) * 100) : 0}%
                  </div>
                  <div style={{ opacity: 0.9, fontSize: '0.85rem' }}>
                    of all village check-ins
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} /> Top Businesses This Month
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topBusinesses.map((biz, i) => {
                    const isMe = biz.code === profile?.businessCode
                    const maxCheckins = topBusinesses[0]?.checkinCount || 1
                    const barWidth = ((biz.checkinCount || 0) / maxCheckins) * 100

                    return (
                      <div
                        key={biz.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem 1rem',
                          background: isMe ? 'rgba(201, 162, 39, 0.1)' : 'var(--kb-gray-50)',
                          borderRadius: '8px',
                          border: isMe ? '2px solid var(--kb-gold)' : 'none',
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          background: i === 0 ? 'var(--kb-gold)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--kb-gray-300)',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: isMe ? '600' : '500', color: 'var(--kb-navy)' }}>
                              {biz.name}
                            </span>
                            {isMe && (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.4rem',
                                background: 'var(--kb-gold)',
                                color: 'white',
                                borderRadius: '4px',
                              }}>
                                YOU
                              </span>
                            )}
                          </div>
                          <div style={{
                            height: '6px',
                            background: 'var(--kb-gray-200)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${barWidth}%`,
                              height: '100%',
                              background: isMe ? 'var(--kb-gold)' : 'var(--kb-green)',
                              borderRadius: '3px',
                            }} />
                          </div>
                        </div>
                        <div style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>
                          {biz.checkinCount || 0}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {/* Resource Guide Tab */}
          {activeTab === 'guide' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} /> Business Resource Guide
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {guides.map(guide => {
                  const Icon = guide.icon
                  const isExpanded = expandedGuide === guide.id

                  return (
                    <div
                      key={guide.id}
                      style={{
                        border: '1px solid var(--kb-gray-200)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem 1.25rem',
                          background: isExpanded ? 'var(--kb-gray-50)' : 'white',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(201, 162, 39, 0.1)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Icon size={20} color="var(--kb-gold-dark)" />
                          </div>
                          <span style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                            {guide.title}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={20} color="var(--kb-gray-400)" /> : <ChevronDown size={20} color="var(--kb-gray-400)" />}
                      </button>

                      {isExpanded && (
                        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--kb-gray-200)' }}>
                          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {guide.content.map((item, i) => (
                              <li key={i} style={{ color: 'var(--kb-gray-600)', lineHeight: 1.5 }}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)',
                borderRadius: '12px',
                color: 'white',
              }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Need Help?</h4>
                <p style={{ opacity: 0.9, marginBottom: '1rem', fontSize: '0.95rem' }}>
                  Questions about Kinderbucks or need assistance with your account? We're here to help!
                </p>
                <a
                  href="mailto:support@kinderbucks.com"
                  className="btn"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  Contact Support
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Redemption Modal */}
      <RedemptionModal
        isOpen={showRedemptionModal}
        onClose={() => setShowRedemptionModal(false)}
        businessCode={profile?.businessCode}
        businessName={business?.name}
        currentBalance={business?.kinderbucksBalance || 0}
        onSuccess={() => loadData()}
      />
    </div>
  )
}

export default BusinessDashboard
