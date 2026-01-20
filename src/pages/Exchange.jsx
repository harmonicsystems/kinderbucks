import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Star, Award, Crown, Lightbulb, MapPin } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getVisitorId, getMember } from '../firebase/members'
import { TIERS, calculateTier } from '../utils/tiers'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const TIER_ICONS = {
  curious: Target,
  hooked: Star,
  lineAndSinker: Award,
  patron: Crown,
}

function Exchange() {
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(20)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const visitorId = getVisitorId()
      const memberData = await getMember(visitorId)
      setMember(memberData)
      setLoading(false)
    }
    load()
  }, [])

  const tierKey = member?.tier || 'curious'
  const tier = TIERS[tierKey] || TIERS.curious
  const bonus = member ? tier.bonus : 0.10 // Default 10% for new members
  const bonusAmount = amount * bonus
  const totalKinderbucks = amount + bonusAmount

  const handleExchange = async () => {
    setSubmitting(true)
    try {
      // Record exchange request in Firestore
      await addDoc(collection(db, 'exchanges'), {
        visitorId: getVisitorId(),
        usdAmount: amount,
        bonusRate: bonus,
        bonusAmount: bonusAmount,
        kinderbucksAmount: totalKinderbucks,
        tier: tierKey,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
    } catch (err) {
      console.error('Exchange error:', err)
      alert('Error submitting exchange request')
    }
    setSubmitting(false)
  }

  const presetAmounts = [10, 20, 50, 100]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--kb-green) 0%, var(--kb-green-light) 100%)',
        color: 'var(--kb-white)',
        padding: '3rem 1rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Get Kinderbucks</h1>
          <p style={{ opacity: 0.9 }}>Exchange USD for local currency with bonus value</p>
        </div>
      </section>

      <section style={{ padding: '3rem 1rem', background: 'var(--kb-cream)', flex: 1 }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card"
              style={{ textAlign: 'center', padding: '3rem 2rem' }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
              <h2 style={{ color: 'var(--kb-green)', marginBottom: '1rem' }}>Exchange Requested!</h2>
              <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1.5rem' }}>
                Your exchange request for <strong>${amount} USD</strong> →{' '}
                <strong>${totalKinderbucks.toFixed(2)} Kinderbucks</strong> has been submitted.
              </p>
              <p style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Visit any exchange point to complete your transaction and receive your Kinderbucks.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => setSuccess(false)} className="btn btn-primary">
                  Exchange More
                </button>
                <Link to="/account" className="btn btn-secondary">
                  View Account
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Your Tier */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)', marginBottom: '0.25rem' }}>
                      Your Tier
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {(() => {
                        const TierIcon = TIER_ICONS[tierKey] || Target
                        return <TierIcon size={28} color={tier.color} strokeWidth={1.5} />
                      })()}
                      <span style={{ fontWeight: '600', color: tier.color, fontSize: '1.2rem' }}>
                        {tier.name}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)', marginBottom: '0.25rem' }}>
                      Bonus Rate
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: tier.color,
                    }}>
                      {Math.round(bonus * 100)}%
                    </div>
                  </div>
                </div>
                {!member && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'var(--kb-gray-50)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--kb-gray-600)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <Lightbulb size={16} color="var(--kb-gold)" /> <Link to="/profile" style={{ color: 'var(--kb-navy)' }}>Visit businesses</Link> to increase your tier and get better rates!
                  </div>
                )}
              </div>

              {/* Exchange Calculator */}
              <div className="card">
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem' }}>Exchange Calculator</h3>

                {/* Amount Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label>Amount (USD)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {presetAmounts.map(preset => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset)}
                        className={amount === preset ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ flex: 1, padding: '0.5rem' }}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
                    min="1"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Calculation */}
                <div style={{
                  background: 'var(--kb-gray-50)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--kb-gray-600)' }}>USD Amount</span>
                    <span style={{ fontWeight: '600' }}>${amount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--kb-gray-600)' }}>
                      {tier.name} Bonus ({Math.round(bonus * 100)}%)
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--kb-green)' }}>
                      +${bonusAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="divider" style={{ margin: '0.75rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--kb-navy)', fontWeight: '600' }}>You Receive</span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.8rem',
                      fontWeight: '700',
                      color: 'var(--kb-gold-dark)',
                    }}>
                      ${totalKinderbucks.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                    Kinderbucks
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleExchange}
                  disabled={submitting}
                  className="btn btn-gold"
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                >
                  {submitting ? 'Processing...' : `Exchange $${amount} for $${totalKinderbucks.toFixed(2)} Kinderbucks`}
                </button>

                <p style={{
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--kb-gray-500)',
                  marginTop: '1rem',
                }}>
                  Complete your exchange at any participating business or exchange point
                </p>
              </div>

              {/* Exchange Locations */}
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>Exchange Locations</h4>
                <div style={{ color: 'var(--kb-gray-600)', fontSize: '0.95rem' }}>
                  <p style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--kb-green)" /> <strong>OK Pantry</strong> - 2 Hudson Street
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--kb-green)" /> <strong>Village Hall</strong> - During events
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Exchange
