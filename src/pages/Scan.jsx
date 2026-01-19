import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getKinderbuck, recordScan } from '../firebase/kinderbucks'
import Confetti from '../components/Confetti'
import ScanResult from '../components/ScanResult'

function Scan() {
  const { serial } = useParams()
  const [kinderbuck, setKinderbuck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function verify() {
      try {
        const kb = await getKinderbuck(serial)
        if (kb) {
          setKinderbuck(kb)
          await recordScan(serial)
        } else {
          setError('not_found')
        }
      } catch (err) {
        console.error('Verification error:', err)
        setError('error')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [serial])

  if (loading) {
    return (
      <div className="page page-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '3rem' }}
        >
          $
        </motion.div>
        <p style={{ marginTop: '1rem' }}>Verifying {serial}...</p>
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div className="page page-center">
        <h1 style={{ color: '#c0392b' }}>Not Found</h1>
        <p>Serial <strong>{serial}</strong> is not a valid Kinderbuck.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page page-center">
        <h1 style={{ color: '#c0392b' }}>Error</h1>
        <p>Something went wrong verifying this Kinderbuck.</p>
      </div>
    )
  }

  return (
    <div className="page page-center">
      <Confetti />
      <ScanResult kinderbuck={kinderbuck} />
    </div>
  )
}

export default Scan
