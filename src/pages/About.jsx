import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Store,
  TrendingUp,
  Star,
  Croissant,
  ShieldCheck,
  Zap
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import QRCode from '../components/QRCode'

// Live demo URLs
const DEMO_BILL_URL = 'https://harmonicsystems.github.io/kinderbucks/#/scan/KB-0001'
const DEMO_BUSINESS_URL = 'https://harmonicsystems.github.io/kinderbucks/#/checkin/BROADST-BAGEL'
const DEMO_BUSINESS_NAME = 'Broad Street Bagel Co.'

function InteractiveDemo() {
  const [activeDemo, setActiveDemo] = useState(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const startDemo = (type) => {
    setActiveDemo(type)
    setScanProgress(0)
    setShowResult(false)

    // Animate the "scanning" progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setScanProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => setShowResult(true), 200)
      }
    }, 100)
  }

  const resetDemo = () => {
    setActiveDemo(null)
    setScanProgress(0)
    setShowResult(false)
  }

  return (
    <section style={{ padding: '4rem 1rem', background: 'var(--kb-white)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, var(--kb-gold) 0%, #e8c33a 100%)',
            color: 'var(--kb-navy)',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '1rem',
          }}>
            <Zap size={16} /> Try It Live
          </div>
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.75rem' }}>
            See Kinderbucks in Action
          </h2>
          <p style={{ color: 'var(--kb-gray-600)', maxWidth: '600px', margin: '0 auto' }}>
            Scan these real QR codes with your phone's camera to experience the magic
          </p>
        </motion.div>

        {/* Two Demo Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          {/* Demo 1: Currency Verification */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="card"
            style={{
              padding: '2rem',
              background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
              border: '2px solid #e8f0ff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative corner */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, transparent 50%, rgba(52, 152, 219, 0.1) 50%)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShieldCheck size={22} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'var(--kb-navy)', margin: 0, fontSize: '1.2rem' }}>
                  Verify Currency
                </h3>
                <p style={{ color: 'var(--kb-gray-500)', margin: 0, fontSize: '0.85rem' }}>
                  Confirm authenticity instantly
                </p>
              </div>
            </div>

            <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Every Kinderbuck has a unique QR code. Scan to verify it's real, see its value, and track its journey through the village.
            </p>

            {/* QR Code Display */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <QRCode
                  value={DEMO_BILL_URL}
                  size={130}
                  denomination={5}
                  showFrame={true}
                />
              </motion.div>
            </div>

            {/* Instruction */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(52, 152, 219, 0.08)',
              borderRadius: '10px',
              marginBottom: '1rem',
            }}>
              <Smartphone size={20} color="#3498db" />
              <span style={{ color: 'var(--kb-gray-700)', fontSize: '0.9rem' }}>
                Point your phone camera at the QR code
              </span>
            </div>

            {/* What you'll see */}
            <div style={{
              borderTop: '1px dashed var(--kb-gray-200)',
              paddingTop: '1rem',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)', marginBottom: '0.5rem' }}>
                You'll see:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Verified', '$5 Value', 'Active Status', 'Serial: KB-0001'].map((item, i) => (
                  <span key={i} style={{
                    padding: '0.25rem 0.6rem',
                    background: 'var(--kb-gray-100)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--kb-gray-600)',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Demo 2: Business Check-in */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="card"
            style={{
              padding: '2rem',
              background: 'linear-gradient(180deg, #f8fff8 0%, #ffffff 100%)',
              border: '2px solid #e8ffe8',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative corner */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, transparent 50%, rgba(39, 174, 96, 0.1) 50%)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, var(--kb-green) 0%, #1e8449 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Store size={22} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'var(--kb-navy)', margin: 0, fontSize: '1.2rem' }}>
                  Check In
                </h3>
                <p style={{ color: 'var(--kb-gray-500)', margin: 0, fontSize: '0.85rem' }}>
                  Record visits, earn rewards
                </p>
              </div>
            </div>

            <p style={{ color: 'var(--kb-gray-600)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Scan the QR code at each business you visit. Build your Kinderhooker status and unlock better exchange rates!
            </p>

            {/* QR Code Display - Business style */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  background: 'linear-gradient(135deg, var(--kb-green) 0%, #1e8449 100%)',
                  borderRadius: '16px',
                  padding: '3px',
                  boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
                }}
              >
                <div style={{
                  background: 'white',
                  borderRadius: '14px',
                  padding: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: 'var(--kb-green)',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                  }}>
                    CHECK IN AT
                  </div>
                  <QRCode
                    value={DEMO_BUSINESS_URL}
                    size={110}
                    denomination={1}
                    showFrame={false}
                  />
                  <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}>
                    <Croissant size={14} color="var(--kb-green)" />
                    <span style={{
                      fontWeight: '600',
                      color: 'var(--kb-navy)',
                      fontSize: '0.9rem',
                    }}>
                      {DEMO_BUSINESS_NAME}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Instruction */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(39, 174, 96, 0.08)',
              borderRadius: '10px',
              marginBottom: '1rem',
            }}>
              <Smartphone size={20} color="var(--kb-green)" />
              <span style={{ color: 'var(--kb-gray-700)', fontSize: '0.9rem' }}>
                Scan when you visit a business
              </span>
            </div>

            {/* What you'll see */}
            <div style={{
              borderTop: '1px dashed var(--kb-gray-200)',
              paddingTop: '1rem',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)', marginBottom: '0.5rem' }}>
                You'll see:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Check-in Recorded', '+1 Business', 'Tier Progress', 'Next Reward'].map((item, i) => (
                  <span key={i} style={{
                    padding: '0.25rem 0.6rem',
                    background: 'var(--kb-gray-100)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--kb-gray-600)',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* The Connection - How it all works together */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          style={{
            background: 'linear-gradient(135deg, var(--kb-navy) 0%, #1a3a5c 100%)',
            borderRadius: '20px',
            padding: '2rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <Sparkles size={20} color="var(--kb-gold)" />
              <span style={{ color: 'var(--kb-gold)', fontWeight: '600', fontSize: '0.9rem' }}>
                The Kinderbucks Loop
              </span>
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', maxWidth: '500px' }}>
              Check-ins unlock better exchange rates on currency
            </h3>

            {/* Visual flow */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              alignItems: 'center',
            }}>
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Store size={24} color="var(--kb-gold)" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Visit & Check In</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    Scan at local businesses
                  </div>
                </div>
              </motion.div>

              {/* Arrow */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ArrowRight size={24} color="var(--kb-gold)" style={{ opacity: 0.5 }} />
              </div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <TrendingUp size={24} color="var(--kb-gold)" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Level Up</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    Reach new tiers
                  </div>
                </div>
              </motion.div>

              {/* Arrow */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ArrowRight size={24} color="var(--kb-gold)" style={{ opacity: 0.5 }} />
              </div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, var(--kb-gold) 0%, #b8922d 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Star size={24} color="var(--kb-navy)" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Earn More</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    Up to 25% bonus!
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tier preview */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}>
              {[
                { name: 'Curious', visits: '1+', bonus: '10%' },
                { name: 'Hooked', visits: '5+', bonus: '15%' },
                { name: 'Line & Sinker', visits: '10+', bonus: '20%' },
                { name: 'Village Patron', visits: '15+', bonus: '25%', featured: true },
              ].map((tier, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.5rem 1rem',
                    background: tier.featured
                      ? 'linear-gradient(135deg, var(--kb-gold) 0%, #b8922d 100%)'
                      : 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: tier.featured ? 'var(--kb-navy)' : 'white',
                    fontWeight: tier.featured ? '600' : '400',
                  }}
                >
                  {tier.name}: {tier.bonus}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            marginTop: '2.5rem',
          }}
        >
          <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1rem' }}>
            Ready to start your Kinderhooker journey?
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/profile" className="btn btn-primary">
              View My Progress
            </Link>
            <Link to="/businesses" className="btn btn-secondary">
              Find Businesses to Visit
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

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

      {/* Interactive Demo Section */}
      <InteractiveDemo />

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
