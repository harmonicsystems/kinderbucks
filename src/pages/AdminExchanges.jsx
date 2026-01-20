import { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRightLeft,
  Target,
  Star,
  Award,
  Crown
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const TIER_ICONS = {
  curious: Target,
  hooked: Star,
  lineAndSinker: Award,
  patron: Crown,
}

function AdminExchanges() {
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processing, setProcessing] = useState(null)

  const loadExchanges = async () => {
    try {
      const q = query(collection(db, 'exchanges'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      setExchanges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    } catch (err) {
      console.error('Error loading exchanges:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExchanges()
  }, [])

  const handleUpdateStatus = async (exchangeId, newStatus) => {
    setProcessing(exchangeId)
    try {
      await updateDoc(doc(db, 'exchanges', exchangeId), {
        status: newStatus,
        processedAt: serverTimestamp(),
      })
      await loadExchanges()
    } catch (err) {
      console.error('Error updating exchange:', err)
      alert('Error updating exchange status')
    }
    setProcessing(null)
  }

  const filtered = filter === 'all'
    ? exchanges
    : exchanges.filter(ex => ex.status === filter)

  const stats = {
    total: exchanges.length,
    pending: exchanges.filter(ex => ex.status === 'pending').length,
    completed: exchanges.filter(ex => ex.status === 'completed').length,
    cancelled: exchanges.filter(ex => ex.status === 'cancelled').length,
    totalValue: exchanges.filter(ex => ex.status === 'completed').reduce((sum, ex) => sum + (ex.kinderbucksAmount || 0), 0),
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={18} color="var(--kb-green)" />
      case 'pending': return <Clock size={18} color="#e67e22" />
      case 'cancelled': return <XCircle size={18} color="#e74c3c" />
      default: return <AlertCircle size={18} color="var(--kb-gray-400)" />
    }
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'completed': return { background: '#d4edda', color: 'var(--kb-green)' }
      case 'pending': return { background: '#fff3cd', color: '#856404' }
      case 'cancelled': return { background: '#f8d7da', color: '#721c24' }
      default: return { background: '#f8f9fa', color: 'var(--kb-gray-600)' }
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Exchange Management">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading exchanges...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Exchange Management">
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
            {stats.completed}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Completed</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-gold-dark)' }}>
            ${stats.totalValue.toFixed(0)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Total Exchanged</div>
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
          { value: 'completed', label: `Completed (${stats.completed})` },
          { value: 'cancelled', label: `Cancelled (${stats.cancelled})` },
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

      {/* Exchange List */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
            <ArrowRightLeft size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No {filter !== 'all' ? filter : ''} exchanges found</p>
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
              <div>Amount</div>
              <div>Tier & Bonus</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* Rows */}
            {filtered.map(ex => {
              const TierIcon = TIER_ICONS[ex.tier] || Target
              return (
                <div
                  key={ex.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr 150px',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: '1px solid var(--kb-gray-100)',
                    alignItems: 'center',
                    background: ex.status === 'pending' ? 'rgba(230, 126, 34, 0.05)' : 'transparent',
                  }}
                >
                  {/* Date */}
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                      {ex.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>
                      {ex.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>
                      ${ex.usdAmount} USD
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--kb-gold-dark)' }}>
                      → ${ex.kinderbucksAmount?.toFixed(2)} KB
                    </div>
                  </div>

                  {/* Tier */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TierIcon size={18} color="var(--kb-gray-500)" />
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--kb-gray-700)', textTransform: 'capitalize' }}>
                        {ex.tier || 'curious'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--kb-green)' }}>
                        +{Math.round((ex.bonusRate || 0.1) * 100)}% bonus
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className="badge"
                      style={{
                        ...getStatusBadgeStyle(ex.status),
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      {getStatusIcon(ex.status)}
                      {ex.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {ex.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ex.id, 'completed')}
                          disabled={processing === ex.id}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          {processing === ex.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ex.id, 'cancelled')}
                          disabled={processing === ex.id}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {ex.status === 'completed' && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                        Processed
                      </span>
                    )}
                    {ex.status === 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(ex.id, 'pending')}
                        disabled={processing === ex.id}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminExchanges
