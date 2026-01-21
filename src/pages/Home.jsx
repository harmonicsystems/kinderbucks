import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CreditCard,
  QrCode,
  Banknote,
  Store,
  ChevronRight,
  Users,
  TrendingUp,
  Heart
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

  const pillars = [
    {
      icon: CreditCard,
      title: 'OK Membership',
      subtitle: 'Discounts at Local Businesses',
      description: 'Show your OK Member card at any participating business for exclusive discounts. The more you visit, the better your rewards.',
      color: '#c9a227',
      link: '/login',
      cta: 'Become a Member'
    },
    {
      icon: QrCode,
      title: 'Check-ins & Badges',
      subtitle: 'Earn Rewards for Exploring',
      description: 'Scan QR codes at businesses and landmarks to track visits, earn category badges, and complete scavenger hunts around the village.',
      color: '#27ae60',
      link: '/hunts',
      cta: 'Explore Now'
    },
    {
      icon: Banknote,
      title: 'Kinderbucks',
      subtitle: 'Local Currency That Stays Local',
      description: 'Exchange USD for Kinderbucks and spend them at any participating business. Every Kinderbuck keeps dollars circulating in our village.',
      color: '#2563eb',
      link: '/exchange',
      cta: 'Get Kinderbucks'
    }
  ]

  const stats = [
    { value: '19+', label: 'Local Businesses', icon: Store },
    { value: '100%', label: 'Stays in Kinderhook', icon: Heart },
    { value: '25%', label: 'Max Member Bonus', icon: TrendingUp },
  ]

  const businesses = [
    'The Aviary', 'Morningbird Cafe', 'Saisonnier', 'Broad Street Bagel',
    'Brooklyn Pizzeria', 'Isola Wine Bar', 'OK Pantry', 'Kinderhook Books',
    "Samascott's", 'The School Gallery', 'Old Dutch Inn', 'Village Yoga',
    'Kinderhook Bottle Shop', 'Walsh Dentistry', 'Feed and Seed', 'Muse Aesthetics'
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--kb-navy) 0%, #1a3a5c 100%)',
        color: 'var(--kb-white)',
        padding: '4rem 1rem 5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(201,162,39,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}
        >
          <div style={{
            display: 'inline-block',
            background: 'rgba(201, 162, 39, 0.2)',
            color: 'var(--kb-gold)',
            padding: '0.5rem 1.25rem',
            borderRadius: '100px',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            border: '1px solid rgba(201, 162, 39, 0.3)',
          }}>
            Columbia County's Oldest Village
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}>
            <span style={{ color: 'var(--kb-gold)' }}>OK</span> Kinderhook
          </h1>

          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: 'var(--kb-gray-300)',
            marginBottom: '0.5rem',
            fontWeight: '500',
          }}>
            Shop Local. Earn Rewards.
          </p>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--kb-gray-400)',
            marginBottom: '2.5rem',
            maxWidth: '550px',
            margin: '0 auto 2.5rem',
          }}>
            A village loyalty program that rewards you for supporting local businesses while keeping dollars circulating in our community.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-gold" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Join as OK Member
            </Link>
            <Link to="/businesses" className="btn" style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
            }}>
              I'm a Business
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section style={{
        background: 'var(--kb-gold)',
        padding: '1.5rem 1rem',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <stat.icon size={24} color="var(--kb-navy)" />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--kb-navy)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--kb-navy)', opacity: 0.8 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What is OK Kinderhook? */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-cream)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>What is OK Kinderhook?</h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--kb-gray-600)', lineHeight: 1.7 }}>
            OK Kinderhook is a village-wide loyalty program connecting residents with local businesses.
            Earn discounts, collect badges, and use local currency that keeps money circulating in our community.
          </p>
        </div>
      </section>

      {/* Three Pillars */}
      <section style={{ padding: '4rem 1rem', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>Three Ways to Participate</h2>
            <p style={{ color: 'var(--kb-gray-500)' }}>Choose one, two, or all three - it's up to you!</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                style={{
                  background: 'var(--kb-white)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: '1px solid var(--kb-gray-200)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: `${pillar.color}15`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}>
                  <pillar.icon size={32} color={pillar.color} strokeWidth={1.5} />
                </div>

                <h3 style={{ color: pillar.color, marginBottom: '0.25rem', fontSize: '1.3rem' }}>
                  {pillar.title}
                </h3>
                <div style={{
                  color: 'var(--kb-navy)',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: '1.05rem',
                }}>
                  {pillar.subtitle}
                </div>

                <p style={{
                  color: 'var(--kb-gray-600)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  flex: 1,
                }}>
                  {pillar.description}
                </p>

                <Link
                  to={pillar.link}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: pillar.color,
                    fontWeight: '600',
                    marginTop: '1.5rem',
                    textDecoration: 'none',
                  }}
                >
                  {pillar.cta}
                  <ChevronRight size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Participating Businesses */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-cream)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>Participating Businesses</h2>
            <p style={{ color: 'var(--kb-gray-500)' }}>Earn rewards at these local Kinderhook establishments</p>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem',
          }}>
            {businesses.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.9rem',
                  color: 'var(--kb-navy)',
                  fontWeight: '500',
                  border: '1px solid var(--kb-gray-200)',
                }}
              >
                {name}
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/map" className="btn btn-primary">
              View All Businesses on Map
            </Link>
          </div>
        </div>
      </section>

      {/* For Businesses CTA */}
      <section style={{
        padding: '4rem 1rem',
        background: 'linear-gradient(135deg, var(--kb-navy) 0%, #1a3a5c 100%)',
        color: 'white',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Users size={40} style={{ marginBottom: '1rem', opacity: 0.9 }} />
          <h2 style={{ marginBottom: '0.75rem' }}>Are You a Local Business?</h2>
          <p style={{ opacity: 0.9, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Join OK Kinderhook to attract loyal customers, increase foot traffic, and keep dollars in our village economy.
          </p>
          <Link to="/businesses" className="btn btn-gold" style={{ padding: '1rem 2rem' }}>
            Learn About Business Benefits
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '4rem 1rem',
        background: 'var(--kb-gold)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.75rem' }}>
            Ready to Support Local?
          </h2>
          <p style={{ color: 'var(--kb-navy)', opacity: 0.8, marginBottom: '2rem' }}>
            Join OK Kinderhook today and start earning rewards while strengthening our village.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn" style={{
              background: 'var(--kb-navy)',
              color: 'white',
              padding: '1rem 2rem',
            }}>
              Become an OK Member
            </Link>
            <Link to="/demo" className="btn" style={{
              background: 'transparent',
              color: 'var(--kb-navy)',
              border: '2px solid var(--kb-navy)',
              padding: '1rem 2rem',
            }}>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
