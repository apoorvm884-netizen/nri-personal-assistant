import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'

export default function AdminDashboard() {
  const { requests, users, totalUsers, planBreakdown, totalTasksUsed, totalTasksLimit, monthlyRevenue, reminderStats, adminNotifications } = useAdmin()
  const upgradeHistoryData = []

  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === 'Submitted').length
    const inProgress = requests.filter((r) => r.status === 'In Progress' || r.status === 'Assigned' || r.status === 'Researching').length
    const completed = requests.filter((r) => r.status === 'Completed').length
    const highPriority = requests.filter((r) => r.priority === 'High').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, pending, inProgress, completed, highPriority, completionRate }
  }, [requests])

  const customersNearLimit = useMemo(() => {
    return users.filter((u) => {
      if (u.role !== 'Customer') return false
      const limit = { Personal: 10, Professional: 25, Concierge: 75 }[u.subscriptionPlan] || 10
      const total = limit + (u.extraTasksPurchased || 0)
      const used = u.taskUsage || 0
      const remaining = total - used
      return remaining <= 3 && remaining > 0
    }).length
  }, [users])

  const recentActivity = useMemo(() => {
    return [...requests].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6)
  }, [requests])

  const statusColors = {
    Submitted: 'bg-amber-50 text-amber-600 border-amber-100',
    'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
    Completed: 'bg-green-50 text-green-600 border-green-100',
  }

  const priorityColors = {
    High: 'bg-red-50 text-red-600',
    Medium: 'bg-amber-50 text-amber-600',
    Low: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Admin Dashboard</h1>
            <p className="text-charcoal-400 text-sm mt-1">Overview of all client requests, user plans, and system metrics.</p>
          </div>
        </div>
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 md:gap-4 mb-8">
        {[
          { label: 'Total Requests', value: stats.total, color: 'bg-primary-50 text-primary-600 border-primary-100' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-600 border-amber-100' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-50 text-green-600 border-green-100' },
          { label: 'High Priority', value: stats.highPriority, color: 'bg-red-50 text-red-600 border-red-100' },
          { label: 'Completion', value: `${stats.completionRate}%`, color: 'bg-purple-50 text-purple-600 border-purple-100' },
          { label: 'Total Users', value: totalUsers, color: 'bg-sage-50 text-sage-600 border-sage-100' },
          { label: 'Monthly Rev', value: `$${monthlyRevenue}`, color: 'bg-accent-50 text-accent-700 border-accent-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-charcoal-100 p-3">
            <p className="font-serif text-xl md:text-2xl font-bold text-charcoal-800">{stat.value}</p>
            <p className={`text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${stat.color}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Task & Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">Total Customers</p>
          <p className="font-serif text-2xl font-bold text-charcoal-800">{users.filter((u) => u.role === 'Customer').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">Total Tasks Used</p>
          <p className="font-serif text-2xl font-bold text-charcoal-800">{totalTasksUsed}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">Customers Near Limit</p>
          <p className="font-serif text-2xl font-bold text-orange-600">{customersNearLimit}</p>
          <p className="text-[10px] text-orange-400 mt-1">Within 3 tasks of their plan limit</p>
        </div>
      </div>

      {/* Reminder Stats */}
      <div className="mb-8">
        <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-3">Reminder Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Active', value: reminderStats.totalActive, color: 'bg-primary-50 text-primary-600 border-primary-100' },
            { label: 'Due Today', value: reminderStats.dueToday, color: 'bg-amber-50 text-amber-600 border-amber-100' },
            { label: 'Due This Week', value: reminderStats.dueThisWeek, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Overdue', value: reminderStats.overdue, color: 'bg-red-50 text-red-600 border-red-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-charcoal-100 p-4">
              <p className="font-serif text-xl md:text-2xl font-bold text-charcoal-800">{stat.value}</p>
              <p className={`text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${stat.color}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Operations Alerts */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-5 md:p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-charcoal-800">Operations Alerts</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">{adminNotifications.filter((n) => !n.read).length} unread</span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {adminNotifications.filter((n) => !n.read).length === 0 ? (
            <p className="text-sm text-charcoal-400 text-center py-4">All clear — no alerts.</p>
          ) : (
            adminNotifications.filter((n) => !n.read).slice(0, 10).map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50/30 border border-red-100">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal-800">{n.title}</p>
                  <p className="text-xs text-charcoal-500 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-charcoal-300 mt-1">{n.createdAt}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5 md:p-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-4">Plan Distribution</h2>
          <div className="space-y-4">
             {['Personal', 'Professional', 'Concierge'].map((plan) => {
              const count = planBreakdown[plan] || 0
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
              const colors = {
                Personal: { bar: 'bg-primary-400', text: 'text-primary-600' },
                Professional: { bar: 'bg-primary-500', text: 'text-primary-700' },
                Concierge: { bar: 'bg-accent-500', text: 'text-accent-700' },
              }
              const c = colors[plan]
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-charcoal-700">{plan}</span>
                    <span className={`text-sm font-semibold ${c.text}`}>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-charcoal-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${c.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-100 p-5 md:p-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-4">Task Usage</h2>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-serif text-3xl font-bold text-charcoal-800">{totalTasksUsed}</span>
            <span className="text-sm text-charcoal-400">/ {totalTasksLimit === Infinity ? '∞' : totalTasksLimit} total</span>
          </div>
          <p className="text-xs text-charcoal-400 mb-4">Across all users this month</p>
          <div className="h-3 bg-charcoal-50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${totalTasksLimit === Infinity ? 0 : Math.min(100, Math.round((totalTasksUsed / totalTasksLimit) * 100))}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-primary-50">
              <p className="text-lg font-bold text-primary-600">{planBreakdown.Personal || 0}</p>
              <p className="text-[10px] text-primary-500">Personal</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-50">
              <p className="text-lg font-bold text-primary-600">{planBreakdown.Professional || 0}</p>
              <p className="text-[10px] text-primary-500">Professional</p>
            </div>
            <div className="p-2 rounded-lg bg-accent-50">
              <p className="text-lg font-bold text-accent-700">{planBreakdown.Concierge || 0}</p>
              <p className="text-[10px] text-accent-600">Concierge</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-100 p-5 md:p-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-4">Revenue</h2>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-serif text-3xl font-bold text-charcoal-800">${monthlyRevenue}</span>
            <span className="text-sm text-charcoal-400">/mo</span>
          </div>
          <p className="text-xs text-charcoal-400 mb-4">Projected monthly recurring revenue</p>
          <div className="space-y-2">
            {[
              { label: 'Personal', count: planBreakdown.Personal || 0, price: 10 },
              { label: 'Professional', count: planBreakdown.Professional || 0, price: 20 },
              { label: 'Concierge', count: planBreakdown.Concierge || 0, price: 49 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-charcoal-500">{item.label} ({item.count})</span>
                <span className="text-charcoal-700 font-medium">${item.count * item.price}</span>
              </div>
            ))}
            <div className="border-t border-charcoal-100 pt-2 flex items-center justify-between text-sm font-semibold">
              <span className="text-charcoal-800">Total</span>
              <span className="text-primary-600">${monthlyRevenue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade history */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-5 md:p-6 mb-8">
        <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-4">Upgrade History</h2>
        {upgradeHistoryData.length === 0 ? (
          <p className="text-sm text-charcoal-400">No upgrades recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-charcoal-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">From</th>
                  <th className="pb-3 pr-4">To</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {upgradeHistoryData.map((upg, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 text-charcoal-800 font-medium">{users.find((u) => u.id === upg.userId)?.name || upg.userId}</td>
                    <td className="py-3 pr-4 text-charcoal-400">{upg.from}</td>
                    <td className="py-3 pr-4"><span className="text-primary-600 font-medium">{upg.to}</span></td>
                    <td className="py-3 pr-4 text-charcoal-400">{upg.date}</td>
                    <td className="py-3 text-right text-charcoal-800 font-medium">+${upg.revenue}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Priority breakdown & Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5 md:p-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-4">Priority Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'High', count: stats.highPriority, color: 'bg-red-500' },
              { label: 'Medium', count: requests.filter((r) => r.priority === 'Medium').length, color: 'bg-amber-500' },
              { label: 'Low', count: requests.filter((r) => r.priority === 'Low').length, color: 'bg-blue-500' },
            ].map((item) => {
              const pct = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-charcoal-700">{item.label}</span>
                    <span className="text-sm text-charcoal-400">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-charcoal-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-serif text-lg font-semibold text-charcoal-800">Recent Activity</h2>
            <Link to="/admin/requests" className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">View All</Link>
          </div>
          <div className="p-5 space-y-2">
            {recentActivity.map((req) => (
              <div key={req.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-charcoal-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  req.status === 'Completed' ? 'bg-green-50 text-green-600'
                  : req.status === 'In Progress' ? 'bg-blue-50 text-blue-600'
                  : 'bg-amber-50 text-amber-600'
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {req.status === 'Completed' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    ) : req.status === 'In Progress' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal-800 truncate">{req.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priorityColors[req.priority]}`}>{req.priority}</span>
                    <span className="text-xs text-charcoal-400">{req.id}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0 ${statusColors[req.status]}`}>{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
