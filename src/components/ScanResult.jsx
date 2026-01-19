import { motion } from 'framer-motion'

const denominationColors = {
  1: { bg: '#d4edda', text: '#155724' },
  5: { bg: '#cce5ff', text: '#004085' },
  10: { bg: '#e2d5e7', text: '#4a235a' },
  20: { bg: '#fff3cd', text: '#856404' },
}

function ScanResult({ kinderbuck }) {
  const colors = denominationColors[kinderbuck.denomination] || denominationColors[5]

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className="card"
      style={{
        textAlign: 'center',
        maxWidth: '400px',
        background: colors.bg,
      }}
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 style={{ color: colors.text, fontSize: '3rem', marginBottom: '0.5rem' }}>
          ${kinderbuck.denomination}
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: '1.5rem', color: colors.text }}>
          {kinderbuck.serial}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ marginTop: '1.5rem' }}
      >
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '20px',
          color: 'var(--kb-green)',
          fontWeight: 'bold'
        }}>
          VERIFIED AUTHENTIC
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}
      >
        <p>Status: <strong>{kinderbuck.status}</strong></p>
        {kinderbuck.issuedAt && (
          <p>Issued: {new Date(kinderbuck.issuedAt.seconds * 1000).toLocaleDateString()}</p>
        )}
        <p>Scans: {kinderbuck.scanCount || 1}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        style={{ marginTop: '1.5rem' }}
      >
        <iframe
          src="https://giphy.com/embed/B1txHfofr9y08bDB8b"
          width="200"
          height="200"
          frameBorder="0"
          style={{ borderRadius: '12px', pointerEvents: 'none' }}
          allowFullScreen
        />
      </motion.div>
    </motion.div>
  )
}

export default ScanResult
