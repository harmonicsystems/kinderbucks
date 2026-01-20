import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getAllBusinesses } from '../firebase/businesses'

const CATEGORIES = {
  food: { label: 'Food & Drink', emoji: '🍽️', color: '#e74c3c' },
  retail: { label: 'Retail', emoji: '🛍️', color: '#9b59b6' },
  services: { label: 'Services', emoji: '💼', color: '#3498db' },
  arts: { label: 'Arts & Culture', emoji: '🎨', color: '#1abc9c' },
}

function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const data = await getAllBusinesses()
      setBusinesses(data.filter(b => b.isActive))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all'
    ? businesses
    : businesses.filter(b => b.category === filter)

  const stats = {
    total: businesses.length,
    food: businesses.filter(b => b.category === 'food').length,
    retail: businesses.filter(b => b.category === 'retail').length,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero */}
      <section style={{
        background: 'var(--kb-navy)',
        color: 'var(--kb-white)',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1rem' }}>For Local Businesses</h1>
          <p style={{ color: 'var(--kb-gray-300)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Join the Kinderbucks network and connect with customers committed to shopping local
          </p>
          <Link to="/admin/businesses" className="btn btn-gold">
            Register Your Business
          </Link>
        </div>
      </section>

      {/* Why Join */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '2rem', textAlign: 'center' }}>
            Why Accept Kinderbucks?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                icon: '👥',
                title: 'Committed Customers',
                description: 'Kinderbucks holders have already decided to spend locally. They\'re not comparison shopping online.',
              },
              {
                icon: '🔄',
                title: 'Money Stays Local',
                description: 'Unlike credit cards that send fees elsewhere, Kinderbucks keep circulating in our village economy.',
              },
              {
                icon: '📢',
                title: 'Free Marketing',
                description: 'Get listed in our business directory, featured on our homepage, and promoted to all members.',
              },
              {
                icon: '🏆',
                title: 'Community Standing',
                description: 'Show customers you\'re invested in Kinderhook\'s future. Participating businesses are community leaders.',
              },
              {
                icon: '💵',
                title: 'Easy Redemption',
                description: 'Redeem Kinderbucks for USD at any time through our simple merchant portal. No waiting.',
              },
              {
                icon: '📊',
                title: 'Customer Insights',
                description: 'Access check-in data and understand your customers\' behavior across the village.',
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card"
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{benefit.icon}</div>
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>{benefit.title}</h3>
                <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.95rem' }}>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works for Businesses */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-cream)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '2rem', textAlign: 'center' }}>
            How It Works
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              { step: 1, title: 'Register', desc: 'Sign up as a participating business. It\'s free to join.' },
              { step: 2, title: 'Get Your QR Code', desc: 'We\'ll provide a unique check-in QR code for your location.' },
              { step: 3, title: 'Display It', desc: 'Put the QR code at your counter or entrance for customers to scan.' },
              { step: 4, title: 'Accept Kinderbucks', desc: 'Take Kinderbucks as payment, just like cash. Same denominations.' },
              { step: 5, title: 'Redeem Anytime', desc: 'Exchange accumulated Kinderbucks back to USD when you need.' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  background: 'var(--kb-white)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--kb-gold)',
                  color: 'var(--kb-navy)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <h4 style={{ color: 'var(--kb-navy)', marginBottom: '0.25rem' }}>{item.title}</h4>
                  <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.95rem', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Businesses Directory */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem', textAlign: 'center' }}>
            Participating Businesses
          </h2>
          <p style={{ color: 'var(--kb-gray-500)', textAlign: 'center', marginBottom: '2rem' }}>
            {stats.total} businesses currently accepting Kinderbucks
          </p>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '0.5rem 1rem' }}
            >
              All ({stats.total})
            </button>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={filter === key ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ padding: '0.5rem 1rem' }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading businesses...</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--kb-gray-500)' }}>
              No businesses found. <Link to="/admin/businesses">Add some!</Link>
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
            }}>
              {filtered.map((biz, i) => {
                const cat = CATEGORIES[biz.category] || CATEGORIES.services
                return (
                  <motion.div
                    key={biz.code}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="card"
                    style={{ padding: '1.25rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: `${cat.color}15`,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                      }}>
                        {cat.emoji}
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--kb-navy)', margin: 0, fontSize: '1rem' }}>
                          {biz.name}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: cat.color }}>
                          {cat.label}
                        </span>
                      </div>
                    </div>
                    {biz.checkinCount > 0 && (
                      <div style={{
                        marginTop: '0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--kb-gray-500)',
                      }}>
                        {biz.checkinCount} check-ins
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '3rem 1rem',
        background: 'var(--kb-gold)',
        color: 'var(--kb-navy)',
        textAlign: 'center',
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Ready to join the network?</h3>
        <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
          Registration is free. Start accepting Kinderbucks today.
        </p>
        <Link to="/admin/businesses" className="btn btn-primary">
          Register Your Business
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default Businesses
