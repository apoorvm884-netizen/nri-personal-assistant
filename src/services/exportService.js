function escapeCsv(val) {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function rowsToCsv(headers, rows) {
  const headerLine = headers.map(escapeCsv).join(',')
  const dataLines = rows.map((row) => headers.map((h) => escapeCsv(row[h] || '')).join(','))
  return [headerLine, ...dataLines].join('\n')
}

function download(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportRequests(requests) {
  const headers = ['id', 'title', 'category', 'priority', 'status', 'userId', 'userName', 'userPlan', 'created', 'updatedAt', 'assignedTo', 'nextAction', 'dueDate', 'outcome', 'actionRequired']
  const rows = requests.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    priority: r.priority,
    status: r.status,
    userId: r.userId,
    userName: r.userName,
    userPlan: r.userPlan,
    created: r.created,
    updatedAt: r.updatedAt || r.created,
    assignedTo: r.assignedTo || '',
    nextAction: r.nextAction || '',
    dueDate: r.dueDate || '',
    outcome: r.outcome || '',
    actionRequired: r.actionRequired ? 'Yes' : 'No',
  }))
  download(`requests-export-${Date.now()}.csv`, rowsToCsv(headers, rows))
}

export function exportUsers(users) {
  const headers = ['id', 'name', 'email', 'role', 'subscriptionPlan', 'taskUsage', 'extraTasksPurchased', 'tasksRemaining', 'disabled', 'created', 'lastLogin']
  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    subscriptionPlan: u.subscriptionPlan,
    taskUsage: u.taskUsage || 0,
    extraTasksPurchased: u.extraTasksPurchased || 0,
    tasksRemaining: u.tasksRemaining || 0,
    disabled: u.disabled ? 'Yes' : 'No',
    created: u.created,
    lastLogin: u.lastLogin || '',
  }))
  download(`users-export-${Date.now()}.csv`, rowsToCsv(headers, rows))
}

export function exportReminders(reminders) {
  const headers = ['id', 'userId', 'title', 'description', 'date', 'time', 'type', 'category', 'priority', 'preference', 'completed', 'cancelled', 'created']
  const rows = reminders.map((r) => ({
    id: r.id,
    userId: r.userId,
    title: r.title,
    description: r.description || '',
    date: r.date,
    time: r.time,
    type: r.type,
    category: r.category,
    priority: r.priority,
    preference: r.preference,
    completed: r.completed ? 'Yes' : 'No',
    cancelled: r.cancelled ? 'Yes' : 'No',
    created: r.created,
  }))
  download(`reminders-export-${Date.now()}.csv`, rowsToCsv(headers, rows))
}
