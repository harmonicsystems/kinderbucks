import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  QrCode,
  Download,
  Camera
} from 'lucide-react'
import { getAllLandmarks, createLandmark, updateLandmark, deleteLandmark, LANDMARK_CATEGORIES } from '../firebase/landmarks'
import AdminLayout from '../components/AdminLayout'
import QRCode from '../components/QRCode'

function AdminLandmarks() {
  const [landmarks, setLandmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLandmark, setEditingLandmark] = useState(null)
  const [showQR, setShowQR] = useState(null)
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    category: 'scenic',
    address: '',
    photoUrl: ''
  })
  const [saving, setSaving] = useState(false)

  const loadLandmarks = async () => {
    try {
      const data = await getAllLandmarks(true)
      setLandmarks(data)
    } catch (err) {
      console.error('Error loading landmarks:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadLandmarks()
  }, [])

  const generateCode = (name) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) return

    setSaving(true)
    try {
      const code = editingLandmark ? editingLandmark.code : generateCode(form.name)

      if (editingLandmark) {
        await updateLandmark(code, {
          name: form.name,
          description: form.description,
          category: form.category,
          address: form.address,
          photoUrl: form.photoUrl || null
        })
      } else {
        await createLandmark(code, form)
      }

      await loadLandmarks()
      resetForm()
    } catch (err) {
      console.error('Error saving landmark:', err)
      alert('Error saving landmark')
    }
    setSaving(false)
  }

  const handleEdit = (landmark) => {
    setEditingLandmark(landmark)
    setForm({
      code: landmark.code,
      name: landmark.name,
      description: landmark.description || '',
      category: landmark.category,
      address: landmark.address || '',
      photoUrl: landmark.photoUrl || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (code) => {
    if (!confirm('Delete this landmark? This cannot be undone.')) return

    try {
      await deleteLandmark(code)
      await loadLandmarks()
    } catch (err) {
      console.error('Error deleting landmark:', err)
      alert('Error deleting landmark')
    }
  }

  const handleToggleActive = async (landmark) => {
    try {
      await updateLandmark(landmark.code, { isActive: !landmark.isActive })
      await loadLandmarks()
    } catch (err) {
      console.error('Error toggling landmark:', err)
    }
  }

  const resetForm = () => {
    setForm({
      code: '',
      name: '',
      description: '',
      category: 'scenic',
      address: '',
      photoUrl: ''
    })
    setEditingLandmark(null)
    setShowForm(false)
  }

  const getLandmarkUrl = (code) => {
    return `https://harmonicsystems.github.io/kinderbucks/#/landmark/${code}`
  }

  return (
    <AdminLayout title="Landmarks" subtitle="Manage village landmarks for scavenger hunts">
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
            {landmarks.length}
          </div>
          <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>Total Landmarks</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-green)' }}>
            {landmarks.filter(l => l.isActive).length}
          </div>
          <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>Active</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-gold)' }}>
            {landmarks.reduce((sum, l) => sum + (l.scanCount || 0), 0)}
          </div>
          <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>Total Scans</div>
        </div>
      </div>

      {/* Add Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-gold"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Add Landmark
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ marginBottom: '1.5rem' }}
        >
          <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
            {editingLandmark ? 'Edit Landmark' : 'Add New Landmark'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <div>
                <label>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Martin Van Buren National Historic Site"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  {Object.entries(LANDMARK_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the landmark..."
                style={{ width: '100%', minHeight: '80px' }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div>
                <label>Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main St, Kinderhook, NY"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label>Photo URL (optional)</label>
                <input
                  type="text"
                  value={form.photoUrl}
                  onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving || !form.name}>
                {saving ? 'Saving...' : editingLandmark ? 'Update Landmark' : 'Create Landmark'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Landmarks List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--kb-gray-500)' }}>
          Loading landmarks...
        </div>
      ) : landmarks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <MapPin size={48} color="var(--kb-gray-300)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--kb-gray-500)' }}>No landmarks yet. Add your first one!</p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Landmark</th>
                <th>Category</th>
                <th>Scans</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {landmarks.map(landmark => {
                const category = LANDMARK_CATEGORIES[landmark.category]
                return (
                  <tr key={landmark.code} style={{ opacity: landmark.isActive ? 1 : 0.5 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: `${category?.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <MapPin size={20} color={category?.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>
                            {landmark.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)', fontFamily: 'monospace' }}>
                            {landmark.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: `${category?.color}15`,
                        color: category?.color,
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                      }}>
                        {category?.name}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{landmark.scanCount || 0}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: landmark.isActive ? 'rgba(39, 174, 96, 0.1)' : 'var(--kb-gray-100)',
                        color: landmark.isActive ? 'var(--kb-green)' : 'var(--kb-gray-500)',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                      }}>
                        {landmark.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setShowQR(showQR === landmark.code ? null : landmark.code)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Show QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(landmark)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(landmark)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title={landmark.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {landmark.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(landmark.code)}
                          className="btn"
                          style={{ padding: '0.4rem 0.6rem', background: '#e74c3c', color: 'white' }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* QR Code Modal */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
              onClick={() => setShowQR(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="card"
                style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
                  {landmarks.find(l => l.code === showQR)?.name}
                </h3>

                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'inline-block',
                  marginBottom: '1rem',
                }}>
                  <QRCode
                    value={getLandmarkUrl(showQR)}
                    size={200}
                    denomination={1}
                    showFrame={false}
                  />
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)', marginBottom: '1rem', fontFamily: 'monospace' }}>
                  {getLandmarkUrl(showQR)}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-gold"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Download size={16} /> Print
                  </button>
                  <button
                    onClick={() => setShowQR(null)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminLandmarks
