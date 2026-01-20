import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'

function About() {
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
          <h1 style={{ marginBottom: '1rem' }}>How Kinderbucks Works</h1>
          <p style={{ color: 'var(--kb-gray-300)', fontSize: '1.1rem' }}>
            A simple system designed to keep money local and reward community participation
          </p>
        </div>
      </section>

      {/* What is Kinderbucks */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem' }}>What is Kinderbucks?</h2>
          <div style={{ color: 'var(--kb-gray-700)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Kinderbucks</strong> is a local currency program for the Village of Kinderhook, NY.
              It's real money – physical bills with QR codes for verification – that can only be spent at
              participating local businesses.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              When you exchange US dollars for Kinderbucks, you're making a commitment to spend locally.
              In return, you receive bonus value through our OK Membership program, turning $10 into $11,
              $12, or even $12.50 in local spending power.
            </p>
            <p>
              Every Kinderbuck spent stays in the village, circulating between businesses and residents,
              strengthening our local economy with each transaction.
            </p>
          </div>
        </div>
      </section>

      {/* The Exchange Process */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-cream)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '2rem', textAlign: 'center' }}>
            The Exchange Process
          </h2>

          <div style={{ display: 'grid', gap: '2rem', maxWidth: '700px', margin: '0 auto' }}>
            {[
              {
                step: 1,
                title: 'Visit an Exchange Point',
                description: 'Stop by any participating business or our central exchange location with US dollars.',
              },
              {
                step: 2,
                title: 'Show Your Membership',
                description: 'Scan your profile QR code or provide your phone number to apply your tier bonus.',
              },
              {
                step: 3,
                title: 'Receive Your Kinderbucks',
                description: 'Get physical Kinderbuck bills in $1, $5, $10, and $20 denominations with your bonus applied.',
              },
              {
                step: 4,
                title: 'Spend Locally',
                description: 'Use your Kinderbucks at any of our 19+ participating businesses.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'var(--kb-navy)',
                  color: 'var(--kb-gold)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--kb-gray-600)' }}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem' }}>Verification & Security</h2>
          <div style={{ color: 'var(--kb-gray-700)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '1rem' }}>
              Every Kinderbuck bill has a unique QR code that links to our verification system.
              When scanned, it confirms:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>The bill's authenticity</li>
              <li style={{ marginBottom: '0.5rem' }}>Its denomination</li>
              <li style={{ marginBottom: '0.5rem' }}>Its current status (active, redeemed, etc.)</li>
              <li>How many times it's been verified</li>
            </ul>
            <p>
              This prevents counterfeiting and gives businesses confidence when accepting Kinderbucks.
            </p>
          </div>

          <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--kb-gray-600)' }}>Try verifying a Kinderbuck:</p>
            <Link to="/scan/KB-0001" className="btn btn-primary">
              Verify KB-0001
            </Link>
          </div>
        </div>
      </section>

      {/* OK Membership */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-cream)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>OK Membership</div>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem' }}>The Kinderhooker Program</h2>
          <div style={{ color: 'var(--kb-gray-700)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>OK Membership</strong> rewards customers who actively support local businesses.
              The more businesses you visit, the higher your tier – and the better your exchange rate.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Each participating business has a QR code. Scan it when you visit to record a "check-in."
              Your tier is based on how many <em>unique</em> businesses you've visited, encouraging
              exploration of the entire village.
            </p>
            <p>
              There's no cost to join. Simply start checking in at businesses, and you'll automatically
              become a "Kinderhooker" with access to bonus exchange rates.
            </p>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/benefits" className="btn btn-primary">
              View All Benefits
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              Check My Status
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '2rem' }}>Frequently Asked Questions</h2>

          {[
            {
              q: 'Is Kinderbucks real money?',
              a: 'Kinderbucks are a local complementary currency. They have value within our participating business network but cannot be deposited in banks or used outside Kinderhook.',
            },
            {
              q: 'Can I convert Kinderbucks back to USD?',
              a: 'Kinderbucks are designed to circulate locally. While businesses can redeem them, individual customers are encouraged to spend them at participating businesses.',
            },
            {
              q: 'What if a business closes?',
              a: 'Kinderbucks remain valid at all other participating businesses. The program maintains reserves to ensure stability.',
            },
            {
              q: 'How do businesses benefit?',
              a: 'Businesses receive customers committed to spending locally, gain exposure through our directory, and become part of a community-strengthening initiative.',
            },
            {
              q: 'Is there a fee to exchange?',
              a: 'No fees. You receive full value plus your membership bonus when exchanging USD for Kinderbucks.',
            },
          ].map((faq, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>{faq.q}</h4>
              <p style={{ color: 'var(--kb-gray-600)' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '3rem 1rem',
        background: 'var(--kb-navy)',
        color: 'var(--kb-white)',
        textAlign: 'center',
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Ready to get started?</h3>
        <Link to="/exchange" className="btn btn-gold">
          Get Your Kinderbucks
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default About
