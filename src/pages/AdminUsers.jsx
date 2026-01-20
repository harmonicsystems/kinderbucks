import { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  Store,
  User,
  Search,
  MoreVertical,
  Crown,
  Mail,
  Calendar,
  CheckCircle
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { getAllUsers, updateUserRole, assignBusinessToUser, ROLES } from '../firebase/auth'
import { getAllBusinesses } from '../firebase/businesses'

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    color: '#dc2626',
    bgColor: '#fef2f2',
    Icon: Shield,
    description: 'Full system access'
  },
  business: {
    label: 'Business',
    color: '#2563eb',
    bgColor: '#eff6ff',
    Icon: Store,
    description: 'Business owner access'
  },
  member: {
    label: 'Member',
    color: 'var(--kb-green)',
    bgColor: '#f0fdf4',
    Icon: User,
    description: 'Regular member'
  }
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const loadData = async () => {
    const [usersData, businessesData] = await Promise.all([
      getAllUsers(),
      getAllBusinesses()
    ])
    setUsers(usersData)
    setBusinesses(businessesData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateUserRole(uid, newRole)
      setSuccessMessage('Role updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      await loadData()
      setEditingUser(null)
    } catch (err) {
      console.error('Error updating role:', err)
      alert('Error updating role')
    }
  }

  const handleAssignBusiness = async (uid, businessCode) => {
    try {
      await assignBusinessToUser(uid, businessCode)
      setSuccessMessage('Business assigned successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      await loadData()
      setShowAssignModal(null)
    } catch (err) {
      console.error('Error assigning business:', err)
      alert('Error assigning business')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    businesses: users.filter(u => u.role === 'business').length,
    members: users.filter(u => u.role === 'member').length,
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--kb-gray-500)' }}>Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="User Management">
      {/* Success Toast */}
      {successMessage && (
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
          <span>{successMessage}</span>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Total Users</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#dc2626' }}>
            {stats.admins}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Admins</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2563eb' }}>
            {stats.businesses}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Businesses</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--kb-green)' }}>
            {stats.members}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Members</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search
              size={18}
              color="var(--kb-gray-400)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '40px' }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="business">Businesses</option>
            <option value="member">Members</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} /> All Users ({filteredUsers.length})
        </h3>

        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--kb-gray-500)' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No users found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredUsers.map(user => {
              const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.member
              const RoleIcon = roleConfig.Icon

              return (
                <div
                  key={user.id}
                  style={{
                    background: 'var(--kb-gray-50)',
                    border: '1px solid var(--kb-gray-200)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    {/* User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: roleConfig.bgColor,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <RoleIcon size={24} color={roleConfig.color} />
                      </div>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: 'var(--kb-navy)',
                          fontSize: '1.05rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                          {user.displayName || 'Unnamed User'}
                          {user.role === 'admin' && (
                            <Crown size={16} color="#c9a227" />
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: 'var(--kb-gray-500)',
                          fontSize: '0.9rem',
                        }}>
                          <Mail size={14} />
                          {user.email}
                        </div>
                        {user.businessCode && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#2563eb',
                            fontSize: '0.85rem',
                            marginTop: '0.25rem',
                          }}>
                            <Store size={14} />
                            {user.businessCode}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Role Badge */}
                      <div style={{
                        padding: '0.4rem 0.8rem',
                        background: roleConfig.bgColor,
                        color: roleConfig.color,
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                      }}>
                        {roleConfig.label}
                      </div>

                      {/* Last Login */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--kb-gray-500)',
                        fontSize: '0.85rem',
                      }}>
                        <Calendar size={14} />
                        {formatDate(user.lastLogin)}
                      </div>

                      {/* Edit Role Dropdown */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {editingUser === user.id && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '0.5rem',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 100,
                            minWidth: '180px',
                            overflow: 'hidden',
                          }}>
                            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--kb-gray-200)' }}>
                              <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)', marginBottom: '0.25rem' }}>
                                Change Role
                              </div>
                            </div>
                            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(user.id, role)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  width: '100%',
                                  padding: '0.75rem 1rem',
                                  border: 'none',
                                  background: user.role === role ? config.bgColor : 'transparent',
                                  color: 'var(--kb-gray-700)',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                <config.Icon size={16} color={config.color} />
                                {config.label}
                                {user.role === role && (
                                  <CheckCircle size={14} color={config.color} style={{ marginLeft: 'auto' }} />
                                )}
                              </button>
                            ))}
                            {user.role === 'business' && (
                              <>
                                <div style={{ borderTop: '1px solid var(--kb-gray-200)' }} />
                                <button
                                  onClick={() => {
                                    setEditingUser(null)
                                    setShowAssignModal(user.id)
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                >
                                  <Store size={16} />
                                  Assign Business
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Assign Business Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 1000,
        }}>
          <div className="card" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '1.5rem',
          }}>
            <h3 style={{ color: 'var(--kb-navy)', marginBottom: '1rem' }}>
              Assign Business
            </h3>
            <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1rem' }}>
              Select a business to assign to this user:
            </p>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
              {businesses.map(biz => (
                <button
                  key={biz.code}
                  onClick={() => handleAssignBusiness(showAssignModal, biz.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--kb-gray-200)',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                    textAlign: 'left',
                  }}
                >
                  <Store size={18} color="var(--kb-navy)" />
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>{biz.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-500)' }}>{biz.code}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAssignModal(null)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsers
