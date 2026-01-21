import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LogIn, LogOut, User, Store, Shield, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { logOut } from '../firebase/auth'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, isAuthenticated, isAdmin, isBusiness } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/map', label: 'Directory' },
    { to: '/hunts', label: 'Explore' },
    { to: '/demo', label: 'See Demo' },
    { to: '/about', label: 'How It Works' },
    { to: '/businesses', label: 'For Businesses' },
  ]

  const handleLogout = async () => {
    await logOut()
    setUserMenuOpen(false)
    navigate('/')
  }

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
        {/* Logo - go to map for authenticated users, home for guests */}
        <Link to={isAuthenticated ? "/map" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
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
            fontSize: '0.9rem',
          }}>
            OK
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              color: 'var(--kb-navy)',
              fontSize: '1.1rem',
              lineHeight: 1.1,
            }}>
              OK Kinderhook
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--kb-gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Shop Local
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
          {isAuthenticated ? (
            <>
              {/* User Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--kb-gray-100)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--kb-navy)',
                    fontWeight: '500',
                  }}
                >
                  <User size={18} />
                  {profile?.displayName || user.email?.split('@')[0]}
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '180px',
                    zIndex: 200,
                    overflow: 'hidden',
                  }}>
                    <Link
                      to="/card"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        color: 'var(--kb-gold-dark)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--kb-gray-100)',
                        fontWeight: '600',
                        background: 'rgba(201, 162, 39, 0.1)',
                      }}
                    >
                      <CreditCard size={16} /> My OK Card
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        color: 'var(--kb-gray-700)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--kb-gray-100)',
                      }}
                    >
                      <User size={16} /> My Profile
                    </Link>
                    {isBusiness && (
                      <Link
                        to="/business/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1rem',
                          color: '#2563eb',
                          textDecoration: 'none',
                          borderBottom: '1px solid var(--kb-gray-100)',
                        }}
                      >
                        <Store size={16} /> Business Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1rem',
                          color: '#dc2626',
                          textDecoration: 'none',
                          borderBottom: '1px solid var(--kb-gray-100)',
                        }}
                      >
                        <Shield size={16} /> Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        color: 'var(--kb-gray-600)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogIn size={16} /> Sign In
              </Link>
            </>
          )}
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
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isAuthenticated ? (
              <>
                <div style={{
                  padding: '0.75rem',
                  background: 'var(--kb-gray-50)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                }}>
                  <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                    {profile?.displayName || user.email}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                    {profile?.role || 'member'}
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <User size={16} /> My Profile
                </Link>
                {isBusiness && (
                  <Link
                    to="/business/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn"
                    style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Store size={16} /> Business Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn"
                    style={{ background: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Shield size={16} /> Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <LogIn size={16} /> Sign In
              </Link>
            )}
            <Link
              to="/exchange"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-gold"
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
