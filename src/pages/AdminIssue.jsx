import { useState, useEffect } from 'react'
import { Send, CheckSquare, Square, Package, CheckCircle } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { getAllKinderbucks, updateKinderbuckStatus } from '../firebase/kinderbucks'

function AdminIssue() {
  const [kinderbucks, setKinderbucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSerials, setSelectedSerials] = useState([])
  const [issueTo, setIssueTo] = useState('')
  const [issuing, setIssuing] = useState(false)
  const [successCount, setSuccessCount] = useState(0)

  const loadKinderbucks = async () => {
    const data = await getAllKinderbucks()
    setKinderbucks(data.filter(kb => kb.status === 'draft' || kb.status === 'issued'))
    setLoading(false)
  }

  useEffect(() => {
    loadKinderbucks()
  }, [])

  const handleSelect = (serial) => {
    setSelectedSerials(prev =>
      prev.includes(serial)
        ? prev.filter(s => s !== serial)
        : [...prev, serial]
    )
  }

  const handleSelectAll = () => {
    const draftSerials = draftBucks.map(kb => kb.serial)
    setSelectedSerials(draftSerials)
  }

  const handleClear = () => {
    setSelectedSerials([])
  }

  const handleIssue = async () => {
    if (selectedSerials.length === 0) return

    setIssuing(true)
    try {
      for (const serial of selectedSerials) {
        await updateKinderbuckStatus(serial, 'issued', issueTo)
      }
      setSuccessCount(selectedSerials.length)
      setSelectedSerials([])
      setIssueTo('')
      await loadKinderbucks()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessCount(0), 3000)
    } catch (err) {
      console.error('Error issuing:', err)
      alert('Error issuing Kinderbucks')
    }
    setIssuing(false)
  }

  const draftBucks = kinderbucks.filter(kb => kb.status === 'draft')
  const issuedBucks = kinderbucks.filter(kb => kb.status === 'issued')

  // Calculate totals
  const selectedValue = selectedSerials.reduce((sum, serial) => {
    const kb = kinderbucks.find(k => k.serial === serial)
    return sum + (kb?.denomination || 0)
  }, 0)

  // Group by denomination
  const groupByDenomination = (bucks) => {
    const groups = { 1: [], 5: [], 10: [], 20: [] }
    bucks.forEach(kb => {
      const denom = kb.denomination || 5
      if (groups[denom]) groups[denom].push(kb)
    })
    return groups
  }

  const draftGroups = groupByDenomination(draftBucks)

  const denominationColors = {
    1: '#27ae60',
    5: '#3498db',
    10: '#9b59b6',
    20: '#c9a227',
  }

  if (loading) {
    return (
      <AdminLayout title="Issue Currency">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Issue Currency">
      {/* Success Toast */}
      {successCount > 0 && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '2rem',
          background: 'var(--kb-green)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}>
          <CheckCircle size={20} />
          <span>Issued {successCount} Kinderbucks successfully!</span>
        </div>
      )}

      {/* Issue Panel */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={20} /> Issue to Circulation
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
              Recipient (optional)
            </label>
            <input
              type="text"
              value={issueTo}
              onChange={e => setIssueTo(e.target.value)}
              placeholder="Business name or exchange point"
              style={{ width: '100%' }}
            />
          </div>
          <button
            className="btn btn-gold"
            onClick={handleIssue}
            disabled={selectedSerials.length === 0 || issuing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}
          >
            <Send size={18} />
            {issuing ? 'Issuing...' : `Issue ${selectedSerials.length} Selected`}
          </button>
        </div>

        {selectedSerials.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'var(--kb-gold)',
            borderRadius: '8px',
            color: 'var(--kb-navy)',
            fontWeight: '500',
          }}>
            Selected: {selectedSerials.length} bills • Total value: ${selectedValue}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-gray-500)' }}>
            {draftBucks.length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Available (Draft)</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-green)' }}>
            {issuedBucks.length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Already Issued</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
            {selectedSerials.length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Selected</div>
        </div>
      </div>

      {/* Draft Kinderbucks */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h3 style={{ color: 'var(--kb-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} /> Available to Issue ({draftBucks.length})
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handleSelectAll} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
              Select All
            </button>
            <button className="btn btn-secondary" onClick={handleClear} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
              Clear
            </button>
          </div>
        </div>

        {draftBucks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
            <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No draft Kinderbucks available.</p>
            <p style={{ fontSize: '0.9rem' }}>Generate some QR codes first.</p>
          </div>
        ) : (
          <div>
            {/* Group by denomination */}
            {[1, 5, 10, 20].map(denom => {
              const group = draftGroups[denom]
              if (group.length === 0) return null

              return (
                <div key={denom} style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: denominationColors[denom],
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}>
                      ${denom}
                    </div>
                    <span style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>
                      ${denom} Bills ({group.length})
                    </span>
                    <button
                      onClick={() => {
                        const groupSerials = group.map(kb => kb.serial)
                        const allSelected = groupSerials.every(s => selectedSerials.includes(s))
                        if (allSelected) {
                          setSelectedSerials(prev => prev.filter(s => !groupSerials.includes(s)))
                        } else {
                          setSelectedSerials(prev => [...new Set([...prev, ...groupSerials])])
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: denominationColors[denom],
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      {group.every(kb => selectedSerials.includes(kb.serial)) ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '0.5rem',
                  }}>
                    {group.map(kb => {
                      const isSelected = selectedSerials.includes(kb.serial)
                      return (
                        <label
                          key={kb.serial}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 0.75rem',
                            background: isSelected ? `${denominationColors[denom]}15` : 'var(--kb-gray-50)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: isSelected ? `2px solid ${denominationColors[denom]}` : '2px solid transparent',
                            transition: 'all 0.15s',
                          }}
                        >
                          {isSelected ? (
                            <CheckSquare size={18} color={denominationColors[denom]} />
                          ) : (
                            <Square size={18} color="var(--kb-gray-400)" />
                          )}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelect(kb.serial)}
                            style={{ display: 'none' }}
                          />
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: isSelected ? denominationColors[denom] : 'var(--kb-gray-600)',
                            fontWeight: isSelected ? '600' : '400',
                          }}>
                            {kb.serial}
                          </span>
                        </label>
                      )
                    })}
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

export default AdminIssue
