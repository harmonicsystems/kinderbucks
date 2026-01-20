import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Clock,
  Navigation,
  Store,
  Share2,
  CheckCircle,
  Phone,
  ExternalLink
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { isOpenNow, getTodayHours, BUSINESS_LOCATIONS } from '../components/VillageMap'
import WeatherWidget from '../components/WeatherWidget'
import { getAllBusinesses } from '../firebase/businesses'

function VillageMapPage() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await getAllBusinesses()
      setBusinesses(data.filter(b => b.isActive))
      setLoading(false)
    }
    load()
  }, [])

  // Merge with location data
  const businessesWithLocations = businesses.map(biz => ({
    ...biz,
    ...BUSINESS_LOCATIONS[biz.code],
  }))

  // Filter businesses
  const filteredBusinesses = businessesWithLocations.filter(biz => {
    if (!biz.address) return false
    if (filter === 'open' && !isOpenNow(biz.hours)) return false
    return true
  })

  // Get open businesses for "What's Open" feature
  const openBusinesses = businessesWithLocations.filter(biz => biz.address && isOpenNow(biz.hours))

  // Generate shareable text
  const generateShareText = () => {
    const now = new Date()
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
    const businessNames = openBusinesses.map(b => b.name).join(', ')

    return `What's open in Kinderhook this ${dayName}? ${openBusinesses.length} businesses are ready to serve you: ${businessNames}. Show your OK Member card for bonus discounts! #Kinderbucks #ShopLocal`
  }

  const shareWhatsOpen = async () => {
    const text = generateShareText()

    if (navigator.share) {
      try {
        await navigator.share({
          title: "What's Open in Kinderhook",
          text,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'food': return '#e67e22'
      case 'retail': return '#3498db'
      case 'services': return '#9b59b6'
      case 'arts': return '#1abc9c'
      default: return 'var(--kb-gray-500)'
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: 'var(--kb-cream)' }}>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)',
          padding: '2rem 1rem',
          color: 'white',
          textAlign: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
              Village Directory
            </div>
            <h1 style={{ marginBottom: '0.5rem' }}>Explore Kinderhook</h1>
            <p style={{ opacity: 0.8, maxWidth: '500px', margin: '0 auto' }}>
              Find participating businesses, check hours, and earn rewards
            </p>
          </motion.div>
        </section>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
          {/* Weather + What's Open Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            {/* Weather Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <WeatherWidget />
            </motion.div>

            {/* What's Open Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
              style={{
                background: 'linear-gradient(135deg, var(--kb-green) 0%, #1e8449 100%)',
                color: 'white',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Clock size={20} />
                    <span style={{ fontWeight: '600' }}>Open Right Now</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                    {openBusinesses.length} Businesses
                  </div>
                  <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    Show your OK card for bonus discounts!
                  </div>
                </div>
                <button
                  onClick={shareWhatsOpen}
                  className="btn"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {copied ? <CheckCircle size={18} /> : <Share2 size={18} />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            <button
              onClick={() => setFilter('all')}
              className="btn"
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '0.9rem',
                background: filter === 'all' ? 'var(--kb-navy)' : 'white',
                color: filter === 'all' ? 'white' : 'var(--kb-gray-600)',
                border: '1px solid var(--kb-gray-200)',
              }}
            >
              All ({businessesWithLocations.filter(b => b.address).length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                fontSize: '0.9rem',
                background: filter === 'open' ? 'var(--kb-green)' : 'white',
                color: filter === 'open' ? 'white' : 'var(--kb-gray-600)',
                border: '1px solid var(--kb-gray-200)',
              }}
            >
              <Clock size={16} />
              Open Now ({openBusinesses.length})
            </button>
          </div>

          {/* Business Directory */}
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
            {filter === 'open' ? 'Open Now' : 'All Businesses'}
          </h2>

          {loading ? (
            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--kb-gray-500)' }}>
              Loading businesses...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}>
              {filteredBusinesses.map((biz, i) => {
                const isOpen = isOpenNow(biz.hours)
                const todayHours = getTodayHours(biz.hours)

                return (
                  <motion.div
                    key={biz.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{ padding: '1.25rem', overflow: 'hidden' }}
                  >
                    {/* Photo */}
                    {biz.photoUrl && (
                      <div style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem' }}>
                        <img
                          src={biz.photoUrl}
                          alt={biz.name}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    )}

                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: isOpen ? '#27ae60' : '#95a5a6',
                          }} />
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            color: isOpen ? '#27ae60' : 'var(--kb-gray-500)',
                          }}>
                            {isOpen ? 'OPEN NOW' : 'CLOSED'}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: `${getCategoryColor(biz.category)}15`,
                          color: getCategoryColor(biz.category),
                          fontWeight: '500',
                          textTransform: 'capitalize',
                        }}>
                          {biz.category}
                        </span>
                      </div>
                      <h3 style={{ color: 'var(--kb-navy)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        {biz.name}
                      </h3>
                    </div>

                    {biz.address && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--kb-gray-600)',
                        marginBottom: '0.5rem',
                      }}>
                        <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{biz.address}</span>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: 'var(--kb-gray-600)',
                      marginBottom: '0.5rem',
                    }}>
                      <Clock size={14} />
                      Today: {todayHours}
                    </div>

                    {biz.phone && (
                      <a
                        href={`tel:${biz.phone}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--kb-gray-600)',
                          textDecoration: 'none',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <Phone size={14} />
                        {biz.phone}
                      </a>
                    )}

                    {biz.website && (
                      <a
                        href={biz.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--kb-gold-dark)',
                          textDecoration: 'none',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <ExternalLink size={14} />
                        Visit Website
                      </a>
                    )}

                    {biz.address && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(biz.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-gold"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          width: '100%',
                          fontSize: '0.85rem',
                          padding: '0.5rem',
                        }}
                      >
                        <Navigation size={14} /> Get Directions
                      </a>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {filteredBusinesses.length === 0 && !loading && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--kb-gray-500)' }}>
              <Store size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>{filter === 'open' ? 'No businesses are open right now' : 'No businesses found'}</p>
              {filter === 'open' && (
                <button
                  onClick={() => setFilter('all')}
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem' }}
                >
                  View All Businesses
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default VillageMapPage
