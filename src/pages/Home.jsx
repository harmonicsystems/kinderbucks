import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page page-center">
      <h1>Kinderbucks</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '500px' }}>
        Village currency verification system. Scan a Kinderbuck to verify its authenticity.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/admin/dashboard" className="btn">
          Admin Dashboard
        </Link>
        <Link to="/admin/generate" className="btn btn-secondary">
          Generate QR Codes
        </Link>
      </div>

      <p style={{ marginTop: '3rem', opacity: 0.7 }}>
        Scan a Kinderbuck QR code to verify it
      </p>
    </div>
  )
}

export default Home
