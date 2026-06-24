import { useMemo } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { getPocketBase } from '../../lib/pocketbase'
import { Link } from 'react-router-dom'

export default function TeamDashboard() {
  const { requests, allReminders, adminNotifications } = useAdmin()
  const pb = getPocketBase()
  const currentUserId = pb.authStore.record?.id

  const assigned = useMemo(() => {
    return requests.filter((r) => r.assignedTo === currentUserId)
  }, [requests, currentUserId])

  const active = useMemo(() => {
    return assigned.filter((r) => !['Completed', 'Cancelled'].includes(r.status))
  }, [assigned])

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return assigned.filter((r) => r.status === 'Completed' && r.updatedAt === today)
  }, [assigned])

  const highPriority = useMemo(() => {
    return active.filter((r) => r.priority === 'High')
  }, [active])

  const todayStr = new Date().toISOString().split('T')[0]

  const upcomingReminders = useMemo(() => {
    return allReminders.filter((r) => {
      if (r.completed || r.cancelled) return false
      const daysUntil = Math.ceil((new Date(r.date) - new Date(todayStr)) / (1000 * 60 * 60 * 24))
      return daysUntil >= 0 && daysUntil <= 7
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [allReminders, todayStr])

  const overdueReminders = useMemo(() => {
    return allReminders.filter((r) => {
      if (r.completed || r.cancelled) return false
      return r.date < todayStr
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [allReminders, todayStr])

  const todayReminders = useMemo(() => {
    return allReminders.filter((r) => {
      if (r.completed || r.cancelled) return false
      return r.date === todayStr
    })
  }, [allReminders, todayStr])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Team Dashboard</h1>
        <p className="text-charcoal-500 text-sm mt-1">Manage your assigned requests and reminders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Active Requests</p>
          <p className="text-2xl font-bold text-charcoal-800">{active.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Completed Today</p>
          <p className="text-2xl font-bold text-charcoal-800">{completedToday.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">High Priority</p>
          <p className="text-2xl font-bold text-charcoal-800">{highPriority.length}</p>
        </div>
      </div>

      {/* Reminder Sections */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-charcoal-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">Today's Reminders</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">{todayReminders.length}</span>
          </div>
          <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
            {todayReminders.length === 0 && <p className="text-xs text-charcoal-400 text-center py-4">No reminders for today.</p>}
            {todayReminders.map((rem) => (
              <div key={rem.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50/50">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-charcoal-700 truncate">{rem.title}</p>
                  <p className="text-[10px] text-charcoal-400 truncate">{rem.category || 'Custom'} &middot; {rem.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
            <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Upcoming (7 Days)</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">{upcomingReminders.length}</span>
          </div>
          <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
            {upcomingReminders.length === 0 && <p className="text-xs text-charcoal-400 text-center py-4">No upcoming reminders.</p>}
            {upcomingReminders.map((rem) => (
              <div key={rem.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/30">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-charcoal-700 truncate">{rem.title}</p>
                  <p className="text-[10px] text-charcoal-400">{rem.date} &middot; {rem.category || 'Custom'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 flex items-center justify-between bg-red-50/50">
            <h2 className="text-xs font-semibold text-red-700 uppercase tracking-wider">Overdue</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">{overdueReminders.length}</span>
          </div>
          <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
            {overdueReminders.length === 0 && <p className="text-xs text-charcoal-400 text-center py-4">No overdue reminders.</p>}
            {overdueReminders.map((rem) => (
              <div key={rem.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50/50 border border-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-charcoal-700 truncate">{rem.title}</p>
                  <p className="text-[10px] text-red-600 font-medium">Overdue: {rem.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Alerts */}
      <div className="bg-white rounded-2xl border border-charcoal-100 mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
          <h2 className="font-serif text-base font-semibold text-charcoal-800">Assigned Alerts</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">{adminNotifications.filter((n) => !n.read).length}</span>
        </div>
        <div className="p-5 space-y-2 max-h-60 overflow-y-auto">
          {adminNotifications.filter((n) => !n.read).length === 0 ? (
            <p className="text-xs text-charcoal-400 text-center py-4">No alerts.</p>
          ) : (
            adminNotifications.filter((n) => !n.read).slice(0, 10).map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary-50/30 border border-primary-100">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal-800">{n.title}</p>
                  <p className="text-xs text-charcoal-500 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-charcoal-300 mt-1">{n.createdAt}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
              </div>
            ))
          )}
        </div>
      </div>

      {active.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-8 text-center">
          <p className="text-charcoal-400 text-sm">No requests assigned to you yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal-100">
            <h2 className="font-serif text-base font-semibold text-charcoal-800">Your Active Requests</h2>
          </div>
          <div className="divide-y divide-charcoal-50">
            {active.map((req) => (
              <div key={req.id} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal-800 truncate">{req.title}</p>
                  <p className="text-xs text-charcoal-400">{req.userName || 'Unknown'} &middot; {req.status}</p>
                </div>
                {req.nextAction && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">{req.nextAction}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
