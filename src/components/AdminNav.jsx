import { Link, useLocation } from 'react-router-dom'

function AdminNav() {
  const location = useLocation()

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/generate', label: 'Generate' },
    { to: '/admin/issue', label: 'Issue' },
  ]

  return (
    <nav style={{
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #ddd',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ fontWeight: 'bold', color: 'var(--kb-green)', textDecoration: 'none' }}>
        Kinderbucks
      </Link>
      <span style={{ opacity: 0.3 }}>|</span>
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          style={{
            color: location.pathname === link.to ? 'var(--kb-green)' : 'var(--kb-brown)',
            textDecoration: location.pathname === link.to ? 'underline' : 'none',
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

export default AdminNav
