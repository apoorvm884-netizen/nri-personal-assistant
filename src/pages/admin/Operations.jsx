import { useState, useMemo } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { exportRequests, exportUsers, exportReminders } from '../../services/exportService'

function hoursOpen(created) {
  if (!created) return 0
  const diff = Date.now() - new Date(created).getTime()
  return Math.round(diff / 3600000)
}

function slaColor(hours) {
  if (hours < 24) return 'bg-green-50 text-green-600 border-green-100'
  if (hours < 48) return 'bg-amber-50 text-amber-600 border-amber-100'
  return 'bg-red-50 text-red-600 border-red-100'
}

function computeHealth(customer, requests, overdueReminders) {
  const customerReqs = requests.filter((r) => r.userId === customer.id)
  const active = customerReqs.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled').length
  const overdue = overdueReminders.filter((r) => r.userId === customer.id).length
  const limit = { Personal: 10, Professional: 25, Concierge: 75 }[customer.subscriptionPlan] || 10
  const total = limit + (customer.extraTasksPurchased || 0)
  const usagePct = total > 0 ? Math.round(((customer.taskUsage || 0) / total) * 100) : 0
  const lastActivity = customer.lastLogin || customer.created || ''
  if (active >= 3 || overdue >= 3 || usagePct >= 90) return { label: 'Attention Required', color: 'bg-red-50 text-red-600', detail: `${active} active, ${overdue} overdue, ${usagePct}% used` }
  if (active >= 1 || overdue >= 1 || usagePct >= 80) return { label: 'Watch', color: 'bg-amber-50 text-amber-600', detail: `${active} active, ${overdue} overdue, ${usagePct}% used` }
  return { label: 'Healthy', color: 'bg-green-50 text-green-600', detail: `${active} active, ${overdue} overdue, ${usagePct}% used` }
}

function computeTeamPerformance(teamMember, requests) {
  const assigned = requests.filter((r) => r.assignedTo === teamMember.id)
  const completed = assigned.filter((r) => r.status === 'Completed')
  const openCount = assigned.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled').length
  let avgCompletionHours = 0
  if (completed.length > 0) {
    const totalHours = completed.reduce((sum, r) => sum + (r.updatedAt && r.created ? hoursOpen(r.created) - hoursOpen(r.updatedAt) : 0), 0)
    avgCompletionHours = Math.round(totalHours / completed.length)
  }
  return { assigned: assigned.length, completed: completed.length, avgCompletionHours, openCount }
}

const statusQueueOrder = ['Submitted', 'Assigned', 'Waiting for Customer', 'In Progress', 'Completed']
const statusLabels = { Submitted: 'New Requests', Assigned: 'Assigned Requests', 'Waiting for Customer': 'Waiting for Customer', 'In Progress': 'In Progress', Completed: 'Completed' }
const validStatuses = ['Submitted', 'Accepted', 'Need Information', 'Customer Responded', 'In Progress', 'Waiting For Approval', 'Completed', 'Rejected']

export default function Operations() {
  const { requests, users, allReminders, adminNotifications } = useAdmin()
  const [tab, setTab] = useState('overview')
  const [filters, setFilters] = useState({ customer: '', teamMember: '', status: '', priority: '', plan: '' })
  const todayStr = new Date().toISOString().split('T')[0]

  const customers = useMemo(() => users.filter((u) => u.role === 'Customer'), [users])
  const teamMembers = useMemo(() => users.filter((u) => u.role === 'Team Member'), [users])

  const overdueReminders = useMemo(() =>
    allReminders.filter((r) => !r.completed && !r.cancelled && r.date < todayStr),
    [allReminders, todayStr]
  )

  const filteredRequests = useMemo(() => {
    let result = requests
    if (filters.customer) result = result.filter((r) => r.userId === filters.customer)
    if (filters.teamMember) result = result.filter((r) => r.assignedTo === filters.teamMember)
    if (filters.status) result = result.filter((r) => r.status === filters.status)
    if (filters.priority) result = result.filter((r) => r.priority === filters.priority)
    if (filters.plan) result = result.filter((r) => r.userPlan === filters.plan)
    return result
  }, [requests, filters])

  const queueCounts = useMemo(() => {
    const counts = {}
    for (const s of statusQueueOrder) counts[s] = filteredRequests.filter((r) => r.status === s).length
    return counts
  }, [filteredRequests])

  const thisMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const thisYear = new Date().getFullYear().toString()

  const metrics = useMemo(() => {
    const activeReqs = filteredRequests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled')
    const waiting = filteredRequests.filter((r) => r.status === 'Waiting for Customer')
    const inProg = filteredRequests.filter((r) => r.status === 'In Progress')
    const completedThisMonth = filteredRequests.filter((r) => {
      if (r.status !== 'Completed') return false
      const d = r.updatedAt || r.created || ''
      return d.includes(`${thisYear}-${thisMonth}`)
    })
    const nearLimit = customers.filter((u) => {
      const limit = { Personal: 10, Professional: 25, Concierge: 75 }[u.subscriptionPlan] || 10
      const total = limit + (u.extraTasksPurchased || 0)
      const used = u.taskUsage || 0
      const remaining = total - used
      return remaining <= 3 && remaining > 0
    }).length
    const unread = adminNotifications.filter((n) => !n.read).length
    return {
      totalCustomers: customers.length,
      totalTeam: teamMembers.length,
      activeRequests: activeReqs.length,
      waitingForCustomer: waiting.length,
      inProgress: inProg.length,
      completedThisMonth: completedThisMonth.length,
      overdueReminders: overdueReminders.length,
      nearLimit,
      unreadNotifications: unread,
    }
  }, [filteredRequests, customers, teamMembers, overdueReminders, adminNotifications, thisMonth, thisYear])

  const slaRequests = useMemo(() => {
    return filteredRequests.map((r) => ({
      ...r,
      hoursOpen: hoursOpen(r.created),
    })).sort((a, b) => b.hoursOpen - a.hoursOpen)
  }, [filteredRequests])

  const customerHealth = useMemo(() => {
    return customers.map((c) => {
      const health = computeHealth(c, requests, overdueReminders)
      const customerReqs = requests.filter((r) => r.userId === c.id)
      const active = customerReqs.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled').length
      return { ...c, health, activeRequests: active }
    }).sort((a, b) => {
      const order = { 'Attention Required': 0, Watch: 1, Healthy: 2 }
      return (order[a.health.label] || 2) - (order[b.health.label] || 2)
    })
  }, [customers, requests, overdueReminders])

  const teamPerformance = useMemo(() => {
    return teamMembers.map((tm) => ({ ...tm, ...computeTeamPerformance(tm, requests) }))
  }, [teamMembers, requests])

  const handleFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))

  const statusColors = {
    Submitted: 'bg-amber-50 text-amber-600 border-amber-100',
    Accepted: 'bg-blue-50 text-blue-600 border-blue-100',
    'In Progress': 'bg-primary-50 text-primary-600 border-primary-100',
    Completed: 'bg-green-50 text-green-600 border-green-100',
    Cancelled: 'bg-red-50 text-red-600 border-red-100',
    'Waiting for Customer': 'bg-orange-50 text-orange-600 border-orange-100',
    'Need Information': 'bg-purple-50 text-purple-600 border-purple-100',
    'Customer Responded': 'bg-teal-50 text-teal-600 border-teal-100',
    'Waiting For Approval': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    Rejected: 'bg-red-50 text-red-600 border-red-100',
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Operations Command Center</h1>
          <p className="text-charcoal-400 text-sm mt-1">Full business health in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportRequests(filteredRequests)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 transition-all">Export Requests</button>
          <button onClick={() => exportUsers(users)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 transition-all">Export Users</button>
          <button onClick={() => exportReminders(allReminders)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 transition-all">Export Reminders</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['overview', 'queues', 'sla', 'health', 'performance'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t ? 'bg-charcoal-800 text-white' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
          >{t === 'overview' ? 'Overview' : t === 'queues' ? 'Queues' : t === 'sla' ? 'SLA' : t === 'health' ? 'Health' : 'Performance'}</button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">Filters</span>
          <select value={filters.customer} onChange={(e) => handleFilter('customer', e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-charcoal-100 bg-white">
            <option value="">All Customers</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.teamMember} onChange={(e) => handleFilter('teamMember', e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-charcoal-100 bg-white">
            <option value="">All Team</option>
            {teamMembers.map((tm) => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => handleFilter('status', e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-charcoal-100 bg-white">
            <option value="">All Statuses</option>
            {validStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => handleFilter('priority', e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-charcoal-100 bg-white">
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select value={filters.plan} onChange={(e) => handleFilter('plan', e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-charcoal-100 bg-white">
            <option value="">All Plans</option>
            <option value="Personal">Personal</option>
            <option value="Professional">Professional</option>
            <option value="Concierge">Concierge</option>
          </select>
          {(filters.customer || filters.teamMember || filters.status || filters.priority || filters.plan) && (
            <button onClick={() => setFilters({ customer: '', teamMember: '', status: '', priority: '', plan: '' })}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >Clear</button>
          )}
        </div>
      </div>

      {/* Tab: Overview - Metrics */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Active Customers', value: metrics.totalCustomers, color: 'bg-primary-50 text-primary-600' },
              { label: 'Team Members', value: metrics.totalTeam, color: 'bg-indigo-50 text-indigo-600' },
              { label: 'Active Requests', value: metrics.activeRequests, color: 'bg-blue-50 text-blue-600' },
              { label: 'Waiting for Customer', value: metrics.waitingForCustomer, color: 'bg-orange-50 text-orange-600' },
              { label: 'In Progress', value: metrics.inProgress, color: 'bg-amber-50 text-amber-600' },
              { label: 'Completed This Month', value: metrics.completedThisMonth, color: 'bg-green-50 text-green-600' },
              { label: 'Overdue Reminders', value: metrics.overdueReminders, color: 'bg-red-50 text-red-600' },
              { label: 'Near Plan Limit', value: metrics.nearLimit, color: 'bg-orange-50 text-orange-600' },
              { label: 'Unread Notifications', value: metrics.unreadNotifications, color: 'bg-purple-50 text-purple-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-charcoal-100 p-4">
                <p className="font-serif text-2xl font-bold text-charcoal-800">{stat.value}</p>
                <p className={`text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${stat.color}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Queue Summary */}
          <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-charcoal-100">
              <h2 className="font-serif text-base font-semibold text-charcoal-800">Request Queue Summary</h2>
            </div>
            <div className="grid grid-cols-5 divide-x divide-charcoal-50">
              {statusQueueOrder.map((s) => (
                <div key={s} className="p-4 text-center">
                  <p className="font-serif text-2xl font-bold text-charcoal-800">{queueCounts[s] || 0}</p>
                  <p className="text-[10px] font-semibold mt-1 text-charcoal-400">{statusLabels[s]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Health Summary & Team Performance Summary */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
              <h2 className="font-serif text-base font-semibold text-charcoal-800 mb-3">Customer Health</h2>
              {['Attention Required', 'Watch', 'Healthy'].map((lbl) => {
                const count = customerHealth.filter((c) => c.health.label === lbl).length
                const colors = { 'Attention Required': { bar: 'bg-red-500', text: 'text-red-600' }, Watch: { bar: 'bg-amber-500', text: 'text-amber-600' }, Healthy: { bar: 'bg-green-500', text: 'text-green-600' } }
                const c = colors[lbl]
                const pct = customerHealth.length > 0 ? Math.round((count / customerHealth.length) * 100) : 0
                return (
                  <div key={lbl} className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`font-medium ${c.text}`}>{lbl}</span>
                      <span className="text-charcoal-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-charcoal-50 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
              <h2 className="font-serif text-base font-semibold text-charcoal-800 mb-3">Team Performance</h2>
              {teamPerformance.length === 0 ? (
                <p className="text-sm text-charcoal-400">No team members.</p>
              ) : (
                teamPerformance.map((tm) => (
                  <div key={tm.id} className="flex items-center justify-between py-2 border-b border-charcoal-50 last:border-0">
                    <span className="text-sm font-medium text-charcoal-700">{tm.name}</span>
                    <span className="text-xs text-charcoal-400">{tm.assigned} assigned, {tm.completed} completed</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Tab: Queues */}
      {tab === 'queues' && (
        <div className="space-y-4">
          {statusQueueOrder.map((s) => {
            const items = filteredRequests.filter((r) => r.status === s)
            return (
              <div key={s} className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
                <div className={`px-5 py-3 border-b flex items-center justify-between ${s === 'Completed' ? 'border-green-100' : s === 'Waiting for Customer' ? 'border-orange-100' : 'border-charcoal-100'}`}>
                  <h2 className="font-serif text-base font-semibold text-charcoal-800">{statusLabels[s]}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-charcoal-50 text-charcoal-500">{items.length}</span>
                </div>
                <div className="divide-y divide-charcoal-50">
                  {items.length === 0 ? (
                    <p className="text-sm text-charcoal-400 text-center py-6">No requests in this queue.</p>
                  ) : (
                    items.slice(0, 10).map((r) => (
                      <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-charcoal-800 truncate">{r.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-charcoal-400">{r.userName || 'Unknown'}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[r.priority] || ''}`}>{r.priority}</span>
                            {r.assignedTo && <span className="text-[10px] text-charcoal-400">Assigned</span>}
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${slaColor(hoursOpen(r.created))}`}>{hoursOpen(r.created)}h</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab: SLA */}
      {tab === 'sla' && (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-serif text-base font-semibold text-charcoal-800">SLA Monitoring</h2>
            <p className="text-xs text-charcoal-400 mt-1">Green &lt;24h, Amber 24-48h, Red &gt;48h</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-charcoal-400 uppercase tracking-wider bg-charcoal-50/50">
                  <th className="px-5 py-3">Request</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Last Updated</th>
                  <th className="px-5 py-3">Hours Open</th>
                  <th className="px-5 py-3">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {slaRequests.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-sm text-charcoal-400">No requests found.</td></tr>
                ) : (
                  slaRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-charcoal-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-charcoal-800">{r.title}</td>
                      <td className="px-5 py-3 text-charcoal-500">{r.userName || 'Unknown'}</td>
                      <td className="px-5 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[r.status] || 'bg-charcoal-50 text-charcoal-500'}`}>{r.status}</span></td>
                      <td className="px-5 py-3 text-charcoal-400 text-xs">{r.created ? new Date(r.created).toLocaleString() : '-'}</td>
                      <td className="px-5 py-3 text-charcoal-400 text-xs">{r.updatedAt || '-'}</td>
                      <td className="px-5 py-3 font-mono text-xs">{r.hoursOpen}h</td>
                      <td className="px-5 py-3"><span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${slaColor(r.hoursOpen)}`}>{r.hoursOpen < 24 ? 'Good' : r.hoursOpen < 48 ? 'Warning' : 'Critical'}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Customer Health */}
      {tab === 'health' && (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-serif text-base font-semibold text-charcoal-800">Customer Health Scores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-charcoal-400 uppercase tracking-wider bg-charcoal-50/50">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Active Reqs</th>
                  <th className="px-5 py-3">Overdue</th>
                  <th className="px-5 py-3">Usage</th>
                  <th className="px-5 py-3">Last Activity</th>
                  <th className="px-5 py-3">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {customerHealth.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-sm text-charcoal-400">No customers found.</td></tr>
                ) : (
                  customerHealth.map((c) => (
                    <tr key={c.id} className="hover:bg-charcoal-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-charcoal-800">{c.name}</td>
                      <td className="px-5 py-3 text-charcoal-500">{c.subscriptionPlan}</td>
                      <td className="px-5 py-3">{c.activeRequests}</td>
                      <td className="px-5 py-3">{overdueReminders.filter((r) => r.userId === c.id).length}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-charcoal-50 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${c.health.label === 'Healthy' ? 'bg-green-500' : c.health.label === 'Watch' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(c.taskUsage || 0, 100)}%` }} />
                          </div>
                          <span className="text-xs text-charcoal-400">{c.taskUsage || 0}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-charcoal-400">{c.lastLogin ? new Date(c.lastLogin).toLocaleDateString() : 'Never'}</td>
                      <td className="px-5 py-3"><span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${c.health.color}`}>{c.health.label}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Team Performance */}
      {tab === 'performance' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {teamPerformance.length === 0 ? (
            <div className="bg-white rounded-2xl border border-charcoal-100 p-8 text-center col-span-2">
              <p className="text-sm text-charcoal-400">No team members found.</p>
            </div>
          ) : (
            teamPerformance.map((tm) => (
              <div key={tm.id} className="bg-white rounded-2xl border border-charcoal-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                    {tm.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-charcoal-800">{tm.name}</h3>
                    <p className="text-xs text-charcoal-400">{tm.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <p className="text-lg font-bold text-blue-600">{tm.assigned}</p>
                    <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Assigned</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50">
                    <p className="text-lg font-bold text-green-600">{tm.completed}</p>
                    <p className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Completed</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50">
                    <p className="text-lg font-bold text-purple-600">{tm.avgCompletionHours > 0 ? `${tm.avgCompletionHours}h` : '-'}</p>
                    <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider">Avg Time</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50">
                    <p className="text-lg font-bold text-amber-600">{tm.openCount}</p>
                    <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Open</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
