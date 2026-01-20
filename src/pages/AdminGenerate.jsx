import { useState } from 'react'
import { QrCode, Save, Printer, CheckCircle } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
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

  const denominationColors = {
    1: { bg: 'rgba(39, 174, 96, 0.1)', text: 'var(--kb-green)' },
    5: { bg: 'rgba(52, 152, 219, 0.1)', text: '#3498db' },
    10: { bg: 'rgba(155, 89, 182, 0.1)', text: '#9b59b6' },
    20: { bg: 'rgba(201, 162, 39, 0.1)', text: 'var(--kb-gold-dark)' },
  }

  return (
    <AdminLayout title="Generate QR Codes">
      {/* Settings Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <QrCode size={20} /> Generation Settings
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
              Start Number
            </label>
            <input
              type="number"
              value={range.start}
              onChange={e => setRange(r => ({ ...r, start: Number(e.target.value) }))}
              min={1}
              max={9999}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
              End Number
            </label>
            <input
              type="number"
              value={range.end}
              onChange={e => setRange(r => ({ ...r, end: Number(e.target.value) }))}
              min={1}
              max={9999}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
              Denomination
            </label>
            <select
              value={denomination}
              onChange={e => setDenomination(Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value={1}>$1</option>
              <option value={5}>$5</option>
              <option value={10}>$10</option>
              <option value={20}>$20</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={generateSerials} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={18} /> Generate {range.end - range.start + 1} Codes
          </button>

          <div style={{
            padding: '0.75rem 1rem',
            background: denominationColors[denomination].bg,
            borderRadius: '8px',
            color: denominationColors[denomination].text,
            fontWeight: '600',
          }}>
            Total Value: ${(range.end - range.start + 1) * denomination}
          </div>
        </div>
      </div>

      {/* Generated Codes */}
      {generated.length > 0 && (
        <div className="card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h3 style={{ color: 'var(--kb-navy)', margin: 0 }}>
                Generated: {generated.length} Kinderbucks
              </h3>
              <p style={{ color: 'var(--kb-gray-500)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                ${denomination} denomination • Total value: ${generated.length * denomination}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {!saved ? (
                <button
                  className="btn btn-gold"
                  onClick={saveToFirebase}
                  disabled={generating}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} />
                  {generating ? 'Saving...' : 'Save to Database'}
                </button>
              ) : (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--kb-green)',
                  fontWeight: '600',
                }}>
                  <CheckCircle size={18} /> Saved!
                </span>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Printer size={18} /> Print
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.5rem',
          }}>
            {generated.slice(0, 50).map(serial => (
              <div
                key={serial}
                style={{
                  background: 'var(--kb-white)',
                  border: '1px solid var(--kb-gray-200)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <QRCode value={`${baseUrl}${serial}`} size={140} denomination={denomination} />
                <p style={{
                  fontFamily: 'monospace',
                  marginTop: '0.75rem',
                  fontSize: '0.9rem',
                  color: 'var(--kb-navy)',
                  fontWeight: '600',
                }}>
                  {serial}
                </p>
              </div>
            ))}
          </div>

          {generated.length > 50 && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--kb-gray-50)',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'var(--kb-gray-600)',
            }}>
              Showing 50 of {generated.length} codes. All will be saved and printable.
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {generated.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <QrCode size={64} color="var(--kb-gray-300)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--kb-gray-500)', marginBottom: '0.5rem' }}>No codes generated yet</h3>
          <p style={{ color: 'var(--kb-gray-400)' }}>
            Set your range and denomination above, then click Generate.
          </p>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminGenerate
