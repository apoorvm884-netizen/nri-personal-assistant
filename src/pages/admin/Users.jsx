import { useState, useMemo, useEffect } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { PLAN_LIMITS } from '../../config/appConfig'
import { getPocketBase } from '../../lib/pocketbase'

export default function AdminUsers() {
  const { users, loadAdminData, adminCreateUser, adminToggleDisabled, adminResetPassword, adminChangeRole, adminDeleteUser, admin, adminChangePlan, adminAddBonusTasks, adminRemoveBonusTasks } = useAdmin()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newPlan, setNewPlan] = useState('')
  const [bonusQty, setBonusQty] = useState(1)
  const [auditLogs, setAuditLogs] = useState([])
  const [showAuditLog, setShowAuditLog] = useState(false)

  useEffect(() => {
    if (showAuditLog) {
      const pb = getPocketBase()
      pb.collection('auditLogs').getList(1, 100, {
        sort: '-timestamp',
        expand: 'userId,adminId',
      }).then((res) => {
        setAuditLogs(res.items || [])
      }).catch(() => {})
    }
  }, [showAuditLog])

  const filtered = useMemo(() => {
    let result = [...users]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
    }
    return result
  }, [users, search])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = Object.fromEntries(new FormData(e.target))
      await adminCreateUser(data)
      setModal(null)
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return
    setLoading(true)
    try {
      await adminResetPassword(selectedUser.id, newPassword)
      setModal(null)
      setSelectedUser(null)
      setNewPassword('')
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return
    setLoading(true)
    try {
      await adminChangeRole(selectedUser.id, newRole)
      setModal(null)
      setSelectedUser(null)
      setNewRole('')
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleToggleDisabled = async (user) => {
    try {
      await adminToggleDisabled(user)
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
  }

  const handleDelete = async () => {
    if (!confirmAction) return
    setLoading(true)
    try {
      await adminDeleteUser(confirmAction.id)
      setConfirmAction(null)
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleChangePlan = async () => {
    if (!selectedUser || !newPlan) return
    setLoading(true)
    try {
      await adminChangePlan(selectedUser.id, newPlan)
      setModal(null)
      setSelectedUser(null)
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleAddBonusTasks = async () => {
    if (!selectedUser || bonusQty < 1) return
    setLoading(true)
    try {
      await adminAddBonusTasks(selectedUser.id, bonusQty)
      setModal(null)
      setSelectedUser(null)
      setBonusQty(1)
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleRemoveBonusTasks = async () => {
    if (!selectedUser || bonusQty < 1) return
    setLoading(true)
    try {
      await adminRemoveBonusTasks(selectedUser.id, bonusQty)
      setModal(null)
      setSelectedUser(null)
      setBonusQty(1)
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const roleOptions = (currentRole) => {
    if (currentRole === 'Customer') return ['Customer', 'Team Member']
    if (currentRole === 'Team Member') return ['Team Member', 'Admin']
    if (currentRole === 'Admin') return ['Admin']
    return ['Customer', 'Team Member', 'Admin']
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDateTime = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal-800">User Management</h1>
          <p className="text-sm text-charcoal-500 mt-1">{users.length} total users</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAuditLog(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors"
          >
            Audit Log
          </button>
          <button
            onClick={() => setModal('create')}
            className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Create User
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-md px-4 py-2.5 rounded-xl bg-white border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                <th className="text-left px-4 py-3 font-medium text-charcoal-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-500">Role</th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-500">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-500">Created</th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-500">Last Login</th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-charcoal-50 hover:bg-charcoal-50/50">
                  <td className="px-4 py-3 font-medium text-charcoal-800">{user.name || '-'}</td>
                  <td className="px-4 py-3 text-charcoal-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-purple-50 text-purple-600' :
                      user.role === 'Team Member' ? 'bg-blue-50 text-blue-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {user.role || 'Customer'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium ${
                      user.disabled ? 'bg-red-50 text-red-600' :
                      user.verified ? 'bg-green-50 text-green-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.disabled ? 'bg-red-500' :
                        user.verified ? 'bg-green-500' :
                        'bg-amber-500'
                      }`} />
                      {user.disabled ? 'Disabled' : user.verified ? 'Active' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-charcoal-700">{user.subscriptionPlan || 'Personal'}</span>
                    <div className="text-[10px] text-charcoal-400 mt-0.5">
                      {user.taskUsage || 0} used / {PLAN_LIMITS[user.subscriptionPlan] || 10} base
                      {user.extraTasksPurchased > 0 && <span> +{user.extraTasksPurchased} bonus</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-500 text-xs">{formatDate(user.created)}</td>
                  <td className="px-4 py-3 text-charcoal-500 text-xs">{formatDateTime(user.lastLogin)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleToggleDisabled(user)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                          user.disabled
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        {user.disabled ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setNewPassword(''); setModal('reset-pw') }}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        Reset PW
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setNewPlan(user.subscriptionPlan || 'Personal'); setModal('change-plan') }}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-sage-50 text-sage-600 hover:bg-sage-100 transition-colors"
                      >
                        Change Plan
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setBonusQty(1); setModal('add-bonus') }}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                      >
                        +Bonus
                      </button>
                      {user.extraTasksPurchased > 0 && (
                        <button
                          onClick={() => { setSelectedUser(user); setBonusQty(1); setModal('remove-bonus') }}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        >
                          -Bonus
                        </button>
                      )}
                      {roleOptions(user.role).length > 1 && (
                        <button
                          onClick={() => { setSelectedUser(user); setNewRole(roleOptions(user.role).find(r => r !== user.role)); setModal('change-role') }}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-sage-50 text-sage-600 hover:bg-sage-100 transition-colors"
                        >
                          Change Role
                        </button>
                      )}
                      {user.role !== 'Admin' && (
                        <button
                          onClick={() => setConfirmAction(user)}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-charcoal-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-4">Create User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-500 mb-1">Name</label>
                <input name="name" required className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-500 mb-1">Email</label>
                <input name="email" type="email" required className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-500 mb-1">Password</label>
                <input name="password" type="password" required className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal-500 mb-1">Role</label>
                  <select name="role" className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500">
                    <option value="Customer">Customer</option>
                    <option value="Team Member">Team Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-500 mb-1">Plan</label>
                  <select name="subscriptionPlan" className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500">
                    <option value="Personal">Personal</option>
                    <option value="Professional">Professional</option>
                    <option value="Concierge">Concierge</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {modal === 'reset-pw' && selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setModal(null); setSelectedUser(null) }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">Reset Password</h2>
            <p className="text-sm text-charcoal-500 mb-4">Set a new password for <strong>{selectedUser.name || selectedUser.email}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-500 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModal(null); setSelectedUser(null) }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">Cancel</button>
                <button onClick={handleResetPassword} disabled={loading || !newPassword} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {modal === 'change-role' && selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setModal(null); setSelectedUser(null) }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">Change Role</h2>
            <p className="text-sm text-charcoal-500 mb-4">
              Change role for <strong>{selectedUser.name || selectedUser.email}</strong>
              <br />Current role: <span className="font-medium">{selectedUser.role}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-500 mb-1">New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                >
                  {roleOptions(selectedUser.role).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModal(null); setSelectedUser(null) }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">Cancel</button>
                <button onClick={handleChangeRole} disabled={loading || newRole === selectedUser.role} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
                  {loading ? 'Changing...' : 'Change Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {modal === 'change-plan' && selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setModal(null); setSelectedUser(null) }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">Change Plan</h2>
            <p className="text-sm text-charcoal-500 mb-4">
              Change plan for <strong>{selectedUser.name || selectedUser.email}</strong>
              <br />Current plan: <span className="font-medium">{selectedUser.subscriptionPlan}</span>
              <br />Tasks: {selectedUser.taskUsage || 0} used, {selectedUser.extraTasksPurchased || 0} bonus purchased
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-500 mb-1">New Plan</label>
                <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500">
                  <option value="Personal">Personal (10 tasks)</option>
                  <option value="Professional">Professional (25 tasks)</option>
                  <option value="Concierge">Concierge (75 tasks)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModal(null); setSelectedUser(null) }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">Cancel</button>
                <button onClick={handleChangePlan} disabled={loading || newPlan === selectedUser.subscriptionPlan} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
                  {loading ? 'Changing...' : 'Change Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bonus Tasks Modal */}
      {modal === 'add-bonus' && selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setModal(null); setSelectedUser(null) }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">Add Bonus Tasks</h2>
            <p className="text-sm text-charcoal-500 mb-4">
              Add extra tasks for <strong>{selectedUser.name || selectedUser.email}</strong>
              <br />Current bonus: {selectedUser.extraTasksPurchased || 0} tasks
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-500 mb-1">Number of Tasks to Add</label>
                <input type="number" min="1" max="100" value={bonusQty} onChange={(e) => setBonusQty(parseInt(e.target.value) || 1)} className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModal(null); setSelectedUser(null); setBonusQty(1) }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">Cancel</button>
                <button onClick={handleAddBonusTasks} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors disabled:opacity-50">
                  {loading ? 'Adding...' : `Add ${bonusQty} Task${bonusQty > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Bonus Tasks Modal */}
      {modal === 'remove-bonus' && selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setModal(null); setSelectedUser(null) }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">Remove Bonus Tasks</h2>
            <p className="text-sm text-charcoal-500 mb-4">
              Remove extra tasks from <strong>{selectedUser.name || selectedUser.email}</strong>
              <br />Current bonus: {selectedUser.extraTasksPurchased || 0} tasks
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-500 mb-1">Number of Tasks to Remove</label>
                <input type="number" min="1" max={selectedUser.extraTasksPurchased || 1} value={bonusQty} onChange={(e) => setBonusQty(parseInt(e.target.value) || 1)} className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModal(null); setSelectedUser(null); setBonusQty(1) }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">Cancel</button>
                <button onClick={handleRemoveBonusTasks} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50">
                  {loading ? 'Removing...' : `Remove ${bonusQty} Task${bonusQty > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">Delete User</h2>
            <p className="text-sm text-charcoal-500 mb-4">
              Are you sure you want to permanently delete <strong>{confirmAction.name || confirmAction.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAuditLog(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800">Audit Log</h2>
              <button onClick={() => setShowAuditLog(false)} className="text-charcoal-400 hover:text-charcoal-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-charcoal-400 text-center py-8">No audit log entries yet.</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((entry) => {
                    const expandAdmin = entry.expand?.adminId
                    const expandUser = entry.expand?.userId
                    const adminName = expandAdmin?.name || expandAdmin?.email || entry.adminId
                    const userName = expandUser?.name || expandUser?.email || entry.userId
                    const details = entry.details || {}
                    return (
                      <div key={entry.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-charcoal-50/50">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          entry.action === 'User Created' ? 'bg-green-500' :
                          entry.action === 'User Disabled' ? 'bg-red-500' :
                          entry.action === 'User Enabled' ? 'bg-green-500' :
                          entry.action === 'Password Reset' ? 'bg-blue-500' :
                          entry.action === 'Role Changed' ? 'bg-purple-500' :
                          entry.action === 'User Deleted' ? 'bg-red-600' :
                          'bg-charcoal-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-charcoal-700">{entry.action}</span>
                            <span className="text-[10px] text-charcoal-400">by {adminName}</span>
                          </div>
                          <p className="text-xs text-charcoal-500 mt-0.5">
                            User: {userName}
                            {details.from && details.to && <span> ({details.from} → {details.to})</span>}
                          </p>
                          <p className="text-[10px] text-charcoal-400 mt-0.5">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
