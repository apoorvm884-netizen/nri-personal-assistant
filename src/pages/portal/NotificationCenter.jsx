import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'

const typeIcons = {
  info: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
  new_request: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  request_assigned: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  status_changed: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  request_accepted: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  need_information: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  new_message: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  approval_requested: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  completed: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  rejected: 'M6 18L18 6M6 6l12 12',
  reminder_due: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  reminder_overdue: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
  customer_waiting: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
  plan_near_limit: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  user_disabled: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  user_enabled: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  new_customer: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  plan_warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
}

const typeColors = {
  info: { bg: 'bg-primary-50', text: 'text-primary-600', icon: 'text-primary-500' },
  new_request: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
  request_assigned: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' },
  status_changed: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'text-cyan-500' },
  request_accepted: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
  need_information: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
  new_message: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
  approval_requested: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' },
  completed: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  reminder_due: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
  reminder_overdue: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  customer_waiting: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
  plan_near_limit: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  user_disabled: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  user_enabled: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
  new_customer: { bg: 'bg-teal-50', text: 'text-teal-600', icon: 'text-teal-500' },
  plan_warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
}

const typeLabels = {
  info: 'Info',
  new_request: 'New Request',
  request_assigned: 'Assigned',
  status_changed: 'Status Update',
  request_accepted: 'Accepted',
  need_information: 'Info Needed',
  new_message: 'Message',
  approval_requested: 'Approval',
  completed: 'Completed',
  rejected: 'Rejected',
  reminder_due: 'Reminder Due',
  reminder_overdue: 'Overdue',
  customer_waiting: 'Waiting',
  plan_near_limit: 'Plan Warning',
  user_disabled: 'Disabled',
  user_enabled: 'Re-enabled',
  new_customer: 'New Customer',
  plan_warning: 'Plan Warning',
}

export default function NotificationCenter() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAuth()
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('')

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const availableTypes = useMemo(() => {
    const types = [...new Set(notifications.map((n) => n.type))]
    return types.sort()
  }, [notifications])

  const filtered = useMemo(() => {
    let result = notifications
    if (filter === 'unread') {
      result = result.filter((n) => !n.read)
    }
    if (typeFilter) {
      result = result.filter((n) => n.type === typeFilter)
    }
    return result
  }, [notifications, filter, typeFilter])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Notifications</h1>
          <p className="text-charcoal-400 text-sm mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllNotificationsRead}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all"
            >
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearNotifications}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => { setFilter('all'); setTypeFilter('') }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === 'all' && !typeFilter ? 'bg-primary-500 text-white' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'}`}
        >All ({notifications.length})</button>
        <button onClick={() => { setFilter('unread'); setTypeFilter('') }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === 'unread' && !typeFilter ? 'bg-primary-500 text-white' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'}`}
        >Unread ({unreadCount})</button>
        {availableTypes.map((t) => (
          <button key={t} onClick={() => { setFilter('all'); setTypeFilter(t) }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${typeFilter === t ? 'bg-primary-500 text-white' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'}`}
          >{typeLabels[t] || t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-charcoal-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <p className="text-charcoal-400 text-sm">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, 100).map((n) => {
            const colors = typeColors[n.type] || typeColors.info
            return (
              <div
                key={n.id}
                onClick={() => { if (!n.read) markNotificationRead(n.id) }}
                className={`bg-white rounded-xl border p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-sm ${n.read ? 'border-charcoal-100' : 'border-primary-200 bg-primary-50/20'}`}
              >
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[n.type] || typeIcons.info} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${n.read ? 'text-charcoal-600' : 'text-charcoal-800'}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-charcoal-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-charcoal-300 mt-1">{n.createdAt}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block ${colors.bg} ${colors.text}`}>{typeLabels[n.type] || n.type}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
