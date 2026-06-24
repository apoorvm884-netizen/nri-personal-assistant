import { useMemo, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'

const validStatuses = ['Submitted', 'Accepted', 'Need Information', 'Customer Responded', 'In Progress', 'Waiting For Approval', 'Completed', 'Rejected']

export default function SystemHealth() {
  const { requests, users, allReminders } = useAdmin()
  const [fixedIds, setFixedIds] = useState(new Set())

  const customerIds = useMemo(() => new Set(users.filter((u) => u.role === 'Customer').map((u) => u.id)), [users])
  const teamIds = useMemo(() => new Set(users.filter((u) => u.role === 'Team Member').map((u) => u.id)), [users])
  const allUserIds = useMemo(() => new Set(users.map((u) => u.id)), [users])

  const checks = useMemo(() => {
    const missingAssignments = requests.filter((r) => r.status !== 'Submitted' && r.assignedTo && !teamIds.has(r.assignedTo) && !customerIds.has(r.assignedTo))
    const invalidStatuses = requests.filter((r) => !validStatuses.includes(r.status))
    const requestsWithoutOwners = requests.filter((r) => r.userId && !allUserIds.has(r.userId))
    const orphanReminders = allReminders.filter((r) => r.userId && !allUserIds.has(r.userId))
    const disabledUsersWithWork = users.filter((u) => u.disabled && (u.taskUsage || 0) > 0)

    return [
      {
        id: 'missingAssignments',
        label: 'Missing Assignments',
        description: 'Requests with invalid assignedTo reference',
        count: missingAssignments.length,
        items: missingAssignments,
        severity: missingAssignments.length > 0 ? 'warning' : 'ok',
      },
      {
        id: 'invalidStatuses',
        label: 'Invalid Statuses',
        description: 'Requests with status values outside the valid pipeline',
        count: invalidStatuses.length,
        items: invalidStatuses,
        severity: invalidStatuses.length > 0 ? 'error' : 'ok',
      },
      {
        id: 'requestsWithoutOwners',
        label: 'Orphan Requests',
        description: 'Requests whose userId does not match any existing user',
        count: requestsWithoutOwners.length,
        items: requestsWithoutOwners,
        severity: requestsWithoutOwners.length > 0 ? 'error' : 'ok',
      },
      {
        id: 'orphanReminders',
        label: 'Orphan Reminders',
        description: 'Reminders whose userId does not match any existing user',
        count: orphanReminders.length,
        items: orphanReminders,
        severity: orphanReminders.length > 0 ? 'warning' : 'ok',
      },
      {
        id: 'disabledUsersWithWork',
        label: 'Disabled Users With Active Work',
        description: 'Disabled users who still have task usage data',
        count: disabledUsersWithWork.length,
        items: disabledUsersWithWork,
        severity: disabledUsersWithWork.length > 0 ? 'warning' : 'ok',
      },
    ]
  }, [requests, users, allReminders, customerIds, teamIds, allUserIds])

  const totalIssues = checks.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">System Health</h1>
        <p className="text-charcoal-400 text-sm mt-1">
          {totalIssues === 0
            ? 'All systems healthy — no issues detected.'
            : `${totalIssues} issue${totalIssues !== 1 ? 's' : ''} found. Review below.`
          }
        </p>
      </div>

      <div className="space-y-4">
        {checks.map((check) => (
          <div key={check.id} className={`bg-white rounded-2xl border overflow-hidden ${
            check.severity === 'error' ? 'border-red-200' : check.severity === 'warning' ? 'border-amber-200' : 'border-green-200'
          }`}>
            <div className={`px-5 py-4 flex items-center justify-between ${
              check.severity === 'error' ? 'bg-red-50/50' : check.severity === 'warning' ? 'bg-amber-50/50' : 'bg-green-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  check.severity === 'error' ? 'bg-red-100 text-red-600' : check.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {check.severity === 'error' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    ) : check.severity === 'warning' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h2 className="font-serif text-base font-semibold text-charcoal-800">{check.label}</h2>
                  <p className="text-xs text-charcoal-400">{check.description}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                check.severity === 'error' ? 'bg-red-50 text-red-600' : check.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
              }`}>
                {check.count} {check.count === 1 ? 'issue' : 'issues'}
              </span>
            </div>

            {check.items.length > 0 && (
              <div className="divide-y divide-charcoal-50">
                {check.items.slice(0, 10).map((item) => (
                  <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-800 truncate">{item.title || item.name || item.id}</p>
                      <p className="text-xs text-charcoal-400">{item.id}</p>
                    </div>
                    <button
                      onClick={() => {
                        setFixedIds((prev) => new Set([...prev, `${check.id}-${item.id}`]))
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        fixedIds.has(`${check.id}-${item.id}`)
                          ? 'bg-green-50 text-green-600 cursor-default'
                          : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      }`}
                    >
                      {fixedIds.has(`${check.id}-${item.id}`) ? 'Acknowledged' : 'Acknowledge'}
                    </button>
                  </div>
                ))}
                {check.items.length > 10 && (
                  <p className="px-5 py-2 text-xs text-charcoal-400 text-center">
                    +{check.items.length - 10} more
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div className={`mt-8 rounded-2xl p-6 text-center ${
        totalIssues === 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
      }`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
          totalIssues === 0 ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          <svg className={`w-8 h-8 ${totalIssues === 0 ? 'text-green-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {totalIssues === 0 ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            )}
          </svg>
        </div>
        <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">
          {totalIssues === 0 ? 'All Systems Healthy' : 'Issues Detected'}
        </h2>
        <p className="text-sm text-charcoal-500">
          {totalIssues === 0
            ? 'All data integrity checks passed. No action needed.'
            : `${totalIssues} issue${totalIssues !== 1 ? 's' : ''} found. Review and fix the items above.`
          }
        </p>
      </div>
    </div>
  )
}
