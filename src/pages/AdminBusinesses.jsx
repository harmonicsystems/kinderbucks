import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  Plus,
  QrCode,
  Copy,
  ToggleLeft,
  ToggleRight,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Palette,
  TrendingUp,
  Download,
  Eye
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { getAllBusinesses, createBusiness, toggleBusinessActive } from '../firebase/businesses'
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
  { code: "HISTORICAL", name: "Columbia County Historical Society", category: "arts" }
]

const CATEGORIES = {
  food: { label: 'Food & Drink', Icon: UtensilsCrossed, color: '#e74c3c' },
  retail: { label: 'Retail', Icon: ShoppingBag, color: '#9b59b6' },
  services: { label: 'Services', Icon: Briefcase, color: '#3498db' },
  arts: { label: 'Arts & Culture', Icon: Palette, color: '#1abc9c' },
}

function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', name: '', category: 'food' })
  const [saving, setSaving] = useState(false)
  const [showQR, setShowQR] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(null)

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

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const baseUrl = 'https://harmonicsystems.github.io/kinderbucks/#/checkin/'

  const stats = {
    total: businesses.length,
    active: businesses.filter(b => b.isActive).length,
    totalCheckins: businesses.reduce((sum, b) => sum + (b.checkinCount || 0), 0),
  }

  if (loading) {
    return (
      <AdminLayout title="Business Directory">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Business Directory">
      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Total Businesses</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-green)' }}>
            {stats.active}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Active</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-gold-dark)' }}>
            {stats.totalCheckins}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Total Check-ins</div>
        </div>
      </div>

      {/* Add Business Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Add Business
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
                Code
              </label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') }))}
                placeholder="CAFE-01"
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Village Café"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: '100%' }}
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving || !form.code || !form.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> {saving ? 'Adding...' : 'Add Business'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSeedBusinesses}
              disabled={seeding}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={18} /> {seeding ? 'Seeding...' : 'Seed Kinderhook Businesses'}
            </button>
          </div>
        </form>
      </div>

      {/* Business List */}
      <div className="card">
        <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Store size={20} /> Participating Businesses ({businesses.length})
        </h3>

        {businesses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
            <Store size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No businesses yet. Add one above or seed the Kinderhook businesses.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {businesses.map(biz => {
              const cat = CATEGORIES[biz.category] || CATEGORIES.services
              const CatIcon = cat.Icon
              const checkinUrl = `${baseUrl}${biz.code}`

              return (
                <div
                  key={biz.code}
                  style={{
                    background: biz.isActive ? 'var(--kb-white)' : 'var(--kb-gray-50)',
                    border: `1px solid ${biz.isActive ? 'var(--kb-gray-200)' : 'var(--kb-gray-200)'}`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                    opacity: biz.isActive ? 1 : 0.7,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: `${cat.color}15`,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CatIcon size={24} color={cat.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: biz.isActive ? 'var(--kb-navy)' : 'var(--kb-gray-500)', fontSize: '1.1rem' }}>
                          {biz.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                            {biz.code}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: cat.color }}>
                            {cat.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      {/* Check-ins count */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--kb-green)', fontWeight: '600' }}>
                          <TrendingUp size={16} />
                          {biz.checkinCount || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--kb-gray-500)' }}>check-ins</div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/admin/businesses/${biz.code}`}
                          className="btn btn-gold"
                          style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Eye size={16} /> Details
                        </Link>
                        <button
                          onClick={() => setShowQR(showQR === biz.code ? null : biz.code)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(biz.code, biz.isActive)}
                          className="btn"
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: biz.isActive ? '#e74c3c' : 'var(--kb-green)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          {biz.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {biz.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Dropdown */}
                  {showQR === biz.code && (
                    <div style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid var(--kb-gray-200)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2rem',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <QRCode
                          value={checkinUrl}
                          size={150}
                          denomination={5}
                          showFrame={false}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontSize: '0.85rem' }}>
                          Check-in URL
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={checkinUrl}
                            readOnly
                            style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                          />
                          <button
                            onClick={() => copyUrl(checkinUrl)}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Copy size={16} />
                            {copiedUrl === checkinUrl ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                          Print this QR code and display it at the counter for customers to scan when they visit.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminBusinesses
