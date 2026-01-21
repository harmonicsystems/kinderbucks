import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  CheckCircle,
  Camera,
  Trophy,
  ChevronRight,
  Loader,
  AlertCircle,
  Map
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getLandmark, incrementLandmarkScans, LANDMARK_CATEGORIES } from '../firebase/landmarks'
import { getActiveHunts, recordLandmarkScan } from '../firebase/hunts'
import Header from '../components/Header'
import Footer from '../components/Footer'

function LandmarkScan() {
  const { landmarkCode } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [landmark, setLandmark] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [huntResults, setHuntResults] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const landmarkData = await getLandmark(landmarkCode)
        if (!landmarkData) {
          setError('Landmark not found')
        } else if (!landmarkData.isActive) {
          setError('This landmark is not currently active')
        } else {
          setLandmark(landmarkData)
        }
      } catch (err) {
        console.error('Error loading landmark:', err)
        setError('Error loading landmark')
      }
      setLoading(false)
    }
    load()
  }, [landmarkCode])

  const handleScan = async () => {
    if (!isAuthenticated) return

    setScanning(true)
    try {
      // Increment scan count
      await incrementLandmarkScans(landmarkCode)

      // Check all active hunts for this landmark
      const activeHunts = await getActiveHunts()
      const results = []

      for (const hunt of activeHunts) {
        if (hunt.landmarks.includes(landmarkCode)) {
          const result = await recordLandmarkScan(user.uid, landmarkCode, hunt.id)
          if (result.updated || result.completed) {
            results.push({
              hunt,
              ...result
            })
          }
        }
      }

      setHuntResults(results)
      setScanned(true)
    } catch (err) {
      console.error('Error recording scan:', err)
      setError('Error recording your visit')
    }
    setScanning(false)
  }

  const category = landmark ? LANDMARK_CATEGORIES[landmark.category] : null

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
          <Loader size={32} className="spin" color="var(--kb-navy)" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
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
            <AlertCircle size={48} color="var(--kb-red)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>Oops!</h2>
            <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1.5rem' }}>{error}</p>
            <Link to="/hunts" className="btn btn-primary">View Active Hunts</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{
        flex: 1,
        background: `linear-gradient(135deg, ${category?.color || 'var(--kb-navy)'} 0%, ${category?.color || 'var(--kb-navy)'}dd 100%)`,
        padding: '2rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* Landmark Card */}
          <div className="card" style={{
            padding: '2rem',
            textAlign: 'center',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {/* Category Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              background: `${category?.color}15`,
              borderRadius: '100px',
              marginBottom: '1.5rem',
            }}>
              <MapPin size={16} color={category?.color} />
              <span style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: category?.color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {category?.name || 'Landmark'}
              </span>
            </div>

            {/* Landmark Photo or Icon */}
            {landmark.photoUrl ? (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '16px',
                overflow: 'hidden',
                margin: '0 auto 1.5rem',
                border: `3px solid ${category?.color}`,
              }}>
                <img
                  src={landmark.photoUrl}
                  alt={landmark.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `${category?.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: `3px solid ${category?.color}`,
              }}>
                <MapPin size={40} color={category?.color} />
              </div>
            )}

            {/* Landmark Name */}
            <h1 style={{
              color: 'var(--kb-navy)',
              fontSize: '1.75rem',
              marginBottom: '0.5rem',
            }}>
              {landmark.name}
            </h1>

            {landmark.description && (
              <p style={{
                color: 'var(--kb-gray-600)',
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
              }}>
                {landmark.description}
              </p>
            )}

            {/* Scan Status */}
            {!scanned ? (
              <>
                {!isAuthenticated ? (
                  <div style={{
                    background: 'var(--kb-cream)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                  }}>
                    <Camera size={32} color="var(--kb-navy)" style={{ marginBottom: '0.75rem' }} />
                    <p style={{ color: 'var(--kb-gray-700)', marginBottom: '1rem' }}>
                      Sign in to record your visit and earn hunt progress!
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                      Sign In to Continue
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="btn btn-gold"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {scanning ? (
                      <>
                        <Loader size={20} className="spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Record My Visit
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Success State */}
                <div style={{
                  background: 'rgba(39, 174, 96, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}>
                  <CheckCircle size={48} color="var(--kb-green)" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ color: 'var(--kb-green)', marginBottom: '0.5rem' }}>
                    Visit Recorded!
                  </h3>
                  <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.9rem' }}>
                    You've discovered {landmark.name}
                  </p>
                </div>

                {/* Hunt Progress Updates */}
                {huntResults.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{
                      color: 'var(--kb-navy)',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <Trophy size={18} color="var(--kb-gold)" />
                      Hunt Progress
                    </h4>

                    {huntResults.map((result, i) => (
                      <div
                        key={i}
                        style={{
                          background: result.completed ? 'rgba(39, 174, 96, 0.1)' : 'var(--kb-gray-50)',
                          borderRadius: '10px',
                          padding: '1rem',
                          marginBottom: '0.5rem',
                          border: result.completed ? '2px solid var(--kb-green)' : '1px solid var(--kb-gray-200)',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                        }}>
                          <span style={{
                            fontWeight: '600',
                            color: result.completed ? 'var(--kb-green)' : 'var(--kb-navy)',
                          }}>
                            {result.hunt.name}
                          </span>
                          {result.completed && (
                            <span style={{
                              background: 'var(--kb-green)',
                              color: 'white',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}>
                              COMPLETE!
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
                            width: `${(result.progress.landmarksScanned.length / result.progress.total) * 100}%`,
                            height: '100%',
                            background: result.completed ? 'var(--kb-green)' : 'var(--kb-gold)',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--kb-gray-500)',
                          marginTop: '0.35rem',
                        }}>
                          {result.progress.landmarksScanned.length} / {result.progress.total} landmarks
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link
                    to="/hunts"
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Map size={18} />
                    View Hunts
                  </Link>
                  <Link
                    to="/card"
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    My Card
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Location Info */}
            {landmark.address && (
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--kb-gray-200)',
                textAlign: 'left',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  color: 'var(--kb-gray-600)',
                  fontSize: '0.9rem',
                }}>
                  <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{landmark.address}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default LandmarkScan
