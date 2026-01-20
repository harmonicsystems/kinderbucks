import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page page-center" style={{ background: '#faf8f3', minHeight: '100vh' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎣</div>
      <h1 style={{ color: '#1a5f2a', marginBottom: '0.5rem' }}>Kinderbucks</h1>
      <h2 style={{ color: '#5a6c7d', fontWeight: 'normal', marginBottom: '2rem' }}>+ Kinderhooker</h2>

      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', color: '#5a6c7d' }}>
        Village currency verification & local business loyalty program.
        <br />Support local businesses, earn rewards!
      </p>

      {/* Kinderhooker Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ color: '#1a5f2a', marginBottom: '1rem' }}>🎣 Kinderhooker Loyalty</h3>
        <p style={{ color: '#5a6c7d', marginBottom: '1rem', fontSize: '0.95rem' }}>
          Check in at local businesses to earn tiers and unlock Kinderbuck match bonuses!
        </p>
        <Link
          to="/profile"
          className="btn"
          style={{ background: '#1a5f2a', width: '100%', display: 'block', textAlign: 'center' }}
        >
          View My Profile
        </Link>
      </div>

      {/* Admin Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Admin</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/admin/dashboard" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
            Dashboard
          </Link>
          <Link to="/admin/businesses" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
            Businesses
          </Link>
        </div>
      </div>

      <p style={{ marginTop: '2rem', opacity: 0.5, fontSize: '0.85rem' }}>
        Scan a Kinderbuck or business QR code to get started
      </p>
    </div>
  )
}

export default Home
