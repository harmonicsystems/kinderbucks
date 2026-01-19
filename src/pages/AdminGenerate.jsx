import { useState } from 'react'
import AdminNav from '../components/AdminNav'
import QRCode from '../components/QRCode'
import { createKinderbucks } from '../firebase/kinderbucks'

function AdminGenerate() {
  const [range, setRange] = useState({ start: 1, end: 100 })
  const [denomination, setDenomination] = useState(5)
  const [generated, setGenerated] = useState([])
  const [generating, setGenerating] = useState(false)
  const [saved, setSaved] = useState(false)

  const generateSerials = () => {
    const serials = []
    for (let i = range.start; i <= range.end; i++) {
      serials.push(`KB-${String(i).padStart(4, '0')}`)
    }
    setGenerated(serials)
    setSaved(false)
  }

  const saveToFirebase = async () => {
    setGenerating(true)
    try {
      await createKinderbucks(generated, denomination)
      setSaved(true)
    } catch (err) {
      console.error('Error saving:', err)
      alert('Error saving to database')
    }
    setGenerating(false)
  }

  const baseUrl = 'https://harmonicsystems.github.io/kinderbucks/#/scan/'

  return (
    <div className="page">
      <AdminNav />
      <h1>Generate QR Codes</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Settings</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Start Number</label>
            <input
              type="number"
              value={range.start}
              onChange={e => setRange(r => ({ ...r, start: Number(e.target.value) }))}
              style={{ padding: '0.5rem', width: '100px' }}
              min={1}
              max={2000}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>End Number</label>
            <input
              type="number"
              value={range.end}
              onChange={e => setRange(r => ({ ...r, end: Number(e.target.value) }))}
              style={{ padding: '0.5rem', width: '100px' }}
              min={1}
              max={2000}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Denomination</label>
            <select
              value={denomination}
              onChange={e => setDenomination(Number(e.target.value))}
              style={{ padding: '0.5rem' }}
            >
              <option value={1}>$1</option>
              <option value={5}>$5</option>
              <option value={10}>$10</option>
              <option value={20}>$20</option>
            </select>
          </div>
          <button className="btn" onClick={generateSerials}>
            Generate {range.end - range.start + 1} Codes
          </button>
        </div>
      </div>

      {generated.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Generated: {generated.length} Kinderbucks (${denomination} each)</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!saved && (
                <button
                  className="btn"
                  onClick={saveToFirebase}
                  disabled={generating}
                >
                  {generating ? 'Saving...' : 'Save to Database'}
                </button>
              )}
              {saved && <span style={{ color: 'var(--kb-green)' }}>Saved!</span>}
              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
              >
                Print
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {generated.slice(0, 50).map(serial => (
              <div key={serial} style={{ textAlign: 'center' }}>
                <QRCode value={`${baseUrl}${serial}`} size={120} denomination={denomination} />
                <p style={{ fontFamily: 'monospace', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  {serial}
                </p>
              </div>
            ))}
          </div>
          {generated.length > 50 && (
            <p style={{ marginTop: '1rem', opacity: 0.7 }}>
              Showing 50 of {generated.length}. All will be saved and printable.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminGenerate
