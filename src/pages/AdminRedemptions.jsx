import { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  Store,
  DollarSign
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { getAllRedemptions, processRedemption } from '../firebase/transactions'
import { useAuth } from '../contexts/AuthContext'

function AdminRedemptions() {
  const { user } = useAuth()
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processing, setProcessing] = useState(null)

  const loadRedemptions = async () => {
    try {
      const data = await getAllRedemptions()
      setRedemptions(data)
      setLoading(false)
    } catch (err) {
      console.error('Error loading redemptions:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRedemptions()
  }, [])

  const handleProcess = async (txnId, approved) => {
    setProcessing(txnId)
    try {
      await processRedemption(txnId, approved, user.uid)
      await loadRedemptions()
    } catch (err) {
      console.error('Error processing redemption:', err)
      alert('Error processing redemption: ' + err.message)
    }
    setProcessing(null)
  }

  const filtered = filter === 'all'
    ? redemptions
    : redemptions.filter(r => r.status === filter)

  const stats = {
    total: redemptions.length,
    pending: redemptions.filter(r => r.status === 'pending').length,
    approved: redemptions.filter(r => r.status === 'approved').length,
    rejected: redemptions.filter(r => r.status === 'rejected').length,
    totalValue: redemptions.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.amount || 0), 0),
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={18} color="var(--kb-green)" />
      case 'pending': return <Clock size={18} color="#e67e22" />
      case 'rejected': return <XCircle size={18} color="#e74c3c" />
      default: return <AlertCircle size={18} color="var(--kb-gray-400)" />
    }
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'approved': return { background: '#d4edda', color: 'var(--kb-green)' }
      case 'pending': return { background: '#fff3cd', color: '#856404' }
      case 'rejected': return { background: '#f8d7da', color: '#721c24' }
      default: return { background: '#f8f9fa', color: 'var(--kb-gray-600)' }
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Redemption Requests">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading redemptions...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Redemption Requests">
      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#e67e22' }}>
            {stats.pending}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Pending</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-green)' }}>
            {stats.approved}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Approved</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#e74c3c' }}>
            {stats.rejected}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Rejected</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-gold-dark)' }}>
            ${stats.totalValue.toFixed(0)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Total Redeemed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {[
          { value: 'all', label: `All (${stats.total})` },
          { value: 'pending', label: `Pending (${stats.pending})` },
          { value: 'approved', label: `Approved (${stats.approved})` },
          { value: 'rejected', label: `Rejected (${stats.rejected})` },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={filter === tab.value ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '0.5rem 1rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Redemption List */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
            <Banknote size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No {filter !== 'all' ? filter : ''} redemption requests</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 150px',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderBottom: '2px solid var(--kb-navy)',
              fontWeight: '600',
              color: 'var(--kb-navy)',
              fontSize: '0.85rem',
            }}>
              <div>Date</div>
              <div>Business</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* Rows */}
            {filtered.map(redemption => (
              <div
                key={redemption.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 150px',
                  gap: '1rem',
                  padding: '1rem',
                  borderBottom: '1px solid var(--kb-gray-100)',
                  alignItems: 'center',
                  background: redemption.status === 'pending' ? 'rgba(230, 126, 34, 0.05)' : 'transparent',
                }}
              >
                {/* Date */}
                <div>
                  <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                    {redemption.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                    {redemption.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                  </div>
                </div>

                {/* Business */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Store size={18} color="var(--kb-gray-400)" />
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                      {redemption.businessName || redemption.businessCode}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                      {redemption.businessCode}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="var(--kb-gold-dark)" />
                  <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--kb-navy)' }}>
                    ${redemption.amount?.toFixed(2)}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className="badge"
                    style={{
                      ...getStatusBadgeStyle(redemption.status),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {getStatusIcon(redemption.status)}
                    {redemption.status}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {redemption.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleProcess(redemption.id, true)}
                        disabled={processing === redemption.id}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {processing === redemption.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleProcess(redemption.id, false)}
                        disabled={processing === redemption.id}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {redemption.status === 'approved' && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                      Processed
                    </span>
                  )}
                  {redemption.status === 'rejected' && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminRedemptions
