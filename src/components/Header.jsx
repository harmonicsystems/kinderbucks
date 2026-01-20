import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'How It Works' },
    { to: '/benefits', label: 'Benefits' },
    { to: '/businesses', label: 'For Businesses' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header style={{
      background: 'var(--kb-white)',
      borderBottom: '1px solid var(--kb-gray-200)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--kb-gold)',
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            fontSize: '1.2rem',
          }}>
            K
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              color: 'var(--kb-navy)',
              fontSize: '1.1rem',
              lineHeight: 1.1,
            }}>
              Kinderbucks
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--kb-gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Village Currency
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: isActive(link.to) ? 'var(--kb-navy)' : 'var(--kb-gray-500)',
                fontWeight: isActive(link.to) ? '600' : '500',
                fontSize: '0.95rem',
                transition: 'color 0.2s',
                borderBottom: isActive(link.to) ? '2px solid var(--kb-gold)' : '2px solid transparent',
                paddingBottom: '4px',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
          <Link to="/account" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            My Account
          </Link>
          <Link to="/exchange" className="btn btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Get Kinderbucks
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          background: 'var(--kb-white)',
          borderTop: '1px solid var(--kb-gray-200)',
          padding: '1rem',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '0.75rem 0',
                color: isActive(link.to) ? 'var(--kb-navy)' : 'var(--kb-gray-700)',
                fontWeight: isActive(link.to) ? '600' : '400',
                borderBottom: '1px solid var(--kb-gray-100)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              My Account
            </Link>
            <Link
              to="/exchange"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-gold"
              style={{ flex: 1 }}
            >
              Get Kinderbucks
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  )
}

export default Header
