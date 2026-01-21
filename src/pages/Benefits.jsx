import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Coins,
  Store,
  Star,
  Gift,
  BarChart3,
  Users,
  Target,
  Award,
  Crown
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { TIERS } from '../utils/tiers'

function Benefits() {
  const benefits = [
    {
      Icon: Coins,
      title: 'Bonus Exchange Rates',
      description: 'Get up to 25% extra when converting USD to Kinderbucks. A $100 exchange becomes $125 in local spending power.',
      highlight: 'Up to 25% bonus',
    },
    {
      Icon: Store,
      title: 'Exclusive Local Deals',
      description: 'Participating businesses offer special discounts and promotions exclusively for OK Members.',
      highlight: 'Member-only offers',
    },
    {
      Icon: Star,
      title: 'Priority Access',
      description: 'Higher-tier members get early access to limited events, seasonal specials, and new business openings.',
      highlight: 'First in line',
    },
    {
      Icon: Gift,
      title: 'Seasonal Bonuses',
      description: 'Extra rewards during holidays and special village events. Double check-in points, bonus exchanges, and more.',
      highlight: 'Special events',
    },
    {
      Icon: BarChart3,
      title: 'Impact Tracking',
      description: 'See exactly how your spending supports local businesses and contributes to the village economy.',
      highlight: 'Track your impact',
    },
    {
      Icon: Users,
      title: 'Community Recognition',
      description: 'Village Patrons are recognized in our annual report and invited to exclusive community appreciation events.',
      highlight: 'Be celebrated',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--kb-gold-dark) 0%, var(--kb-gold) 100%)',
        color: 'var(--kb-navy)',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="badge badge-navy" style={{ marginBottom: '1rem' }}>OK Membership</div>
          <h1 style={{ marginBottom: '1rem' }}>Member Benefits & Rewards</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            The more you support local, the more you earn. It pays to be an OK Member.
          </p>
        </div>
      </section>

      {/* Tier Comparison */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem', textAlign: 'center' }}>
            Membership Tiers
          </h2>
          <p style={{ color: 'var(--kb-gray-500)', textAlign: 'center', marginBottom: '2rem' }}>
            Visit more businesses to unlock better rewards
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Tier</th>
                  <th style={{ width: '20%' }}>Requirement</th>
                  <th style={{ width: '20%' }}>Exchange Bonus</th>
                  <th style={{ width: '35%' }}>Perks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={18} color="#888" />
                      <span style={{ fontWeight: '600', color: '#888' }}>Curious</span>
                    </div>
                  </td>
                  <td>1+ businesses</td>
                  <td><span style={{ color: '#888', fontWeight: '600' }}>10%</span></td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--kb-gray-600)' }}>
                    Basic exchange bonus, check-in tracking
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Star size={18} color="#2e7d32" />
                      <span style={{ fontWeight: '600', color: '#2e7d32' }}>Hooked</span>
                    </div>
                  </td>
                  <td>5+ businesses</td>
                  <td><span style={{ color: '#2e7d32', fontWeight: '600' }}>15%</span></td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--kb-gray-600)' }}>
                    Seasonal bonus events, member deals
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={18} color="#1565c0" />
                      <span style={{ fontWeight: '600', color: '#1565c0' }}>Line & Sinker</span>
                    </div>
                  </td>
                  <td>10+ businesses</td>
                  <td><span style={{ color: '#1565c0', fontWeight: '600' }}>20%</span></td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--kb-gray-600)' }}>
                    Priority access, exclusive events
                  </td>
                </tr>
                <tr style={{ background: 'rgba(201, 162, 39, 0.1)' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Crown size={18} color="#c9a227" />
                      <span style={{ fontWeight: '600', color: '#c9a227' }}>Village Patron</span>
                    </div>
                  </td>
                  <td>15+ businesses</td>
                  <td><span style={{ color: '#c9a227', fontWeight: '600' }}>25%</span></td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--kb-gray-600)' }}>
                    All perks + community recognition + VIP events
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/profile" className="btn btn-primary">
              Check My Progress
            </Link>
          </div>
        </div>
      </section>

      {/* All Benefits */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-cream)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '2rem', textAlign: 'center' }}>
            All Member Benefits
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'var(--kb-navy)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <benefit.Icon size={24} color="var(--kb-gold)" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--kb-navy)', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                      {benefit.title}
                    </h3>
                    <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
                      {benefit.highlight}
                    </span>
                    <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange Calculator */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>
            See Your Savings
          </h2>
          <p style={{ color: 'var(--kb-gray-500)', marginBottom: '2rem' }}>
            Example: Exchange $100 USD
          </p>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[
                { tier: 'Curious', bonus: 10, color: '#888' },
                { tier: 'Hooked', bonus: 15, color: '#2e7d32' },
                { tier: 'Line & Sinker', bonus: 20, color: '#1565c0' },
                { tier: 'Village Patron', bonus: 25, color: '#c9a227' },
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: `${t.color}10`,
                    border: `1px solid ${t.color}30`,
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: t.color, fontWeight: '600' }}>
                    {t.tier}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: t.color,
                  }}>
                    ${100 + t.bonus}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                    in Kinderbucks
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to="/exchange" className="btn btn-gold" style={{ padding: '1rem 2rem' }}>
              Start Exchanging
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '3rem 1rem',
        background: 'var(--kb-green)',
        color: 'var(--kb-white)',
        textAlign: 'center',
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Start earning rewards today</h3>
        <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
          Visit a participating business and scan their QR code to begin
        </p>
        <Link to="/businesses" className="btn btn-gold">
          Find Businesses Near You
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default Benefits
