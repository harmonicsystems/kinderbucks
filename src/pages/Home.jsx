import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  Store,
  QrCode,
  TrendingUp,
  Award,
  Crown,
  Star,
  Target
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'

function Home() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users to their card
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/card', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  // Show nothing while checking auth (prevents flash)
  if (loading) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)',
        color: 'var(--kb-white)',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <div style={{
            display: 'inline-block',
            background: 'rgba(201, 162, 39, 0.2)',
            color: 'var(--kb-gold)',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
          }}>
            Village of Kinderhook • Est. 2026
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Strengthen Our Village,<br />
            <span style={{ color: 'var(--kb-gold)' }}>One Kinderbuck at a Time</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--kb-gray-300)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem',
          }}>
            A local currency program that keeps money circulating in Kinderhook, rewards loyal customers, and strengthens our community economy.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/exchange" className="btn btn-gold" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Get Kinderbucks
            </Link>
            <Link to="/demo" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderColor: 'var(--kb-white)', color: 'var(--kb-white)' }}>
              See Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-cream)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>How Kinderbucks Works</h2>
            <p style={{ color: 'var(--kb-gray-500)' }}>Simple steps to start supporting local</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                step: '1',
                title: 'Exchange',
                description: 'Convert USD to Kinderbucks at participating locations or online. Members get bonus rates!',
                Icon: ArrowRightLeft,
              },
              {
                step: '2',
                title: 'Spend Local',
                description: 'Use Kinderbucks at any of our 19+ participating village businesses.',
                Icon: Store,
              },
              {
                step: '3',
                title: 'Check In',
                description: 'Scan QR codes when you visit to build your OK Member status and unlock rewards.',
                Icon: QrCode,
              },
              {
                step: '4',
                title: 'Earn More',
                description: 'Higher tiers mean better exchange rates. Village Patrons get 25% bonus!',
                Icon: TrendingUp,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card"
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'var(--kb-navy)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <item.Icon size={28} color="var(--kb-gold)" strokeWidth={1.5} />
                </div>
                <div style={{
                  color: 'var(--kb-gold)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                }}>
                  STEP {item.step}
                </div>
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--kb-gray-500)', fontSize: '0.95rem' }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>OK Membership</div>
            <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>Become an OK Member</h2>
            <p style={{ color: 'var(--kb-gray-500)', maxWidth: '600px', margin: '0 auto' }}>
              Visit local businesses to level up your membership and unlock better exchange rates
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { name: 'Curious', businesses: '1+', bonus: '10%', color: '#888888', Icon: Target },
              { name: 'Hooked', businesses: '5+', bonus: '15%', color: '#2e7d32', Icon: Star },
              { name: 'Line & Sinker', businesses: '10+', bonus: '20%', color: '#1565c0', Icon: Award },
              { name: 'Village Patron', businesses: '15+', bonus: '25%', color: '#c9a227', Icon: Crown, featured: true },
            ].map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card"
                style={{
                  textAlign: 'center',
                  border: tier.featured ? '2px solid var(--kb-gold)' : undefined,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {tier.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '-30px',
                    background: 'var(--kb-gold)',
                    color: 'var(--kb-navy)',
                    padding: '0.25rem 2rem',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    transform: 'rotate(45deg)',
                  }}>
                    BEST
                  </div>
                )}
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: `${tier.color}15`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}>
                  <tier.Icon size={24} color={tier.color} strokeWidth={1.5} />
                </div>
                <h3 style={{ color: tier.color, marginBottom: '0.5rem' }}>{tier.name}</h3>
                <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {tier.businesses} businesses visited
                </div>
                <div style={{
                  background: `${tier.color}15`,
                  borderRadius: '8px',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: tier.color }}>
                    {tier.bonus}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                    Exchange Bonus
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/profile" className="btn btn-primary">
              View My Progress
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-cream)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>Participating Businesses</h2>
            <p style={{ color: 'var(--kb-gray-500)' }}>Support these local Kinderhook establishments</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
          }}>
            {[
              'The Aviary', 'Morningbird Cafe', 'Saisonnier', 'Broad Street Bagel',
              'Brooklyn Pizzeria', 'Isola Wine Bar', 'OK Pantry', 'Kinderhook Books',
              'Samascott\'s', 'The School Gallery', 'Old Dutch Inn', 'Muse Aesthetics'
            ].map((name, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--kb-white)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: 'var(--kb-gray-700)',
                  border: '1px solid var(--kb-gray-200)',
                }}
              >
                {name}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/businesses" className="btn btn-secondary">
              View All 19 Businesses →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 1rem',
        background: 'linear-gradient(135deg, var(--kb-green) 0%, var(--kb-green-light) 100%)',
        color: 'var(--kb-white)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to Support Local?</h2>
          <p style={{ opacity: 0.9, marginBottom: '2rem' }}>
            Join the Kinderbucks program today and start earning rewards while strengthening our village economy.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/exchange" className="btn btn-gold" style={{ padding: '1rem 2rem' }}>
              Get Your First Kinderbucks
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
