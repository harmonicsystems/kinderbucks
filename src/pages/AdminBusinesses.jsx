import { useState, useEffect } from 'react'
import { getAllBusinesses, createBusiness, toggleBusinessActive } from '../firebase/businesses'
import AdminNav from '../components/AdminNav'
import QRCode from '../components/QRCode'

// Real Kinderhook businesses to seed
const SEED_BUSINESSES = [
  { code: "AVIARY", name: "The Aviary", category: "food" },
  { code: "MORNINGBIRD", name: "Morningbird Cafe", category: "food" },
  { code: "SAISONNIER", name: "Saisonnier", category: "food" },
  { code: "BROADST-BAGEL", name: "Broad Street Bagel Co.", category: "food" },
  { code: "BROOKLYN-PIZZA", name: "The Brooklyn Pizzeria", category: "food" },
  { code: "ISOLA", name: "Isola Wine Bar", category: "food" },
  { code: "HAMRAHS", name: "Hamrah's Lebanese Foods", category: "food" },
  { code: "OK-PANTRY", name: "OK Pantry", category: "retail" },
  { code: "BOTTLE-SHOP", name: "Kinderhook Bottle Shop", category: "retail" },
  { code: "BOOKS", name: "Kinderhook Books", category: "retail" },
  { code: "SAMASCOTTS", name: "Samascott's Garden Market", category: "retail" },
  { code: "SCHOOL-GALLERY", name: "The School | Jack Shainman Gallery", category: "arts" },
  { code: "SEPTEMBER", name: "September Gallery", category: "arts" },
  { code: "OLD-DUTCH", name: "Old Dutch Inn", category: "services" },
  { code: "MUSE", name: "Muse Aesthetics", category: "services" },
  { code: "PILATES", name: "Julia Jayne Pilates", category: "services" },
  { code: "SIENA", name: "Siena Private Wealth", category: "services" },
  { code: "COMMUNITY-BANK", name: "Community Bank NA", category: "services" },
  { code: "HISTORICAL", name: "Columbia County Historical Society", category: "arts" }
]

const CATEGORIES = [
  { value: 'food', label: 'Food & Drink', emoji: '🍽️' },
  { value: 'retail', label: 'Retail', emoji: '🛍️' },
  { value: 'services', label: 'Services', emoji: '💼' },
  { value: 'arts', label: 'Arts & Culture', emoji: '🎨' }
]

function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', name: '', category: 'food' })
  const [saving, setSaving] = useState(false)
  const [showQR, setShowQR] = useState(null)
  const [seeding, setSeeding] = useState(false)

  const loadBusinesses = async () => {
    const data = await getAllBusinesses()
    setBusinesses(data)
    setLoading(false)
  }

  useEffect(() => {
    loadBusinesses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code || !form.name) return

    setSaving(true)
    try {
      await createBusiness(form.code.toUpperCase(), form.name, form.category)
      setForm({ code: '', name: '', category: 'food' })
      await loadBusinesses()
    } catch (err) {
      console.error('Error creating business:', err)
      alert('Error creating business')
    }
    setSaving(false)
  }

  const handleToggleActive = async (code, currentStatus) => {
    await toggleBusinessActive(code, !currentStatus)
    await loadBusinesses()
  }

  const handleSeedBusinesses = async () => {
    if (!confirm('This will add all Kinderhook businesses. Continue?')) return

    setSeeding(true)
    try {
      for (const biz of SEED_BUSINESSES) {
        // Check if already exists
        const exists = businesses.find(b => b.code === biz.code)
        if (!exists) {
          await createBusiness(biz.code, biz.name, biz.category)
        }
      }
      await loadBusinesses()
      alert('Businesses seeded successfully!')
    } catch (err) {
      console.error('Error seeding:', err)
      alert('Error seeding businesses')
    }
    setSeeding(false)
  }

  const baseUrl = 'https://harmonicsystems.github.io/kinderbucks/#/checkin/'

  const getCategoryEmoji = (cat) => {
    const found = CATEGORIES.find(c => c.value === cat)
    return found ? found.emoji : '📍'
  }

  return (
    <div className="page">
      <AdminNav />
      <h1>Business Directory</h1>

      {/* Add Business Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Add Business</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Code</label>
            <input
              type="text"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') }))}
              placeholder="CAFE-01"
              style={{ padding: '0.5rem', width: '120px', fontFamily: 'monospace' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Village Café"
              style={{ padding: '0.5rem', width: '200px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ padding: '0.5rem' }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn" disabled={saving || !form.code || !form.name}>
            {saving ? 'Adding...' : 'Add Business'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSeedBusinesses}
            disabled={seeding}
          >
            {seeding ? 'Seeding...' : 'Seed All Kinderhook'}
          </button>
        </form>
      </div>

      {/* Business List */}
      <div className="card">
        <h2>Participating Businesses ({businesses.length})</h2>

        {loading ? (
          <p>Loading...</p>
        ) : businesses.length === 0 ? (
          <p>No businesses yet. Add one above or click "Seed All Kinderhook"!</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {businesses.map(biz => (
              <div
                key={biz.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: biz.isActive ? '#f8fff8' : '#f5f5f5',
                  borderRadius: '8px',
                  border: `1px solid ${biz.isActive ? '#d4edda' : '#ddd'}`,
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>{getCategoryEmoji(biz.category)}</div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <div style={{ fontWeight: 'bold', color: biz.isActive ? '#2c3e50' : '#888' }}>
                    {biz.name}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#888' }}>
                    {biz.code}
                  </div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a5f2a' }}>
                    {biz.checkinCount || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>check-ins</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowQR(showQR === biz.code ? null : biz.code)}
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                  >
                    {showQR === biz.code ? 'Hide QR' : 'Show QR'}
                  </button>
                  <button
                    className="btn"
                    onClick={() => handleToggleActive(biz.code, biz.isActive)}
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.4rem 0.8rem',
                      background: biz.isActive ? '#e74c3c' : '#27ae60'
                    }}
                  >
                    {biz.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>

                {/* QR Code Dropdown */}
                {showQR === biz.code && (
                  <div style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <QRCode
                      value={`${baseUrl}${biz.code}`}
                      size={150}
                      denomination={5}
                      showFrame={false}
                    />
                    <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '0.5rem', color: '#888', wordBreak: 'break-all' }}>
                      {baseUrl}{biz.code}
                    </p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(`${baseUrl}${biz.code}`)
                        alert('URL copied!')
                      }}
                      style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}
                    >
                      Copy URL
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBusinesses
