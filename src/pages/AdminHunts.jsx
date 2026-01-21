import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Map,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Trophy,
  MapPin,
  Users,
  Store,
  Check
} from 'lucide-react'
import { getAllHunts, createHunt, updateHunt, deleteHunt, HUNT_TYPES } from '../firebase/hunts'
import { getAllLandmarks } from '../firebase/landmarks'
import { getAllBusinesses } from '../firebase/businesses'
import AdminLayout from '../components/AdminLayout'

function AdminHunts() {
  const [hunts, setHunts] = useState([])
  const [landmarks, setLandmarks] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHunt, setEditingHunt] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'special',
    landmarks: [],
    startDate: '',
    endDate: '',
    sponsorBusinessCode: '',
    badge: { name: '', icon: 'map', color: '#c9a227' },
    reward: { type: 'badge', bonusPercent: 0 }
  })
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const [huntsData, landmarksData, businessesData] = await Promise.all([
        getAllHunts(true),
        getAllLandmarks(true),
        getAllBusinesses()
      ])
      setHunts(huntsData)
      setLandmarks(landmarksData.filter(l => l.isActive))
      setBusinesses(businessesData.filter(b => b.isActive))
    } catch (err) {
      console.error('Error loading data:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.landmarks.length === 0) return

    setSaving(true)
    try {
      const huntData = {
        name: form.name,
        description: form.description,
        type: form.type,
        landmarks: form.landmarks,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        sponsorBusinessCode: form.sponsorBusinessCode || null,
        sponsorBusinessName: form.sponsorBusinessCode
          ? businesses.find(b => b.code === form.sponsorBusinessCode)?.name || null
          : null,
        badge: {
          name: form.badge.name || form.name,
          icon: form.badge.icon,
          color: form.badge.color
        },
        reward: form.reward
      }

      if (editingHunt) {
        await updateHunt(editingHunt.id, huntData)
      } else {
        await createHunt(huntData)
      }

      await loadData()
      resetForm()
    } catch (err) {
      console.error('Error saving trail:', err)
      alert('Error saving trail')
    }
    setSaving(false)
  }

  const handleEdit = (hunt) => {
    setEditingHunt(hunt)

    // Format dates for input fields
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toISOString().split('T')[0]
    }

    setForm({
      name: hunt.name,
      description: hunt.description || '',
      type: hunt.type,
      landmarks: hunt.landmarks || [],
      startDate: formatDate(hunt.startDate),
      endDate: formatDate(hunt.endDate),
      sponsorBusinessCode: hunt.sponsorBusinessCode || '',
      badge: hunt.badge || { name: hunt.name, icon: 'map', color: '#c9a227' },
      reward: hunt.reward || { type: 'badge', bonusPercent: 0 }
    })
    setShowForm(true)
  }

  const handleDelete = async (huntId) => {
    if (!confirm('Delete this trail? This cannot be undone.')) return

    try {
      await deleteHunt(huntId)
      await loadData()
    } catch (err) {
      console.error('Error deleting trail:', err)
      alert('Error deleting trail')
    }
  }

  const handleToggleActive = async (hunt) => {
    try {
      await updateHunt(hunt.id, { isActive: !hunt.isActive })
      await loadData()
    } catch (err) {
      console.error('Error toggling hunt:', err)
    }
  }

  const toggleLandmark = (code) => {
    setForm(f => ({
      ...f,
      landmarks: f.landmarks.includes(code)
        ? f.landmarks.filter(l => l !== code)
        : [...f.landmarks, code]
    }))
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      type: 'special',
      landmarks: [],
      startDate: '',
      endDate: '',
      sponsorBusinessCode: '',
      badge: { name: '', icon: 'map', color: '#c9a227' },
      reward: { type: 'badge', bonusPercent: 0 }
    })
    setEditingHunt(null)
    setShowForm(false)
  }

  const formatDateDisplay = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const isHuntActive = (hunt) => {
    if (!hunt.isActive) return false
    const now = new Date()
    const startDate = hunt.startDate?.toDate ? hunt.startDate.toDate() : new Date(hunt.startDate)
    const endDate = hunt.endDate?.toDate ? hunt.endDate.toDate() : null
    return startDate <= now && (!endDate || endDate >= now)
  }

  return (
    <AdminLayout title="Discovery Trails" subtitle="Create and manage village exploration trails">
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
            {hunts.length}
          </div>
          <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>Total Trails</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-green)' }}>
            {hunts.filter(h => isHuntActive(h)).length}
          </div>
          <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>Active Now</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-gold)' }}>
            {hunts.reduce((sum, h) => sum + (h.completionCount || 0), 0)}
          </div>
          <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>Completions</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
            {landmarks.length}
          </div>
          <div style={{ color: 'var(--kb-gray-500)', fontSize: '0.85rem' }}>Landmarks</div>
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
          Create Trail
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
            {editingHunt ? 'Edit Trail' : 'Create New Trail'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <div>
                <label>Trail Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Winter Village Walk"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label>Trail Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  {Object.entries(HUNT_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Explore Kinderhook's winter wonderland..."
                style={{ width: '100%', minHeight: '80px' }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label>End Date (leave empty for permanent)</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label>Sponsor Business (optional)</label>
                <select
                  value={form.sponsorBusinessCode}
                  onChange={e => setForm(f => ({ ...f, sponsorBusinessCode: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  <option value="">No Sponsor</option>
                  {businesses.map(biz => (
                    <option key={biz.code} value={biz.code}>{biz.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Landmarks Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginBottom: '0.75rem', display: 'block' }}>
                Select Landmarks * ({form.landmarks.length} selected)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.5rem',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '0.5rem',
                background: 'var(--kb-gray-50)',
                borderRadius: '8px',
              }}>
                {landmarks.map(landmark => (
                  <button
                    key={landmark.code}
                    type="button"
                    onClick={() => toggleLandmark(landmark.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: form.landmarks.includes(landmark.code)
                        ? 'var(--kb-gold)'
                        : 'white',
                      color: form.landmarks.includes(landmark.code)
                        ? 'white'
                        : 'var(--kb-navy)',
                      border: '1px solid var(--kb-gray-200)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                    }}
                  >
                    {form.landmarks.includes(landmark.code) && <Check size={14} />}
                    <MapPin size={14} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {landmark.name}
                    </span>
                  </button>
                ))}
              </div>
              {landmarks.length === 0 && (
                <p style={{ color: 'var(--kb-gray-500)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  No landmarks available. Create landmarks first in the Landmarks page.
                </p>
              )}
            </div>

            {/* Reward Configuration */}
            <div style={{
              background: 'var(--kb-gray-50)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}>
              <h4 style={{ color: 'var(--kb-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} /> Reward Settings
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
              }}>
                <div>
                  <label>Reward Type</label>
                  <select
                    value={form.reward.type}
                    onChange={e => setForm(f => ({
                      ...f,
                      reward: { ...f.reward, type: e.target.value }
                    }))}
                    style={{ width: '100%' }}
                  >
                    <option value="badge">Badge Only</option>
                    <option value="bonus">Exchange Bonus</option>
                    <option value="both">Badge + Bonus</option>
                  </select>
                </div>

                {(form.reward.type === 'bonus' || form.reward.type === 'both') && (
                  <div>
                    <label>Bonus Percent</label>
                    <input
                      type="number"
                      value={form.reward.bonusPercent || ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        reward: { ...f.reward, bonusPercent: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="10"
                      style={{ width: '100%' }}
                      min="0"
                      max="50"
                    />
                  </div>
                )}

                <div>
                  <label>Badge Color</label>
                  <input
                    type="color"
                    value={form.badge.color}
                    onChange={e => setForm(f => ({
                      ...f,
                      badge: { ...f.badge, color: e.target.value }
                    }))}
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !form.name || form.landmarks.length === 0}
              >
                {saving ? 'Saving...' : editingHunt ? 'Update Trail' : 'Create Trail'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Hunts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--kb-gray-500)' }}>
          Loading hunts...
        </div>
      ) : hunts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Map size={48} color="var(--kb-gray-300)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--kb-gray-500)' }}>No trails yet. Create your first one!</p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Trail</th>
                <th>Type</th>
                <th>Landmarks</th>
                <th>Dates</th>
                <th>Completions</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hunts.map(hunt => {
                const huntType = HUNT_TYPES[hunt.type]
                const active = isHuntActive(hunt)
                return (
                  <tr key={hunt.id} style={{ opacity: hunt.isActive ? 1 : 0.5 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: `${hunt.badge?.color || huntType?.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Trophy size={20} color={hunt.badge?.color || huntType?.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--kb-navy)' }}>
                            {hunt.name}
                          </div>
                          {hunt.sponsorBusinessName && (
                            <div style={{
                              fontSize: '0.75rem',
                              color: 'var(--kb-gray-500)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Store size={12} />
                              Sponsored by {hunt.sponsorBusinessName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: `${huntType?.color}15`,
                        color: huntType?.color,
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                      }}>
                        {huntType?.name}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} color="var(--kb-gray-500)" />
                        <span>{hunt.landmarks?.length || 0}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>{formatDateDisplay(hunt.startDate)}</div>
                      <div style={{ color: 'var(--kb-gray-500)' }}>
                        {hunt.endDate ? `to ${formatDateDisplay(hunt.endDate)}` : 'Ongoing'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={14} color="var(--kb-gray-500)" />
                        <span style={{ fontWeight: '600' }}>{hunt.completionCount || 0}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: active ? 'rgba(39, 174, 96, 0.1)' : 'var(--kb-gray-100)',
                        color: active ? 'var(--kb-green)' : 'var(--kb-gray-500)',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                      }}>
                        {active ? 'Active' : hunt.isActive ? 'Scheduled' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(hunt)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(hunt)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title={hunt.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {hunt.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(hunt.id)}
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
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminHunts
