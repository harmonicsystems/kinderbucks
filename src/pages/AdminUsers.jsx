import { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  Store,
  User,
  Search,
  Crown,
  Mail,
  Calendar,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  Archive,
  AlertTriangle
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import {
  getAllUsers,
  addUserRole,
  removeUserRole,
  assignBusinessToUser,
  getUserRoles,
  ROLES,
  getUserDeletionInfo,
  softDeleteUser,
  restoreUser,
  getDeletedUsers
} from '../firebase/auth'
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
  const [deletedUsers, setDeletedUsers] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [processing, setProcessing] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    const [usersData, businessesData, deletedUsersData] = await Promise.all([
      getAllUsers(),
      getAllBusinesses(),
      getDeletedUsers()
    ])
    setUsers(usersData.filter(u => !u.isDeleted))
    setDeletedUsers(deletedUsersData)
    setBusinesses(businessesData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleRole = async (uid, role) => {
    setProcessing(`${uid}-${role}`)
    try {
      const user = users.find(u => u.id === uid)
      const userRoles = getUserRoles(user)

      if (userRoles.includes(role)) {
        await removeUserRole(uid, role)
      } else {
        await addUserRole(uid, role)
      }

      setSuccessMessage('Role updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      await loadData()
    } catch (err) {
      console.error('Error updating role:', err)
      alert('Error updating role')
    }
    setProcessing(null)
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

  const handleDeleteClick = async (user) => {
    const info = await getUserDeletionInfo(user.id)
    setDeleteModal({ user, info })
    setDeleteConfirmText('')
  }

  const handleConfirmDelete = async (force = false) => {
    if (!deleteModal) return

    setDeleting(true)
    try {
      await softDeleteUser(deleteModal.user.id, null, force)
      setDeleteModal(null)
      setDeleteConfirmText('')
      setSuccessMessage('User deleted successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      await loadData()
    } catch (err) {
      console.error('Error deleting user:', err)
      alert(err.message || 'Error deleting user')
    }
    setDeleting(false)
  }

  const handleRestore = async (uid) => {
    try {
      await restoreUser(uid)
      setSuccessMessage('User restored successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      await loadData()
    } catch (err) {
      console.error('Error restoring user:', err)
      alert('Error restoring user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())

    if (roleFilter === 'all') return matchesSearch

    const userRoles = getUserRoles(user)
    return matchesSearch && userRoles.includes(roleFilter)
  })

  // Stats now count users who have each role (not exclusive)
  const stats = {
    total: users.length,
    admins: users.filter(u => getUserRoles(u).includes('admin')).length,
    businesses: users.filter(u => getUserRoles(u).includes('business')).length,
    members: users.filter(u => getUserRoles(u).includes('member')).length,
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
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>Business Users</div>
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
            <option value="admin">Has Admin</option>
            <option value="business">Has Business</option>
            <option value="member">Has Member</option>
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
              const userRoles = getUserRoles(user)
              const primaryRole = userRoles.includes('admin') ? 'admin' : userRoles.includes('business') ? 'business' : 'member'
              const primaryConfig = ROLE_CONFIG[primaryRole]
              const PrimaryIcon = primaryConfig.Icon

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
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    {/* User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: primaryConfig.bgColor,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <PrimaryIcon size={24} color={primaryConfig.color} />
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
                          {userRoles.includes('admin') && (
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
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: 'var(--kb-gray-400)',
                          fontSize: '0.8rem',
                          marginTop: '0.25rem',
                        }}>
                          <Calendar size={12} />
                          Last login: {formatDate(user.lastLogin)}
                        </div>
                      </div>
                    </div>

                    {/* Role Badges & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                      {/* Current Roles */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {userRoles.map(role => {
                          const config = ROLE_CONFIG[role]
                          if (!config) return null
                          return (
                            <div
                              key={role}
                              style={{
                                padding: '0.35rem 0.75rem',
                                background: config.bgColor,
                                color: config.color,
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <config.Icon size={14} />
                              {config.label}
                            </div>
                          )
                        })}
                      </div>

                      {/* Edit Roles Button */}
                      <button
                        onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {editingUser === user.id ? 'Done' : 'Edit Roles'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Role Editor */}
                  {editingUser === user.id && (
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--kb-gray-200)',
                    }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)', marginBottom: '0.75rem' }}>
                        Toggle roles for this user:
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                          const hasThisRole = userRoles.includes(role)
                          const isProcessing = processing === `${user.id}-${role}`

                          return (
                            <button
                              key={role}
                              onClick={() => handleToggleRole(user.id, role)}
                              disabled={isProcessing}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: `2px solid ${hasThisRole ? config.color : 'var(--kb-gray-300)'}`,
                                background: hasThisRole ? config.bgColor : 'white',
                                color: hasThisRole ? config.color : 'var(--kb-gray-500)',
                                cursor: isProcessing ? 'wait' : 'pointer',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                opacity: isProcessing ? 0.6 : 1,
                              }}
                            >
                              {hasThisRole ? <Minus size={16} /> : <Plus size={16} />}
                              <config.Icon size={16} />
                              {config.label}
                            </button>
                          )
                        })}
                      </div>

                      {/* Assign Business Button - show if user has business role */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {userRoles.includes('business') && (
                          <button
                            onClick={() => setShowAssignModal(user.id)}
                            className="btn btn-secondary"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.85rem',
                            }}
                          >
                            <Store size={16} />
                            {user.businessCode ? `Change Business (${user.businessCode})` : 'Assign Business'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="btn"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            background: 'var(--kb-gray-100)',
                            color: 'var(--kb-gray-600)',
                          }}
                        >
                          <Trash2 size={16} />
                          Delete User
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Deleted Users Section */}
      {deletedUsers.length > 0 && (
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
              <Archive size={20} /> Deleted Users ({deletedUsers.length})
            </h3>
            <span style={{ color: 'var(--kb-gray-400)' }}>{showDeleted ? '▲' : '▼'}</span>
          </button>

          {showDeleted && (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {deletedUsers.map(user => (
                <div
                  key={user.id}
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
                    <div style={{ fontWeight: '500', color: 'var(--kb-gray-600)' }}>
                      {user.displayName || 'Unnamed User'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-400)' }}>
                      {user.email} • Deleted {user.deletedAt?.toDate ? user.deletedAt.toDate().toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(user.id)}
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

      {/* Delete User Confirmation Modal */}
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
                <h3 style={{ color: 'var(--kb-navy)', margin: 0 }}>
                  Delete {deleteModal.user.displayName || deleteModal.user.email}?
                </h3>
                <p style={{ color: 'var(--kb-gray-500)', margin: 0, fontSize: '0.9rem' }}>
                  {deleteModal.info?.hasData ? 'This user has associated data' : 'This user can be safely deleted'}
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
                  {deleteModal.info.exchangeCount > 0 && (
                    <li>{deleteModal.info.exchangeCount} exchange requests</li>
                  )}
                  {deleteModal.info.isBusinessOwner && (
                    <li>Business owner: {deleteModal.info.businessCode}</li>
                  )}
                </ul>
                <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                  The user will be soft-deleted and can be restored later.
                </p>
              </div>
            )}

            {deleteModal.info?.hasData && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--kb-gray-600)', fontWeight: '500' }}>
                  Type "{deleteModal.user.email}" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder={deleteModal.user.email}
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
                  disabled={deleteConfirmText !== deleteModal.user.email || deleting}
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

export default AdminUsers
