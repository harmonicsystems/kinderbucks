import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer style={{
      background: 'var(--kb-navy)',
      color: 'var(--kb-white)',
      padding: '3rem 1rem 2rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'var(--kb-gold)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--kb-navy)',
              fontFamily: 'var(--font-display)',
              fontWeight: '700',
            }}>
              K
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '1.1rem' }}>
              Kinderbucks
            </span>
          </div>
          <p style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Village of Kinderhook's local currency program. Supporting local businesses, strengthening community.
          </p>
          <p style={{ color: 'var(--kb-gray-500)', fontSize: '0.8rem', marginTop: '1rem' }}>
            Est. 2026
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: 'var(--kb-gold)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/demo" style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem' }}>See Demo</Link>
            <Link to="/about" style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem' }}>How It Works</Link>
            <Link to="/benefits" style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem' }}>Member Benefits</Link>
            <Link to="/exchange" style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem' }}>Get Kinderbucks</Link>
            <Link to="/businesses" style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem' }}>For Businesses</Link>
          </div>
        </div>

        {/* For Members */}
        <div>
          <h4 style={{ color: 'var(--kb-gold)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            For Members
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/account" style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem' }}>My Account</Link>
            <Link to="/profile" style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem' }}>Kinderhooker Profile</Link>
            <Link to="/scan/KB-0001" style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem' }}>Verify Currency</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: 'var(--kb-gold)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contact
          </h4>
          <p style={{ color: 'var(--kb-gray-300)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            Village of Kinderhook<br />
            Columbia County, NY
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto 0',
        paddingTop: '2rem',
        borderTop: '1px solid var(--kb-navy-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <p style={{ color: 'var(--kb-gray-500)', fontSize: '0.8rem' }}>
          © 2026 Kinderbucks. A Harmonic Systems project.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/admin/dashboard" style={{ color: 'var(--kb-gray-500)', fontSize: '0.8rem' }}>Admin</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
