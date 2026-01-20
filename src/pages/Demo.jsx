import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'

const AUDIENCES = {
  customer: {
    id: 'customer',
    title: 'For Customers',
    subtitle: 'Start supporting local in minutes',
    icon: '🛍️',
    color: 'var(--kb-green)',
    minCommitment: 'Start with just $10',
  },
  business: {
    id: 'business',
    title: 'For Business Owners',
    subtitle: 'Accept Kinderbucks and grow your customer base',
    icon: '🏪',
    color: 'var(--kb-navy)',
    minCommitment: 'No upfront cost to join',
  },
  association: {
    id: 'association',
    title: 'For the Business Association',
    subtitle: 'Strengthen the village economy together',
    icon: '🏛️',
    color: 'var(--kb-gold)',
    minCommitment: 'Community-driven program',
  },
}

const CUSTOMER_STEPS = [
  {
    number: 1,
    title: 'Get Your First Kinderbucks',
    description: 'Visit any exchange location with USD. Start with as little as $10.',
    visual: 'exchange',
    details: [
      'Visit Village Hall, OK Pantry, or The Aviary',
      'Exchange any amount ($10, $20, $50, $100)',
      'New members get 10% bonus automatically',
      'Receive physical Kinderbucks bills',
    ],
    tip: 'First-time? You\'ll get $11 in Kinderbucks for every $10 USD!',
  },
  {
    number: 2,
    title: 'Spend at Local Businesses',
    description: 'Use Kinderbucks like cash at 19+ participating village businesses.',
    visual: 'spend',
    details: [
      'Accepted at restaurants, shops, and services',
      'Works just like regular currency',
      'Businesses give change in Kinderbucks when possible',
      '100% of your money stays in Kinderhook',
    ],
    tip: 'Check the business directory to plan your local shopping route!',
  },
  {
    number: 3,
    title: 'Check In When You Visit',
    description: 'Scan QR codes at businesses to track your visits and earn rewards.',
    visual: 'checkin',
    details: [
      'Look for the Kinderbucks QR code at each business',
      'Scan with your phone camera',
      'Each unique business counts toward your tier',
      'One check-in per business per hour',
    ],
    tip: 'You don\'t need an app - just scan and go!',
  },
  {
    number: 4,
    title: 'Level Up Your Membership',
    description: 'Visit more businesses to unlock better exchange rates.',
    visual: 'tiers',
    details: [
      'Curious (1+ businesses): 10% bonus',
      'Hooked (5+ businesses): 15% bonus',
      'Line & Sinker (10+ businesses): 20% bonus',
      'Village Patron (15+ businesses): 25% bonus',
    ],
    tip: 'At 25% bonus, $100 USD gets you $125 in Kinderbucks!',
  },
]

const BUSINESS_STEPS = [
  {
    number: 1,
    title: 'Register Your Business',
    description: 'Join the program with no upfront costs or monthly fees.',
    visual: 'register',
    details: [
      'Contact the Business Association to register',
      'Receive your unique business QR code',
      'Get listed in the Kinderbucks directory',
      'No fees, no contracts, no risk',
    ],
    tip: 'Registration takes less than 10 minutes!',
  },
  {
    number: 2,
    title: 'Accept Kinderbucks Payments',
    description: 'Accept Kinderbucks just like you accept cash.',
    visual: 'accept',
    details: [
      'Kinderbucks bills have QR codes for verification',
      'Scan any bill to verify authenticity',
      'Make change in Kinderbucks when possible',
      'Train staff in minutes',
    ],
    tip: 'Verification is instant - just scan the QR code on any bill.',
  },
  {
    number: 3,
    title: 'Build Customer Loyalty',
    description: 'Customers check in at your business, driving repeat visits.',
    visual: 'loyalty',
    details: [
      'Display your QR code prominently',
      'Customers scan to record their visit',
      'Each check-in helps customers level up',
      'Higher tiers = more valuable customers',
    ],
    tip: 'Village Patrons have visited 15+ businesses - they\'re your most loyal customers!',
  },
  {
    number: 4,
    title: 'Redeem or Recirculate',
    description: 'Use Kinderbucks at other businesses or redeem for USD.',
    visual: 'redeem',
    details: [
      'Spend at other participating businesses',
      'Pay suppliers who accept Kinderbucks',
      'Redeem for USD at exchange locations (1:1)',
      'Keep money circulating locally',
    ],
    tip: 'Most businesses find it easier to spend than redeem - the money keeps moving!',
  },
]

const ASSOCIATION_STEPS = [
  {
    number: 1,
    title: 'Program Overview',
    description: 'A local currency that strengthens the village economy.',
    visual: 'overview',
    details: [
      'Kinderbucks is a complementary currency for Kinderhook',
      'Backed 1:1 by USD in a dedicated account',
      'Bonus rates funded by interest and community investment',
      'QR verification prevents counterfeiting',
    ],
    tip: 'Complementary currencies have been used successfully in communities worldwide.',
  },
  {
    number: 2,
    title: 'Economic Impact',
    description: 'Money that circulates locally multiplies its impact.',
    visual: 'impact',
    details: [
      'Studies show local currency circulates 3-4x more than USD',
      '$10,000 in circulation = $30,000-40,000 in local economic activity',
      'Encourages "buy local" behavior',
      'Builds connections between businesses and residents',
    ],
    tip: 'Every Kinderbuck spent is guaranteed to stay in the village.',
  },
  {
    number: 3,
    title: 'Member Engagement',
    description: 'Tier system drives exploration of local businesses.',
    visual: 'engagement',
    details: [
      'Gamification encourages visiting new businesses',
      'Tier bonuses reward loyal community members',
      'Check-in data shows foot traffic patterns',
      'Members become ambassadors for local spending',
    ],
    tip: 'The average member discovers 3 new businesses they didn\'t know about.',
  },
  {
    number: 4,
    title: 'Administration & Growth',
    description: 'Simple management with room to scale.',
    visual: 'admin',
    details: [
      'Digital dashboard tracks circulation and usage',
      'New businesses join with minimal onboarding',
      'Seasonal promotions drive engagement',
      'Expand to neighboring communities over time',
    ],
    tip: 'The program is designed to be self-sustaining once established.',
  },
]

function StepCard({ step, isActive, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: isActive ? 'var(--kb-navy)' : 'var(--kb-white)',
        color: isActive ? 'var(--kb-white)' : 'var(--kb-gray-700)',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: 'pointer',
        border: isActive ? 'none' : '1px solid var(--kb-gray-200)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: isActive ? 'var(--kb-gold)' : 'var(--kb-gray-100)',
          color: isActive ? 'var(--kb-navy)' : 'var(--kb-gray-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '1rem',
          flexShrink: 0,
        }}>
          {step.number}
        </div>
        <div>
          <h4 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.25rem',
          }}>
            {step.title}
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            opacity: 0.8,
          }}>
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function StepDetails({ step, audienceColor }) {
  return (
    <motion.div
      key={step.number}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--kb-white)',
        borderRadius: '16px',
        padding: '2rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: `${audienceColor}15`,
        color: audienceColor,
        padding: '0.5rem 1rem',
        borderRadius: '100px',
        fontSize: '0.8rem',
        fontWeight: '600',
        marginBottom: '1rem',
        alignSelf: 'flex-start',
      }}>
        STEP {step.number}
      </div>

      <h3 style={{
        color: 'var(--kb-navy)',
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
      }}>
        {step.title}
      </h3>

      <p style={{
        color: 'var(--kb-gray-600)',
        marginBottom: '1.5rem',
        fontSize: '1.05rem',
      }}>
        {step.description}
      </p>

      <div style={{
        background: 'var(--kb-cream)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        flex: 1,
      }}>
        <h4 style={{
          color: 'var(--kb-navy)',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
        }}>
          What This Looks Like
        </h4>
        <ul style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}>
          {step.details.map((detail, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '0.75rem',
                color: 'var(--kb-gray-700)',
              }}
            >
              <span style={{ color: 'var(--kb-green)', fontWeight: '600' }}>✓</span>
              {detail}
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, var(--kb-gold) 0%, #d4af37 100%)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.5rem' }}>💡</span>
        <div>
          <div style={{
            fontWeight: '600',
            color: 'var(--kb-navy)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            marginBottom: '0.25rem',
          }}>
            Pro Tip
          </div>
          <div style={{ color: 'var(--kb-navy)', fontSize: '0.95rem' }}>
            {step.tip}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function DemoFlow({ audience, steps }) {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr',
      gap: '2rem',
      minHeight: '500px',
    }} className="demo-flow-grid">
      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((step, i) => (
          <StepCard
            key={step.number}
            step={step}
            isActive={activeStep === i}
            onClick={() => setActiveStep(i)}
          />
        ))}
      </div>

      {/* Active Step Details */}
      <AnimatePresence mode="wait">
        <StepDetails
          key={activeStep}
          step={steps[activeStep]}
          audienceColor={audience.color}
        />
      </AnimatePresence>
    </div>
  )
}

function CommitmentCard({ icon, title, description }) {
  return (
    <div style={{
      background: 'var(--kb-white)',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      border: '1px solid var(--kb-gray-200)',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
      <h4 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>{title}</h4>
      <p style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem', margin: 0 }}>{description}</p>
    </div>
  )
}

function Demo() {
  const [activeAudience, setActiveAudience] = useState('customer')
  const audience = AUDIENCES[activeAudience]

  const getSteps = () => {
    switch (activeAudience) {
      case 'customer': return CUSTOMER_STEPS
      case 'business': return BUSINESS_STEPS
      case 'association': return ASSOCIATION_STEPS
      default: return CUSTOMER_STEPS
    }
  }

  const getCTA = () => {
    switch (activeAudience) {
      case 'customer':
        return { to: '/exchange', text: 'Get Your First Kinderbucks', secondary: '/businesses', secondaryText: 'Browse Businesses' }
      case 'business':
        return { to: '/businesses', text: 'Register Your Business', secondary: '/about', secondaryText: 'Learn More' }
      case 'association':
        return { to: '/about', text: 'Full Program Details', secondary: '/admin/dashboard', secondaryText: 'View Dashboard' }
      default:
        return { to: '/exchange', text: 'Get Started' }
    }
  }

  const cta = getCTA()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)',
        color: 'var(--kb-white)',
        padding: '3rem 1rem',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
            Interactive Demo
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: '700',
            marginBottom: '1rem',
          }}>
            See How Kinderbucks Works
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--kb-gray-300)',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Choose your perspective below to see a step-by-step walkthrough of the Kinderbucks program.
          </p>
        </motion.div>
      </section>

      {/* Audience Selector */}
      <section style={{
        background: 'var(--kb-white)',
        padding: '2rem 1rem',
        borderBottom: '1px solid var(--kb-gray-200)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}>
            {Object.values(AUDIENCES).map((aud) => (
              <motion.button
                key={aud.id}
                onClick={() => setActiveAudience(aud.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: activeAudience === aud.id
                    ? `linear-gradient(135deg, ${aud.color} 0%, ${aud.color}dd 100%)`
                    : 'var(--kb-cream)',
                  color: activeAudience === aud.id ? 'var(--kb-white)' : 'var(--kb-gray-700)',
                  border: activeAudience === aud.id ? 'none' : '2px solid var(--kb-gray-200)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{aud.icon}</span>
                  <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{aud.title}</span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  opacity: 0.85,
                }}>
                  {aud.subtitle}
                </p>
                <div style={{
                  marginTop: '0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  opacity: activeAudience === aud.id ? 1 : 0.7,
                }}>
                  {aud.minCommitment}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Flow Section */}
      <section style={{
        background: 'var(--kb-cream)',
        padding: '3rem 1rem',
        flex: 1,
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAudience}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DemoFlow audience={audience} steps={getSteps()} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Minimum Commitment Section */}
      <section style={{
        background: 'var(--kb-white)',
        padding: '3rem 1rem',
        borderTop: '1px solid var(--kb-gray-200)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>
              Minimal Commitment, Maximum Impact
            </h2>
            <p style={{ color: 'var(--kb-gray-500)' }}>
              Kinderbucks is designed to be easy to try and rewarding to use
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}>
            <CommitmentCard
              icon="💵"
              title="Start with $10"
              description="No minimum exchange amount. Try it with pocket change."
            />
            <CommitmentCard
              icon="🚫"
              title="No Fees"
              description="No signup fees, no monthly costs, no hidden charges."
            />
            <CommitmentCard
              icon="↩️"
              title="Full Refund"
              description="Businesses can redeem Kinderbucks for USD 1:1 anytime."
            />
            <CommitmentCard
              icon="⏱️"
              title="Instant Setup"
              description="Customers start immediately. Businesses onboard in minutes."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: audience.color,
        padding: '3rem 1rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--kb-white)', marginBottom: '0.5rem' }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem' }}>
            {activeAudience === 'customer' && 'Join hundreds of Kinderhook residents supporting local businesses.'}
            {activeAudience === 'business' && 'Join 19 local businesses already accepting Kinderbucks.'}
            {activeAudience === 'association' && 'See the full details of how the program operates.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={cta.to}
              className="btn"
              style={{
                background: 'var(--kb-white)',
                color: audience.color,
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
              }}
            >
              {cta.text}
            </Link>
            {cta.secondary && (
              <Link
                to={cta.secondary}
                className="btn btn-outline"
                style={{
                  borderColor: 'var(--kb-white)',
                  color: 'var(--kb-white)',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                }}
              >
                {cta.secondaryText}
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .demo-flow-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Demo
