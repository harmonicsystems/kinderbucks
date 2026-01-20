import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  QrCode,
  Send,
  Store,
  ArrowRightLeft,
  Users,
  Home,
  Settings,
  LogOut,
  Shield,
  Banknote
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { logOut } from '../firebase/auth'

function AdminLayout({ children, title }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, isAdmin } = useAuth()

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/admin/exchanges', label: 'Exchanges', Icon: ArrowRightLeft },
    { to: '/admin/redemptions', label: 'Redemptions', Icon: Banknote },
    { to: '/admin/members', label: 'Members', Icon: Users },
    { to: '/admin/generate', label: 'Generate QR', Icon: QrCode },
    { to: '/admin/issue', label: 'Issue Currency', Icon: Send },
    { to: '/admin/businesses', label: 'Businesses', Icon: Store },
    { to: '/admin/users', label: 'User Management', Icon: Shield },
  ]

  const handleLogout = async () => {
    await logOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--kb-navy)',
        color: 'var(--kb-white)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Link to="/map" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--kb-gold)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--kb-navy)',
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
                color: 'var(--kb-white)',
                fontSize: '1.1rem',
              }}>
                Kinderbucks
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--kb-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Admin Portal
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.5rem',
                color: isActive(item.to) ? 'var(--kb-gold)' : 'var(--kb-gray-300)',
                background: isActive(item.to) ? 'rgba(201, 162, 39, 0.1)' : 'transparent',
                borderLeft: isActive(item.to) ? '3px solid var(--kb-gold)' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: isActive(item.to) ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              <item.Icon size={20} strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          {user && (
            <div style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '0.75rem',
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-300)' }}>
                {profile?.displayName || user.email}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--kb-gray-500)' }}>
                {profile?.role || 'member'}
              </div>
            </div>
          )}
          <Link
            to="/map"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0',
              color: 'var(--kb-gray-400)',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            <Home size={18} />
            Back to Site
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0',
                color: 'var(--kb-gray-400)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                width: '100%',
              }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        background: 'var(--kb-cream)',
        minHeight: '100vh',
      }}>
        {/* Top Header */}
        <header style={{
          background: 'var(--kb-white)',
          borderBottom: '1px solid var(--kb-gray-200)',
          padding: '1.25rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: 'var(--kb-navy)',
            margin: 0,
          }}>
            {title}
          </h1>
        </header>

        {/* Page Content */}
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          aside {
            width: 100% !important;
            position: relative !important;
            display: none;
          }
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminLayout
