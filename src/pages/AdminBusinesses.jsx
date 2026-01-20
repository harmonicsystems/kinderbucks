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
  Eye,
  Trash2,
  Search,
  RotateCcw,
  AlertTriangle,
  Camera,
  Archive,
  X,
  Check
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import {
  getAllBusinesses,
  getDeletedBusinesses,
  createBusiness,
  toggleBusinessActive,
  deleteBusiness,
  restoreBusiness,
  getBusinessDeletionInfo,
  updateBusinessPhoto
} from '../firebase/businesses'
import QRCode from '../components/QRCode'
import PlacesAutocomplete from '../components/PlacesAutocomplete'

// Real Kinderhook businesses to seed (verified addresses)
const SEED_BUSINESSES = [
  // Food & Drink
  { code: "AVIARY", name: "The Aviary", category: "food" },
  { code: "MORNINGBIRD", name: "Morningbird Cafe", category: "food" },
  { code: "SAISONNIER", name: "Saisonnier", category: "food" },
  { code: "BROADST-BAGEL", name: "Broad Street Bagel Co.", category: "food" },
  { code: "ISOLA", name: "Isola Wine Bar", category: "food" },
  { code: "BOTTLE-SHOP", name: "Kinderhook Bottle Shop", category: "retail" },
  // Retail & Farm
  { code: "SAMASCOTTS", name: "Samascott's Garden Market", category: "retail" },
  { code: "SAMASCOTT-ORCHARDS", name: "Samascott Orchards", category: "retail" },
  // Arts & Culture
  { code: "SCHOOL-GALLERY", name: "The School | Jack Shainman Gallery", category: "arts" },
  // Services & Lodging
    { code: "FEED-SEED", name: "The Feed and Seed", category: "services" },
  { code: "OLD-DUTCH", name: "The Old Dutch Inn", category: "services" },
  { code: "VILLAGE-YOGA", name: "Village Yoga", category: "services" },
  { code: "WALSH-DENTISTRY", name: "Walsh & Walsh Dentistry", category: "services" },
]

const CATEGORIES = {
  food: { label: 'Food & Drink', Icon: UtensilsCrossed, color: '#e74c3c' },
  retail: { label: 'Retail', Icon: ShoppingBag, color: '#9b59b6' },
  services: { label: 'Services', Icon: Briefcase, color: '#3498db' },
  arts: { label: 'Arts & Culture', Icon: Palette, color: '#1abc9c' },
}

function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [deletedBusinesses, setDeletedBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', name: '', category: 'food', address: '', placeId: '', photoUrl: '', website: '' })
  const [saving, setSaving] = useState(false)
  const [showQR, setShowQR] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null) // { code, name, info }
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [fetchingPhoto, setFetchingPhoto] = useState(null) // business code being fetched

  const loadBusinesses = async () => {
    const [active, deleted] = await Promise.all([
      getAllBusinesses(),
      getDeletedBusinesses()
    ])
    setBusinesses(active)
    setDeletedBusinesses(deleted)
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
      await createBusiness(form.code.toUpperCase(), form.name, form.category, {
        address: form.address,
        placeId: form.placeId,
        photoUrl: form.photoUrl,
        website: form.website
      })
      setForm({ code: '', name: '', category: 'food', address: '', placeId: '', photoUrl: '', website: '' })
      await loadBusinesses()
    } catch (err) {
      console.error('Error creating business:', err)
      alert('Error creating business')
    }
    setSaving(false)
  }

  const handlePlaceSelect = (place) => {
    setForm({
      code: place.code,
      name: place.name,
      category: place.category,
      address: place.address || '',
      placeId: place.placeId || '',
      photoUrl: place.photoUrl || '',
      website: place.website || ''
    })
  }

  const handleDeleteClick = async (code, name) => {
    // Get deletion info first
    const info = await getBusinessDeletionInfo(code)
    setDeleteModal({ code, name, info })
    setDeleteConfirmText('')
  }

  const handleConfirmDelete = async (force = false) => {
    if (!deleteModal) return

    setDeleting(true)
    try {
      await deleteBusiness(deleteModal.code, null, force)
      setDeleteModal(null)
      setDeleteConfirmText('')
      await loadBusinesses()
    } catch (err) {
      console.error('Error deleting business:', err)
      alert(err.message || 'Error deleting business')
    }
    setDeleting(false)
  }

  const handleRestore = async (code) => {
    try {
      await restoreBusiness(code)
      await loadBusinesses()
    } catch (err) {
      console.error('Error restoring business:', err)
      alert('Error restoring business')
    }
  }

  const handleFetchPhoto = async (biz) => {
    if (!window.google?.maps?.places) {
      alert('Google Maps not loaded. Please refresh the page.')
      return
    }

    setFetchingPhoto(biz.code)

    try {
      // Create Places service
      const dummyDiv = document.createElement('div')
      const service = new window.google.maps.places.PlacesService(dummyDiv)

      // Search for the business
      const searchQuery = biz.placeId
        ? { placeId: biz.placeId, fields: ['photos'] }
        : { query: `${biz.name} ${biz.address || 'Kinderhook NY'}`, fields: ['photos', 'place_id'] }

      const getDetails = (request) => {
        return new Promise((resolve, reject) => {
          if (request.placeId) {
            service.getDetails(request, (place, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve(place)
              } else {
                reject(new Error('Place not found'))
              }
            })
          } else {
            service.findPlaceFromQuery(
              { query: request.query, fields: ['photos', 'place_id'] },
              (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
                  resolve(results[0])
                } else {
                  reject(new Error('Place not found'))
                }
              }
            )
          }
        })
      }

      const place = await getDetails(searchQuery)

      if (place.photos && place.photos.length > 0) {
        const photoUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })
        await updateBusinessPhoto(biz.code, photoUrl)
        await loadBusinesses()
      } else {
        alert('No photos found for this business on Google Places')
      }
    } catch (err) {
      console.error('Error fetching photo:', err)
      alert('Could not fetch photo. Try searching for the business manually.')
    }

    setFetchingPhoto(null)
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

        {/* Google Places Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
            <Search size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Search Google Places
          </label>
          <PlacesAutocomplete
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search for a business by name..."
          />
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
            Search to auto-fill details, or enter manually below
          </p>
        </div>

        {/* Photo Preview */}
        {form.photoUrl && (
          <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--kb-gray-50)',
            borderRadius: '8px',
          }}>
            <img
              src={form.photoUrl}
              alt={form.name}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            <div>
              <div style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>{form.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>{form.address}</div>
              {form.website && (
                <a href={form.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--kb-gold-dark)' }}>
                  {form.website}
                </a>
              )}
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--kb-gray-200)', paddingTop: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
                  Code *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') }))}
                  placeholder="CAFE-01"
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Village Café"
                  style={{ width: '100%' }}
                  required
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
                Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="123 Main Street, Kinderhook, NY 12106"
                style={{ width: '100%' }}
              />
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
                      {biz.photoUrl ? (
                        <img
                          src={biz.photoUrl}
                          alt={biz.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                          }}
                        />
                      ) : (
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
                      )}
                      <div>
                        <div style={{ fontWeight: '600', color: biz.isActive ? 'var(--kb-navy)' : 'var(--kb-gray-500)', fontSize: '1.1rem' }}>
                          {biz.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                            {biz.code}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: cat.color }}>
                            {cat.label}
                          </span>
                          {biz.address && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--kb-gray-400)' }}>
                              {biz.address.split(',')[0]}
                            </span>
                          )}
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
                        <button
                          onClick={() => handleFetchPhoto(biz)}
                          className="btn"
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: biz.photoUrl ? 'var(--kb-gray-100)' : 'rgba(201, 162, 39, 0.1)',
                            color: biz.photoUrl ? 'var(--kb-gray-500)' : 'var(--kb-gold-dark)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title={biz.photoUrl ? 'Refresh photo' : 'Fetch photo from Google'}
                          disabled={fetchingPhoto === biz.code}
                        >
                          <Camera size={16} className={fetchingPhoto === biz.code ? 'animate-pulse' : ''} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(biz.code, biz.name)}
                          className="btn"
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'var(--kb-gray-100)',
                            color: 'var(--kb-gray-600)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Delete business"
                        >
                          <Trash2 size={16} />
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

      {/* Deleted Businesses Section */}
      {deletedBusinesses.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <h3 style={{ color: 'var(--kb-gray-500)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Archive size={20} /> Deleted Businesses ({deletedBusinesses.length})
            </h3>
            <span style={{ color: 'var(--kb-gray-400)' }}>{showDeleted ? '▲' : '▼'}</span>
          </button>

          {showDeleted && (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {deletedBusinesses.map(biz => (
                <div
                  key={biz.code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--kb-gray-50)',
                    borderRadius: '8px',
                    opacity: 0.7,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--kb-gray-600)' }}>{biz.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-400)' }}>
                      {biz.code} • Deleted {biz.deletedAt?.toDate ? biz.deletedAt.toDate().toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(biz.code)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <RotateCcw size={16} /> Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: deleteModal.info?.hasData ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {deleteModal.info?.hasData ? (
                  <AlertTriangle size={24} color="#e74c3c" />
                ) : (
                  <Trash2 size={24} color="var(--kb-green)" />
                )}
              </div>
              <div>
                <h3 style={{ color: 'var(--kb-navy)', margin: 0 }}>Delete {deleteModal.name}?</h3>
                <p style={{ color: 'var(--kb-gray-500)', margin: 0, fontSize: '0.9rem' }}>
                  {deleteModal.info?.hasData ? 'This business has associated data' : 'This business can be safely deleted'}
                </p>
              </div>
            </div>

            {deleteModal.info?.hasData && (
              <div style={{
                background: 'rgba(231, 76, 60, 0.05)',
                border: '1px solid rgba(231, 76, 60, 0.2)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ fontWeight: '600', color: '#c0392b', marginBottom: '0.5rem' }}>
                  Associated Data Found:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--kb-gray-600)' }}>
                  {deleteModal.info.checkinCount > 0 && (
                    <li>{deleteModal.info.checkinCount} check-ins recorded</li>
                  )}
                  {deleteModal.info.transactionCount > 0 && (
                    <li>{deleteModal.info.transactionCount} transactions</li>
                  )}
                  {deleteModal.info.balance > 0 && (
                    <li>${deleteModal.info.balance.toFixed(2)} Kinderbucks balance</li>
                  )}
                </ul>
                <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                  The business will be soft-deleted and can be restored later.
                </p>
              </div>
            )}

            {deleteModal.info?.hasData && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
                  Type "{deleteModal.name}" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder={deleteModal.name}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setDeleteModal(null); setDeleteConfirmText(''); }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              {deleteModal.info?.hasData ? (
                <button
                  onClick={() => handleConfirmDelete(true)}
                  className="btn"
                  style={{ background: '#e74c3c', color: 'white' }}
                  disabled={deleteConfirmText !== deleteModal.name || deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Anyway'}
                </button>
              ) : (
                <button
                  onClick={() => handleConfirmDelete(false)}
                  className="btn"
                  style={{ background: '#e74c3c', color: 'white' }}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminBusinesses
