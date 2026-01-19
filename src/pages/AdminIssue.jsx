import { useState, useEffect } from 'react'
import AdminNav from '../components/AdminNav'
import { getAllKinderbucks, updateKinderbuckStatus } from '../firebase/kinderbucks'

function AdminIssue() {
  const [kinderbucks, setKinderbucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSerials, setSelectedSerials] = useState([])
  const [issueTo, setIssueTo] = useState('')

  useEffect(() => {
    async function load() {
      const data = await getAllKinderbucks()
      setKinderbucks(data.filter(kb => kb.status === 'draft' || kb.status === 'issued'))
      setLoading(false)
    }
    load()
  }, [])

  const handleSelect = (serial) => {
    setSelectedSerials(prev =>
      prev.includes(serial)
        ? prev.filter(s => s !== serial)
        : [...prev, serial]
    )
  }

  const handleIssue = async () => {
    if (selectedSerials.length === 0) return

    try {
      for (const serial of selectedSerials) {
        await updateKinderbuckStatus(serial, 'issued', issueTo)
      }
      // Refresh list
      const data = await getAllKinderbucks()
      setKinderbucks(data.filter(kb => kb.status === 'draft' || kb.status === 'issued'))
      setSelectedSerials([])
      setIssueTo('')
      alert(`Issued ${selectedSerials.length} Kinderbucks!`)
    } catch (err) {
      console.error('Error issuing:', err)
      alert('Error issuing Kinderbucks')
    }
  }

  const draftBucks = kinderbucks.filter(kb => kb.status === 'draft')

  return (
    <div className="page">
      <AdminNav />
      <h1>Issue Kinderbucks</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Issue Selected</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Issued To (optional)</label>
            <input
              type="text"
              value={issueTo}
              onChange={e => setIssueTo(e.target.value)}
              placeholder="Business or recipient name"
              style={{ padding: '0.5rem', width: '250px' }}
            />
          </div>
          <button
            className="btn"
            onClick={handleIssue}
            disabled={selectedSerials.length === 0}
          >
            Issue {selectedSerials.length} Selected
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Available to Issue ({draftBucks.length} draft)</h2>

        {loading ? (
          <p>Loading...</p>
        ) : draftBucks.length === 0 ? (
          <p>No draft Kinderbucks available. Generate some first!</p>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedSerials(draftBucks.map(kb => kb.serial))}
                style={{ marginRight: '0.5rem' }}
              >
                Select All
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedSerials([])}
              >
                Clear
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '0.5rem'
            }}>
              {draftBucks.map(kb => (
                <label
                  key={kb.serial}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: selectedSerials.includes(kb.serial) ? '#d4edda' : '#f8f9fa',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSerials.includes(kb.serial)}
                    onChange={() => handleSelect(kb.serial)}
                  />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {kb.serial}
                  </span>
                  <span style={{ opacity: 0.7 }}>${kb.denomination}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminIssue
