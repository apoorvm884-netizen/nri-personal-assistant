import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as lifeProfileService from '../../services/lifeProfileService'

const notifTypeColors = {
  reminder_due: 'bg-amber-50 text-amber-600',
  reminder_overdue: 'bg-red-50 text-red-600',
  plan_near_limit: 'bg-red-50 text-red-600',
  status_changed: 'bg-cyan-50 text-cyan-600',
  new_request: 'bg-blue-50 text-blue-600',
  info: 'bg-primary-50 text-primary-600',
}

const typeLabels = { 'one-time': 'One-time', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' }
const prefLabels = { app: 'App', email: 'Email', both: 'Both' }

const statusColors = {
  Submitted: 'bg-amber-50 text-amber-600',
  Assigned: 'bg-blue-50 text-blue-600',
  Researching: 'bg-purple-50 text-purple-600',
  'Waiting for Customer': 'bg-orange-50 text-orange-600',
  Approved: 'bg-teal-50 text-teal-600',
  'In Progress': 'bg-primary-50 text-primary-600',
  Completed: 'bg-green-50 text-green-600',
  Cancelled: 'bg-red-50 text-red-600',
}

const priorityColors = {
  High: 'bg-red-50 text-red-600 border-red-100',
  Medium: 'bg-amber-50 text-amber-600 border-amber-100',
  Low: 'bg-blue-50 text-blue-600 border-blue-100',
}

export default function Dashboard() {
  const { requests, reminders, notifications, user, planLimits, remainingTasks, totalAvailableTasks, markNotificationRead } = useAuth()

  const needAction = useMemo(() =>
    requests.filter((r) => r.actionRequired && r.status !== 'Completed' && r.status !== 'Cancelled'),
    [requests],
  )

  const awaitingTeam = useMemo(() =>
    requests.filter((r) => !r.actionRequired && r.status !== 'Completed' && r.status !== 'Cancelled'),
    [requests],
  )

  const recentlyCompleted = useMemo(() =>
    requests.filter((r) => r.status === 'Completed' || r.status === 'Cancelled').slice(0, 4),
    [requests],
  )

  const upcomingReminders = useMemo(() => {
    return reminders
      .filter((r) => !r.completed)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
  }, [reminders])

  const [lifeProfile, setLifeProfile] = useState({ subscriptions: [], cards: [] })
  useEffect(() => {
    if (!user) return
    lifeProfileService.getLifeProfile(user.id).then((p) => {
      if (p) setLifeProfile(p)
    }).catch(() => {})
  }, [user])

  const isConcierge = user?.subscriptionPlan === 'Concierge'
  const usagePercent = isConcierge ? 0 : Math.min(100, Math.round(((user?.taskUsage || 0) / Math.max(1, totalAvailableTasks)) * 100))
  const isLocked = (remainingTasks <= 0 && user?.subscriptionPlan !== 'Concierge')

  const upcomingRenewals = useMemo(() => {
    const now = new Date()
    return lifeProfile.subscriptions
      .filter((s) => s.renewalDate)
      .map((s) => ({
        ...s,
        daysUntil: Math.ceil((new Date(s.renewalDate) - now) / (1000 * 60 * 60 * 24)),
      }))
      .filter((s) => s.daysUntil >= 0 && s.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3)
  }, [lifeProfile.subscriptions])

  const upcomingBills = useMemo(() => {
    const now = new Date()
    return lifeProfile.cards
      .filter((c) => c.dueDate)
      .map((c) => {
        const due = new Date(c.dueDate)
        const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
        return { ...c, daysUntil }
      })
      .filter((c) => c.daysUntil >= 0 && c.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3)
  }, [lifeProfile.cards])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    return lifeProfile.family.members
      .filter((m) => m.birthday)
      .map((m) => {
        const bd = new Date(m.birthday)
        const nextBd = new Date(currentYear, bd.getMonth(), bd.getDate())
        if (nextBd < now) nextBd.setFullYear(currentYear + 1)
        const daysUntil = Math.ceil((nextBd - now) / (1000 * 60 * 60 * 24))
        return { name: m.name, event: 'Birthday', date: nextBd.toISOString().split('T')[0], daysUntil }
      })
      .filter((e) => e.daysUntil >= 0 && e.daysUntil <= 60)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3)
  }, [lifeProfile.family.members])

  const today = new Date().toISOString().split('T')[0]
  const isUrgent = (date) => date === today || date < today

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-charcoal-400 text-sm mt-1">Here's your support overview for today.</p>
      </div>

      {/* Plan card + Stats row */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 md:p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-primary-100 text-xs uppercase tracking-wider font-medium">Current Plan</p>
            <h2 className="font-serif text-2xl font-bold mt-1">{user?.subscriptionPlan || 'Personal'}</h2>
            <p className="text-primary-200 text-sm mt-1">
              {isConcierge ? 'Unlimited tasks' : `${user?.taskUsage || 0} tasks used this month`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-primary-100 text-xs uppercase tracking-wider">Remaining Tasks</p>
              <p className="font-serif text-3xl font-bold">{remainingTasks}</p>
            </div>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-primary-800 rounded-xl text-sm font-semibold hover:bg-accent-400 transition-all"
            >
              {isLocked ? 'Upgrade' : 'Manage'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-primary-200">Monthly Usage</span>
            <span className="text-white font-medium">{isConcierge ? '—' : `${user?.taskUsage || 0} / ${totalAvailableTasks}`}</span>
          </div>
          <div className="h-2.5 bg-primary-800/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${usagePercent >= 90 ? 'bg-red-400' : 'bg-accent-500'}`}
              style={{ width: `${isConcierge ? 0 : Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Link to="/portal/requests/active" className="bg-white rounded-xl border border-charcoal-100 p-4 hover:shadow-sm transition-shadow">
          <p className="font-serif text-2xl font-bold text-charcoal-800">{needAction.length}</p>
          <p className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-600">Action Required</p>
        </Link>
        <Link to="/portal/requests/active" className="bg-white rounded-xl border border-charcoal-100 p-4 hover:shadow-sm transition-shadow">
          <p className="font-serif text-2xl font-bold text-charcoal-800">{awaitingTeam.length}</p>
          <p className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Awaiting Team</p>
        </Link>
        <Link to="/portal/reminders" className="bg-white rounded-xl border border-charcoal-100 p-4 hover:shadow-sm transition-shadow">
          <p className="font-serif text-2xl font-bold text-charcoal-800">{reminders.filter((r) => !r.completed).length}</p>
          <p className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Reminders</p>
        </Link>
        <Link to="/portal/requests/completed" className="bg-white rounded-xl border border-charcoal-100 p-4 hover:shadow-sm transition-shadow">
          <p className="font-serif text-2xl font-bold text-charcoal-800">{recentlyCompleted.length}</p>
          <p className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-600">Completed</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Requests Requiring Action */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800">Action Required</h2>
              {needAction.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{needAction.length}</span>
              )}
            </div>
            <Link to="/portal/requests/active" className="text-xs font-medium text-primary-500 hover:text-primary-600">View All</Link>
          </div>
          <div className="p-5 space-y-3">
            {needAction.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-charcoal-400 text-sm">All caught up — nothing needs your attention.</p>
              </div>
            ) : (
              needAction.slice(0, 3).map((req) => (
                <div key={req.id} className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-red-50/50 border border-red-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-charcoal-400">{req.id}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Action Needed</span>
                    </div>
                    <p className="text-sm font-medium text-charcoal-800 truncate">{req.title}</p>
                    {req.actionRequiredNote && (
                      <p className="text-xs text-charcoal-500 mt-0.5 line-clamp-1">{req.actionRequiredNote}</p>
                    )}
                  </div>
                  <Link to="/portal/requests/active"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all flex-shrink-0"
                  >Respond</Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Awaiting Team Response */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-serif text-lg font-semibold text-charcoal-800">Awaiting Team</h2>
            <Link to="/portal/requests/active" className="text-xs font-medium text-primary-500 hover:text-primary-600">View All</Link>
          </div>
          <div className="p-5 space-y-3">
            {awaitingTeam.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-charcoal-400 text-sm">No requests awaiting team response.</p>
              </div>
            ) : (
              awaitingTeam.slice(0, 3).map((req) => (
                <div key={req.id} className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-charcoal-50/50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-charcoal-400">{req.id}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[req.status] || ''}`}>{req.status}</span>
                    </div>
                    <p className="text-sm font-medium text-charcoal-800 truncate">{req.title}</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">{req.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recently Completed */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-serif text-lg font-semibold text-charcoal-800">Recently Completed</h2>
            <Link to="/portal/requests/completed" className="text-xs font-medium text-primary-500 hover:text-primary-600">View All</Link>
          </div>
          <div className="p-5 space-y-3">
            {recentlyCompleted.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-charcoal-400 text-sm">No requests completed yet.</p>
              </div>
            ) : (
              recentlyCompleted.map((req) => (
                <div key={req.id} className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-charcoal-50/50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-charcoal-400">{req.id}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityColors[req.priority]}`}>{req.priority}</span>
                      {req.outcome && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600">{req.outcome}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-charcoal-800 truncate">{req.title}</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">{req.category} &middot; {req.updatedAt}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 bg-green-50 text-green-600">{req.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-serif text-lg font-semibold text-charcoal-800">Upcoming Reminders</h2>
            <Link to="/portal/reminders" className="text-xs font-medium text-primary-500 hover:text-primary-600">View All</Link>
          </div>
          <div className="p-5 space-y-3">
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-charcoal-400 text-sm">All caught up!</p>
              </div>
            ) : (
              upcomingReminders.map((rem) => {
                const urgent = isUrgent(rem.date)
                return (
                  <div key={rem.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-charcoal-50/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${urgent ? 'bg-red-50' : 'bg-primary-50'}`}>
                      <svg className={`w-4 h-4 ${urgent ? 'text-red-500' : 'text-primary-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-800">{rem.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-charcoal-400">{rem.date} at {rem.time}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">{typeLabels[rem.type]}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-600">{prefLabels[rem.preference]}</span>
                        {urgent && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">Due Soon</span>}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl border border-charcoal-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-serif text-lg font-semibold text-charcoal-800">Recent Notifications</h2>
            <Link to="/portal/notifications" className="text-xs font-medium text-primary-500 hover:text-primary-600">View All</Link>
          </div>
          <div className="p-5 space-y-2">
            {notifications.filter((n) => !n.read).length === 0 ? (
              <div className="text-center py-4">
                <p className="text-charcoal-400 text-sm">No unread notifications.</p>
              </div>
            ) : (
              notifications.filter((n) => !n.read).slice(0, 5).map((n) => {
                const nc = notifTypeColors[n.type] || 'bg-charcoal-50 text-charcoal-500'
                return (
                  <div key={n.id} onClick={() => markNotificationRead(n.id)}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary-50/30 border border-primary-100 cursor-pointer hover:bg-primary-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-800">{n.title}</p>
                      <p className="text-xs text-charcoal-500 mt-0.5">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${nc}`}>{n.type}</span>
                        <span className="text-[10px] text-charcoal-300">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Integration - Upcoming Renewals, Bills, Family Events */}
      {(upcomingRenewals.length > 0 || upcomingBills.length > 0 || upcomingEvents.length > 0) && (
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {upcomingRenewals.length > 0 && (
            <div className="bg-white rounded-2xl border border-charcoal-100">
              <div className="px-5 py-4 border-b border-charcoal-100">
                <h2 className="font-serif text-base font-semibold text-charcoal-800">Upcoming Renewals</h2>
              </div>
              <div className="p-5 space-y-3">
                {upcomingRenewals.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-purple-50/50">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-800">{s.serviceName}</p>
                      <p className="text-xs text-charcoal-400">Due in {s.daysUntil} day{s.daysUntil !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingBills.length > 0 && (
            <div className="bg-white rounded-2xl border border-charcoal-100">
              <div className="px-5 py-4 border-b border-charcoal-100">
                <h2 className="font-serif text-base font-semibold text-charcoal-800">Upcoming Bills</h2>
              </div>
              <div className="p-5 space-y-3">
                {upcomingBills.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50/50">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-800">{c.nickname}</p>
                      <p className="text-xs text-charcoal-400">Due in {c.daysUntil} day{c.daysUntil !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingEvents.length > 0 && (
            <div className="bg-white rounded-2xl border border-charcoal-100">
              <div className="px-5 py-4 border-b border-charcoal-100">
                <h2 className="font-serif text-base font-semibold text-charcoal-800">Upcoming Family Events</h2>
              </div>
              <div className="p-5 space-y-3">
                {upcomingEvents.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary-50/50">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-800">{e.name}'s {e.event}</p>
                      <p className="text-xs text-charcoal-400">In {e.daysUntil} day{e.daysUntil !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
