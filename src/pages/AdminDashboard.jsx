import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllKinderbucks } from '../firebase/kinderbucks'
import AdminNav from '../components/AdminNav'

function AdminDashboard() {
  const [kinderbucks, setKinderbucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: 'all', denomination: 'all' })

  useEffect(() => {
    async function load() {
      const data = await getAllKinderbucks()
      setKinderbucks(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = kinderbucks.filter(kb => {
    if (filter.status !== 'all' && kb.status !== filter.status) return false
    if (filter.denomination !== 'all' && kb.denomination !== Number(filter.denomination)) return false
    return true
  })

  const stats = {
    total: kinderbucks.length,
    issued: kinderbucks.filter(k => k.status === 'issued' || k.status === 'active').length,
    totalValue: kinderbucks.reduce((sum, k) => sum + (k.denomination || 0), 0),
  }

  return (
    <div className="page">
      <AdminNav />
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="card">
          <h3>Total Kinderbucks</h3>
          <p style={{ fontSize: '2rem', color: 'var(--kb-green)' }}>{stats.total}</p>
        </div>
        <div className="card">
          <h3>In Circulation</h3>
          <p style={{ fontSize: '2rem', color: 'var(--kb-green)' }}>{stats.issued}</p>
        </div>
        <div className="card">
          <h3>Total Value</h3>
          <p style={{ fontSize: '2rem', color: 'var(--kb-gold)' }}>${stats.totalValue}</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <select
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            style={{ padding: '0.5rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="active">Active</option>
            <option value="redeemed">Redeemed</option>
            <option value="retired">Retired</option>
          </select>
          <select
            value={filter.denomination}
            onChange={e => setFilter(f => ({ ...f, denomination: e.target.value }))}
            style={{ padding: '0.5rem' }}
          >
            <option value="all">All Denominations</option>
            <option value="1">$1</option>
            <option value="5">$5</option>
            <option value="10">$10</option>
            <option value="20">$20</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No Kinderbucks found. <Link to="/admin/generate">Generate some!</Link></p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--kb-green)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Serial</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Denomination</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Scans</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(kb => (
                <tr key={kb.serial} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{kb.serial}</td>
                  <td style={{ padding: '0.5rem' }}>${kb.denomination}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      background: kb.status === 'active' ? '#d4edda' :
                                  kb.status === 'draft' ? '#f8f9fa' : '#fff3cd'
                    }}>
                      {kb.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>{kb.scanCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > 50 && <p style={{ marginTop: '1rem', opacity: 0.7 }}>Showing 50 of {filtered.length}</p>}
      </div>
    </div>
  )
}

export default AdminDashboard
