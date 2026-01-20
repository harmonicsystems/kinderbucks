import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
  Banknote,
  Plus,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { validateForPayment } from '../firebase/kinderbucks'
import { recordPayment } from '../firebase/transactions'
import { getBusiness } from '../firebase/businesses'

function AcceptPayment() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [serial, setSerial] = useState('')
  const [validating, setValidating] = useState(false)
  const [validatedBill, setValidatedBill] = useState(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(null)
  const [businessName, setBusinessName] = useState('')

  // Load business name on mount
  useState(() => {
    async function loadBusiness() {
      if (profile?.businessCode) {
        const biz = await getBusiness(profile.businessCode)
        if (biz) setBusinessName(biz.name)
      }
    }
    loadBusiness()
  }, [profile?.businessCode])

  const handleValidate = async (e) => {
    e.preventDefault()
    setError('')
    setValidatedBill(null)

    const cleanSerial = serial.trim().toUpperCase()
    if (!cleanSerial) {
      setError('Please enter a serial number')
      return
    }

    setValidating(true)

    try {
      const result = await validateForPayment(cleanSerial)

      if (result.valid) {
        setValidatedBill(result.kb)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Validation error:', err)
      setError('Failed to validate serial number')
    }

    setValidating(false)
  }

  const handleAccept = async () => {
    if (!validatedBill || !profile?.businessCode) return

    setProcessing(true)

    try {
      await recordPayment(validatedBill.serial, profile.businessCode, businessName)
      setSuccess({
        serial: validatedBill.serial,
        amount: validatedBill.denomination
      })
      setValidatedBill(null)
      setSerial('')
    } catch (err) {
      console.error('Payment error:', err)
      setError('Failed to record payment')
    }

    setProcessing(false)
  }

  const handleReset = () => {
    setSerial('')
    setValidatedBill(null)
    setError('')
    setSuccess(null)
  }

  if (!profile?.businessCode) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--kb-cream)',
        padding: '2rem',
      }}>
        <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
          <AlertCircle size={48} color="var(--kb-gray-400)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>No Business Assigned</h2>
          <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1.5rem' }}>
            You need a business account to accept payments.
          </p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  const getDenominationColor = (denom) => {
    switch (denom) {
      case 1: return '#27ae60'
      case 5: return '#3498db'
      case 10: return '#9b59b6'
      case 20: return '#e67e22'
      case 50: return '#c0392b'
      default: return 'var(--kb-gold)'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--kb-navy)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Link
          to="/business/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--kb-gray-300)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <div style={{ color: 'var(--kb-gold)', fontWeight: '500' }}>
          {businessName}
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '500px' }}
        >
          {/* Success State */}
          {success && (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(39, 174, 96, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}>
                  <CheckCircle size={40} color="var(--kb-green)" />
                </div>
              </motion.div>

              <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>
                Payment Accepted
              </h2>
              <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1.5rem' }}>
                ${success.amount} Kinderbuck has been added to your balance
              </p>

              <div style={{
                background: 'var(--kb-gray-50)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem',
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                color: 'var(--kb-navy)',
              }}>
                {success.serial}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={handleReset}
                  className="btn btn-gold"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={18} />
                  Accept Another
                </button>
                <button
                  onClick={() => navigate('/business/dashboard')}
                  className="btn btn-secondary"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Preview State */}
          {validatedBill && !success && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>
                  Confirm Payment
                </h2>
                <p style={{ color: 'var(--kb-gray-600)' }}>
                  Review the Kinderbuck details below
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, var(--kb-cream) 0%, var(--kb-gray-100) 100%)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
                border: `3px solid ${getDenominationColor(validatedBill.denomination)}`,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--kb-gray-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.5rem',
                  }}>
                    Serial Number
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'var(--kb-navy)',
                    marginBottom: '1.5rem',
                  }}>
                    {validatedBill.serial}
                  </div>

                  <div style={{
                    fontSize: '4rem',
                    fontWeight: '700',
                    color: getDenominationColor(validatedBill.denomination),
                    lineHeight: 1,
                  }}>
                    ${validatedBill.denomination}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--kb-gray-600)',
                    marginTop: '0.5rem',
                  }}>
                    Kinderbuck
                  </div>
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  color: '#dc2626',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}>
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={processing}
                >
                  <X size={18} style={{ marginRight: '0.5rem' }} />
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : (
                    <>
                      <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
                      Accept ${validatedBill.denomination}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Input State */}
          {!validatedBill && !success && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(201, 162, 39, 0.1)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <Banknote size={32} color="var(--kb-gold-dark)" />
                </div>
                <h2 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>
                  Accept Kinderbuck Payment
                </h2>
                <p style={{ color: 'var(--kb-gray-600)' }}>
                  Enter the serial number from the physical bill
                </p>
              </div>

              <form onSubmit={handleValidate}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'var(--kb-gray-600)',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                  }}>
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value.toUpperCase())}
                    placeholder="KB-0001"
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      letterSpacing: '0.1em',
                    }}
                    autoFocus
                  />
                </div>

                {error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: '#fef2f2',
                    borderRadius: '8px',
                    color: '#dc2626',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                  }}>
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    fontSize: '1.1rem',
                  }}
                  disabled={validating}
                >
                  {validating ? (
                    'Validating...'
                  ) : (
                    <>
                      <Search size={20} />
                      Validate
                    </>
                  )}
                </button>
              </form>

              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'var(--kb-gray-50)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: 'var(--kb-gray-600)',
              }}>
                <strong>Tip:</strong> The serial number is printed on the front of the Kinderbuck bill, typically in the format KB-XXXX.
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default AcceptPayment
