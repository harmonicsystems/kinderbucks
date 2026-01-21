import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Map,
  Trophy,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Store,
  Target
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getHuntsWithProgress, HUNT_TYPES } from '../firebase/hunts'
import { getAllLandmarks, LANDMARK_CATEGORIES } from '../firebase/landmarks'
import Header from '../components/Header'
import Footer from '../components/Footer'

function Hunts() {
  const { user, isAuthenticated } = useAuth()
  const [hunts, setHunts] = useState([])
  const [landmarks, setLandmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, completed

  useEffect(() => {
    async function load() {
      try {
        const [huntsData, landmarksData] = await Promise.all([
          isAuthenticated ? getHuntsWithProgress(user.uid) : [],
          getAllLandmarks()
        ])
        setHunts(huntsData)
        setLandmarks(landmarksData)
      } catch (err) {
        console.error('Error loading hunts:', err)
      }
      setLoading(false)
    }
    load()
  }, [user, isAuthenticated])

  const filteredHunts = hunts.filter(hunt => {
    if (filter === 'active') return !hunt.isCompleted
    if (filter === 'completed') return hunt.isCompleted
    return true
  })

  const completedCount = hunts.filter(h => h.isCompleted).length

  const formatDate = (timestamp) => {
    if (!timestamp) return null
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diff
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
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading hunts...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)',
        color: 'white',
        padding: '3rem 1rem',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            marginBottom: '1rem',
          }}>
            <Map size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Village Discovery Trails</span>
          </div>

          <h1 style={{ marginBottom: '0.75rem' }}>Explore Kinderhook</h1>
          <p style={{ opacity: 0.9, fontSize: '1.05rem' }}>
            Discover landmarks, earn badges, and unlock rewards as you explore the village!
          </p>

          {isAuthenticated && completedCount > 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--kb-gold)',
              color: 'var(--kb-navy)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              fontWeight: '600',
            }}>
              <Trophy size={18} />
              {completedCount} Trail{completedCount !== 1 ? 's' : ''} Completed
            </div>
          )}
        </motion.div>
      </section>

      <main style={{ flex: 1, background: 'var(--kb-cream)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Sign in prompt */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, var(--kb-gold) 0%, var(--kb-gold-dark) 100%)',
                color: 'var(--kb-navy)',
              }}
            >
              <Sparkles size={32} style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Track Your Progress</h3>
              <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
                Sign in to save your trail progress and earn badges!
              </p>
              <Link to="/login" className="btn" style={{ background: 'var(--kb-navy)', color: 'white' }}>
                Sign In to Start
              </Link>
            </motion.div>
          )}

          {/* Filter Tabs */}
          {isAuthenticated && hunts.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              {[
                { key: 'all', label: 'All Trails' },
                { key: 'active', label: 'In Progress' },
                { key: 'completed', label: 'Completed' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className="btn"
                  style={{
                    background: filter === tab.key ? 'var(--kb-navy)' : 'white',
                    color: filter === tab.key ? 'white' : 'var(--kb-gray-600)',
                    border: '1px solid var(--kb-gray-200)',
                    padding: '0.5rem 1rem',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Trails List */}
          {filteredHunts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Map size={48} color="var(--kb-gray-300)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>
                {filter === 'completed' ? 'No completed trails yet' : 'No active trails'}
              </h3>
              <p style={{ color: 'var(--kb-gray-500)' }}>
                {filter === 'completed'
                  ? 'Complete your first trail to see it here!'
                  : 'Check back soon for new discovery trails!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredHunts.map((hunt, i) => {
                const huntType = HUNT_TYPES[hunt.type]
                const daysRemaining = getDaysRemaining(hunt.endDate)
                const progress = hunt.landmarksScanned?.length || 0
                const total = hunt.landmarks?.length || 0
                const progressPercent = total > 0 ? (progress / total) * 100 : 0

                return (
                  <motion.div
                    key={hunt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      border: hunt.isCompleted ? '2px solid var(--kb-green)' : '1px solid var(--kb-gray-200)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{ flex: 1 }}>
                        {/* Hunt Type & Sponsor */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            background: `${huntType?.color}15`,
                            color: huntType?.color,
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                          }}>
                            {huntType?.name}
                          </span>

                          {hunt.sponsorBusinessName && (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.6rem',
                              background: 'var(--kb-gray-100)',
                              color: 'var(--kb-gray-600)',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                            }}>
                              <Store size={12} />
                              Sponsored by {hunt.sponsorBusinessName}
                            </span>
                          )}

                          {hunt.isCompleted && (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.6rem',
                              background: 'var(--kb-green)',
                              color: 'white',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}>
                              <CheckCircle size={12} />
                              Complete
                            </span>
                          )}
                        </div>

                        {/* Hunt Name */}
                        <h3 style={{ color: 'var(--kb-navy)', marginBottom: '0.25rem' }}>
                          {hunt.name}
                        </h3>

                        {hunt.description && (
                          <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                            {hunt.description}
                          </p>
                        )}

                        {/* Hunt Stats */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MapPin size={14} />
                            {total} landmarks
                          </span>

                          {hunt.endDate && (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: daysRemaining <= 3 ? 'var(--kb-red)' : 'var(--kb-gray-500)',
                            }}>
                              <Clock size={14} />
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ends today!'}
                            </span>
                          )}

                          {hunt.reward?.bonusPercent > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--kb-gold-dark)' }}>
                              <Trophy size={14} />
                              +{hunt.reward.bonusPercent}% exchange bonus
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Circle or CTA */}
                      <div style={{ textAlign: 'center' }}>
                        {isAuthenticated && progress > 0 ? (
                          <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: `conic-gradient(${hunt.isCompleted ? 'var(--kb-green)' : 'var(--kb-gold)'} ${progressPercent}%, var(--kb-gray-200) 0%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <div style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              background: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                            }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--kb-navy)', lineHeight: 1 }}>
                                {progress}
                              </span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--kb-gray-500)' }}>/ {total}</span>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to="/map"
                            className="btn btn-gold"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Target size={16} />
                            Start Trail
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isAuthenticated && total > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{
                          height: '8px',
                          background: 'var(--kb-gray-200)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            background: hunt.isCompleted
                              ? 'var(--kb-green)'
                              : 'linear-gradient(90deg, var(--kb-gold) 0%, var(--kb-gold-dark) 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Landmarks Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: '3rem' }}
          >
            <h2 style={{
              color: 'var(--kb-navy)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <MapPin size={24} />
              Village Landmarks
              <span style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--kb-gray-500)',
                marginLeft: '0.5rem',
              }}>
                ({landmarks.length} locations)
              </span>
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {landmarks.map((landmark, i) => {
                const category = LANDMARK_CATEGORIES[landmark.category]
                return (
                  <motion.div
                    key={landmark.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="card"
                    style={{ padding: '1rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: `${category?.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <MapPin size={24} color={category?.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: '600',
                          color: 'var(--kb-navy)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {landmark.name}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: category?.color,
                          fontWeight: '500',
                        }}>
                          {category?.name}
                        </div>
                      </div>
                      <ChevronRight size={20} color="var(--kb-gray-400)" />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {landmarks.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <MapPin size={40} color="var(--kb-gray-300)" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: 'var(--kb-gray-500)' }}>
                  Landmarks coming soon! Check back for village exploration spots.
                </p>
              </div>
            )}
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Hunts
