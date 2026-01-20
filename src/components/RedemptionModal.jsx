import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import { createRedemptionRequest } from '../firebase/transactions'

function RedemptionModal({ isOpen, onClose, businessCode, businessName, currentBalance, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)

    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (numAmount > currentBalance) {
      setError(`Amount exceeds your balance of $${currentBalance}`)
      return
    }

    setSubmitting(true)

    try {
      await createRedemptionRequest(businessCode, businessName, numAmount)
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setSuccess(false)
        setAmount('')
      }, 2000)
    } catch (err) {
      console.error('Error creating redemption:', err)
      setError('Failed to create redemption request')
    }

    setSubmitting(false)
  }

  const handleClose = () => {
    if (!submitting) {
      setAmount('')
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="card"
          style={{
            maxWidth: '400px',
            width: '100%',
            padding: 0,
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--kb-gray-200)',
            background: 'var(--kb-gray-50)',
          }}>
            <h3 style={{ margin: 0, color: 'var(--kb-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} />
              Request Redemption
            </h3>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                color: 'var(--kb-gray-500)',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '1.5rem' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(39, 174, 96, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <CheckCircle size={32} color="var(--kb-green)" />
                </div>
                <h4 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem' }}>Request Submitted</h4>
                <p style={{ color: 'var(--kb-gray-600)', margin: 0 }}>
                  Your redemption request for ${amount} has been submitted for admin approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--kb-gold) 0%, var(--kb-gold-dark) 100%)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  color: 'white',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    Available Balance
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                    ${currentBalance.toFixed(2)}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'var(--kb-gray-600)',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                  }}>
                    Amount to Redeem (USD)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--kb-gray-500)',
                      fontWeight: '500',
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      max={currentBalance}
                      step="0.01"
                      style={{
                        width: '100%',
                        paddingLeft: '2rem',
                        fontSize: '1.25rem',
                        fontWeight: '500',
                      }}
                      required
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    {[25, 50, 100].map((preset) => (
                      currentBalance >= preset && (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset.toString())}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          ${preset}
                        </button>
                      )
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount(currentBalance.toString())}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      Max
                    </button>
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

                <div style={{
                  padding: '1rem',
                  background: 'var(--kb-gray-50)',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--kb-gray-600)',
                }}>
                  <strong>How it works:</strong> Your request will be reviewed by an administrator. Once approved, you'll receive USD equivalent and the corresponding Kinderbucks bills will be marked as redeemed.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={submitting || !amount}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default RedemptionModal
