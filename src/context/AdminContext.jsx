import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { getPocketBase } from '../lib/pocketbase'
import * as requestService from '../services/requestService'
import * as messageService from '../services/messageService'
import * as notificationService from '../services/notificationService'
import * as reminderService from '../services/reminderService'
import { PLAN_LIMITS } from '../config/appConfig'

const AdminContext = createContext(null)

function now() {
  return new Date().toISOString()
}

function today() {
  return now().split('T')[0]
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const pb = getPocketBase()
    if (pb.authStore.isValid && (pb.authStore.record?.role === 'Admin' || pb.authStore.record?.role === 'Team Member')) {
      return pb.authStore.record
    }
    return null
  })
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [allReminders, setAllReminders] = useState([])
  const [adminNotifications, setAdminNotifications] = useState([])
  const unsubRef = useRef([])

  const addActivityLog = useCallback(async (id, entry) => {
    try {
      const current = await requestService.getRequestById(id)
      const log = [...(current.activityLog || []), { ...entry, timestamp: now() }]
      await requestService.updateRequest(id, { activityLog: log, updatedAt: today() })
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, activityLog: log } : r))
    } catch {
      // best effort
    }
  }, [])

  const loadAdminData = useCallback(async () => {
    try {
      const pb = getPocketBase()
      const adminId = pb.authStore.record?.id
      const [reqResult, userResult, remResult, notifResult] = await Promise.all([
        requestService.getRequests(),
        pb.collection('users').getList(1, 100, { filter: 'role != "Admin"' }),
        reminderService.getAllReminders(),
        adminId ? pb.collection('notifications').getList(1, 100, { sort: '-created', filter: `userId="${adminId}" || userId=null` }) : Promise.resolve({ items: [] }),
      ])
      const reqsWithMessages = await Promise.all((reqResult.items || []).map(async (req) => {
        try {
          const msgResult = await messageService.getMessagesByRequest(req.id)
          return { ...req, conversation: msgResult.items || [] }
        } catch {
          return { ...req, conversation: req.conversation || [] }
        }
      }))
      setRequests(reqsWithMessages)
      setUsers(userResult.items || [])
      setAllReminders(remResult.items || [])
      setAdminNotifications(notifResult.items || [])
    } catch {
      // PB may not be ready
    }
  }, [])

  useEffect(() => {
    const pb = getPocketBase()
    const unsubAuth = pb.authStore.onChange((token, record) => {
      if (record && (record.role === 'Admin' || record.role === 'Team Member')) {
        setAdmin(record)
        loadAdminData()
      } else {
        setAdmin(null)
        setRequests([])
        setUsers([])
      }
    })
    if (admin) {
      loadAdminData()
    }
    return () => unsubAuth()
  }, [admin, loadAdminData])

  useEffect(() => {
    const unsubs = unsubRef.current
    if (admin) {
      const unsubReq = requestService.subscribeRequests('', (e) => {
        if (e.action === 'create') {
          const record = { ...e.record, conversation: [] }
          messageService.getMessagesByRequest(e.record.id).then((msgResult) => {
            record.conversation = msgResult.items || []
            setRequests((prev) => [record, ...prev])
          }).catch(() => {
            setRequests((prev) => [record, ...prev])
          })
        } else if (e.action === 'update') {
          setRequests((prev) => prev.map((r) => r.id === e.record.id ? { ...r, ...e.record, conversation: r.conversation || [] } : r))
        } else if (e.action === 'delete') {
          setRequests((prev) => prev.filter((r) => r.id !== e.record.id))
        }
      })
      const unsubNotif = notificationService.subscribeNotifications('userId=null', (e) => {
        // Admin notifications: only update local state, no need to store separately
      })
      unsubs.push(unsubReq, unsubNotif)
    }
    return () => {
      unsubs.forEach((fn) => fn())
      unsubs.length = 0
    }
  }, [admin])

  const login = useCallback(async (email, password) => {
    const pb = getPocketBase()
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      if (authData.record.role !== 'Admin' && authData.record.role !== 'Team Member') {
        pb.authStore.clear()
        return false
      }
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    const pb = getPocketBase()
    pb.authStore.clear()
    setAdmin(null)
    setRequests([])
    setUsers([])
  }, [])

  const persistNotification = useCallback(async (title, message, type) => {
    try {
      await notificationService.createNotification({
        userId: null,
        title,
        message,
        type: type || 'info',
        read: false,
      })
    } catch {
      // Best effort
    }
  }, [])

  const addAdminMessage = useCallback(async (id, text, newStatus, notifTitle, notifMsg, notifType) => {
    const date = today()
    try {
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'admin',
        text,
      })
      const current = await requestService.getRequestById(id)
      const conv = [...(current.conversation || []), msg]
      const updateData = { conversation: conv, updatedAt: date }
      if (newStatus) {
        updateData.status = newStatus
        let timeline = current.timeline || [{ status: 'Submitted', date: current.createdAt || date }]
        const hasStatus = timeline.some((t) => t.status === newStatus)
        if (hasStatus) {
          timeline = timeline.map((t) => t.status === newStatus ? { ...t, date } : t)
        } else {
          timeline = [...timeline, { status: newStatus, date }]
        }
        updateData.timeline = timeline
        const activityLog = [...(current.activityLog || []), { type: 'status', action: `Status changed to ${newStatus}`, timestamp: now(), author: admin?.name || 'System' }]
        updateData.activityLog = activityLog
      }
      await requestService.updateRequest(id, updateData)
      if (notifTitle) {
        await persistNotification(notifTitle, notifMsg, notifType || 'info')
        // Also notify the customer directly
        if (current?.userId) {
          notificationService.createNotificationForUser(current.userId, 'status_changed', `Status Update: ${current.title}`, (notifMsg || `Your request status has been updated to ${newStatus || 'current status'}.`).replace(/^We /, ''), id)
        }
      }
    } catch {
      // Best effort
    }
  }, [persistNotification, admin])

  const acceptRequest = useCallback(async (id) => {
    const raw = await requestService.getRequestById(id)
    const pb = getPocketBase()
    const currentUser = pb.authStore.record
      addAdminMessage(id, 'Your request has been accepted. We are now working on it.', 'Assigned',
      'Request Accepted', `${raw?.userName || 'A customer'}'s request "${raw?.title || ''}" has been accepted.`, 'request_accepted')
    await requestService.updateRequest(id, { assignedTo: currentUser?.id })
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, assignedTo: currentUser?.id } : r))
    await addActivityLog(id, { type: 'assigned', action: 'Assigned', author: currentUser?.name || 'System' })
    // Notify customer of assignment
    if (raw?.userId) {
      notificationService.createNotificationForUser(raw.userId, 'request_assigned', `Request Assigned: ${raw.title}`, `Your request "${raw.title}" has been assigned to ${currentUser?.name || 'a team member'}.`, id)
    }
  }, [addAdminMessage, addActivityLog])

  const requestMoreInfo = useCallback(async (id, question) => {
    const raw = await requestService.getRequestById(id)
      addAdminMessage(id, question || 'Could you please provide more details so we can proceed?', 'Waiting for Customer',
      'Waiting for Customer', `We need more information regarding "${raw?.title || ''}".`, 'need_information')
  }, [addAdminMessage])

  const sendUpdate = useCallback(async (id, updateText) => {
    addAdminMessage(id, updateText, null, null, null, null)
    await persistNotification('New Message', `Admin sent an update on request "${id}".`, 'new_message')
  }, [addAdminMessage, persistNotification])

  const markInProgress = useCallback(async (id) => {
    addAdminMessage(id, 'We have started working on your request.', 'In Progress', null, null, null)
  }, [addAdminMessage])

  const requestApproval = useCallback(async (id, proposalText) => {
      addAdminMessage(id, proposalText || 'We have completed the work. Please review and approve.', 'Waiting for Customer',
      'Approval Requested', `Your request requires approval. Please review the proposed solution.`, 'approval_requested')
  }, [addAdminMessage])

  const completeRequest = useCallback(async (id) => {
    addAdminMessage(id, 'Your request has been completed. Thank you for using NRI Personal Assistant!', 'Completed',
      'Request Completed', `Your request has been completed successfully.`, 'completed')
    await addActivityLog(id, { type: 'completed', action: 'Completed', author: admin?.name || 'System' })
  }, [addAdminMessage, addActivityLog, admin])

  const rejectRequest = useCallback(async (id, reason) => {
      addAdminMessage(id, reason || 'We regret to inform you that this request cannot be processed at this time.', 'Cancelled',
      'Request Cancelled', `Your request has been cancelled. Reason: ${reason || 'Cannot be processed at this time.'}`, 'rejected')
  }, [addAdminMessage])

  const setOutcome = useCallback(async (id, outcome) => {
    const date = today()
    try {
      const current = await requestService.getRequestById(id)
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'admin',
        text: `Outcome set to: ${outcome}`,
      })
      const conv = [...(current.conversation || []), msg]
      const newStatus = outcome === 'Not Available' ? 'Cancelled' : 'Completed'
      const timeline = [...(current.timeline || [{ status: 'Submitted', date: current.createdAt || date }]), { status: newStatus, date }]
      const activityLog = [...(current.activityLog || []), { type: 'status', action: `Status changed to ${newStatus}`, timestamp: now(), author: admin?.name || 'System' }]
      await requestService.updateRequest(id, { outcome, status: newStatus, timeline, activityLog, conversation: conv, updatedAt: date })
      await persistNotification('Outcome Added', `Outcome set to "${outcome}" for your request.`, 'outcome_added')
    } catch {
      // Best effort
    }
  }, [persistNotification, admin])

  const setProposedSolution = useCallback(async (id, solution) => {
    try {
      const current = await requestService.getRequestById(id)
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'admin',
        text: `We have prepared a proposed solution for your review:\n${solution.title} - Estimated Cost: $${solution.estimatedCost}`,
      })
      const conv = [...(current.conversation || []), msg]
      await requestService.updateRequest(id, { proposedSolution: solution, conversation: conv, updatedAt: today() })
      await persistNotification('Proposed Solution Added', `A proposed solution has been added to your request.`, 'alternative_suggested')
    } catch {
      // Best effort
    }
  }, [persistNotification])

  const markActionRequired = useCallback(async (id, note) => {
    try {
      await requestService.updateRequest(id, {
        actionRequired: true,
        actionRequiredNote: note || 'Action required from you.',
      })
      await persistNotification('Action Required', note || 'Your decision is needed on this request.', 'action_required')
    } catch {
      // Best effort
    }
  }, [persistNotification])

  const clearActionRequired = useCallback(async (id) => {
    try {
      await requestService.updateRequest(id, {
        actionRequired: false,
        actionRequiredNote: '',
      })
    } catch {
      // Best effort
    }
  }, [])

  const updateRequestStatus = useCallback(async (id, status) => {
    const date = today()
    try {
      const current = await requestService.getRequestById(id)
      const existingTimeline = current.timeline || [{ status: 'Submitted', date: current.createdAt || date }]
      const hasStatus = existingTimeline.some((t) => t.status === status)
      const newTimeline = hasStatus
        ? existingTimeline.map((t) => t.status === status ? { ...t, date } : t)
        : [...existingTimeline, { status, date }]
      const activityLog = [...(current.activityLog || []), { type: 'status', action: `Status changed to ${status}`, timestamp: now(), author: admin?.name || 'System' }]
      await requestService.updateRequest(id, { status, timeline: newTimeline, activityLog, updatedAt: date })
      // Notify customer of status change
      if (current?.userId && current?.userId !== admin?.id) {
        const statusLabels = { Submitted: 'Submitted', Assigned: 'Assigned', Researching: 'Researching', 'Waiting for Customer': 'Waiting for Customer', Approved: 'Approved', 'In Progress': 'In Progress', Completed: 'Completed', Cancelled: 'Cancelled' }
        notificationService.createNotificationForUser(current.userId, 'status_changed', `Status Updated: ${current.title}`, `Your request "${current.title}" status changed to ${statusLabels[status] || status}.`, id)
      }
    } catch {
      // Best effort
    }
  }, [admin])

  const addNoteToRequest = useCallback(async (id, text, author) => {
    try {
      const current = await requestService.getRequestById(id)
      const note = { text, author, timestamp: today() }
      const notes = [...(current.notes || []), note]
      const activityLog = [...(current.activityLog || []), { type: 'note', action: 'Note Added', timestamp: now(), author, detail: text.slice(0, 100) }]
      await requestService.updateRequest(id, { notes, activityLog, updatedAt: today() })
    } catch {
      // Best effort
    }
  }, [])

  const addCallLog = useCallback(async (id, { agent, outcome, note }) => {
    try {
      const current = await requestService.getRequestById(id)
      const entry = { timestamp: now(), agent, outcome, note: note || '' }
      const callLogs = [...(current.callLogs || []), entry]
      const activityLog = [...(current.activityLog || []), { type: 'call', action: 'Call Logged', timestamp: now(), author: agent, detail: outcome }]
      await requestService.updateRequest(id, { callLogs, activityLog, updatedAt: today() })
    } catch {
      // Best effort
    }
  }, [])

  const addWhatsappLog = useCallback(async (id, { agent, direction, note }) => {
    try {
      const current = await requestService.getRequestById(id)
      const entry = { timestamp: now(), agent, direction, note: note || '' }
      const whatsappLogs = [...(current.whatsappLogs || []), entry]
      const activityLog = [...(current.activityLog || []), { type: 'whatsapp', action: 'WhatsApp Logged', timestamp: now(), author: agent, detail: `${direction}: ${(note || '').slice(0, 80)}` }]
      await requestService.updateRequest(id, { whatsappLogs, activityLog, updatedAt: today() })
    } catch {
      // Best effort
    }
  }, [])

  const setNextAction = useCallback(async (id, { action, dueDate }) => {
    try {
      await requestService.updateRequest(id, { nextAction: action, dueDate, updatedAt: today() })
      await addActivityLog(id, { type: 'next_action', action: `Next action set: ${action}`, author: admin?.name || 'System', detail: dueDate || '' })
    } catch {
      // Best effort
    }
  }, [addActivityLog, admin])

  const usersWithStats = users.map((u) => {
    const userRequests = requests.filter((r) => r.userId === u.id)
    const activeRequests = userRequests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled')
    const completedRequests = userRequests.filter((r) => r.status === 'Completed' || r.status === 'Cancelled')
    const totalTasks = (PLAN_LIMITS[u.subscriptionPlan] || 0) + (u.extraTasksPurchased || 0)
    const remaining = u.subscriptionPlan === 'Concierge' ? Infinity : Math.max(0, totalTasks - (u.taskUsage || 0))
    return { ...u, totalRequests: userRequests.length, activeRequests, completedRequests, remaining, totalTasks }
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const reminderStats = useMemo(() => {
    const active = allReminders.filter((r) => !r.completed && !r.cancelled)
    const dueToday = active.filter((r) => r.date === todayStr)
    const dueThisWeek = active.filter((r) => r.date >= todayStr && r.date <= in7Days)
    const overdue = active.filter((r) => r.date < todayStr)
    return {
      totalActive: active.length,
      dueToday: dueToday.length,
      dueThisWeek: dueThisWeek.length,
      overdue: overdue.length,
      allReminders,
    }
  }, [allReminders, todayStr, in7Days])

  const addAuditLog = useCallback(async (userId, action, details = {}) => {
    try {
      const pb = getPocketBase()
      await pb.collection('auditLogs').create({
        userId,
        adminId: admin?.id,
        action,
        details,
      })
    } catch {
      // best effort
    }
  }, [admin])

  const adminCreateUser = useCallback(async (data) => {
    const pb = getPocketBase()
    const record = await pb.collection('users').create({
      name: data.name,
      email: data.email,
      password: data.password,
      passwordConfirm: data.password,
      role: data.role || 'Customer',
      subscriptionPlan: data.subscriptionPlan || 'Personal',
      taskUsage: 0,
      extraTasksPurchased: 0,
      tasksRemaining: 10,
    })
    await addAuditLog(record.id, 'User Created', { role: data.role, plan: data.subscriptionPlan })
    loadAdminData()
    return record
  }, [admin, addAuditLog, loadAdminData])

  const adminToggleDisabled = useCallback(async (user) => {
    const pb = getPocketBase()
    const newDisabled = !user.disabled
    await pb.collection('users').update(user.id, { disabled: newDisabled })
    await addAuditLog(user.id, newDisabled ? 'User Disabled' : 'User Enabled')
    // Notify user
    const notifType = newDisabled ? 'user_disabled' : 'user_enabled'
    const notifTitle = newDisabled ? 'Account Disabled' : 'Account Re-enabled'
    const notifMsg = newDisabled ? 'Your account has been disabled by an administrator.' : 'Your account has been re-enabled by an administrator.'
    notificationService.createNotificationForUser(user.id, notifType, notifTitle, notifMsg)
    // Also notify admins
    const adminNotifTitle = newDisabled ? `User Disabled: ${user.name}` : `User Re-enabled: ${user.name}`
    const adminNotifMsg = newDisabled ? `${user.name} has been disabled by ${admin?.name || 'an administrator'}.` : `${user.name} has been re-enabled by ${admin?.name || 'an administrator'}.`
    notificationService.createNotificationForAllAdmins(notifType, adminNotifTitle, adminNotifMsg)
    loadAdminData()
  }, [admin, addAuditLog, loadAdminData])

  const adminResetPassword = useCallback(async (userId, newPassword) => {
    const pb = getPocketBase()
    await pb.collection('users').update(userId, {
      password: newPassword,
      passwordConfirm: newPassword,
    })
    await addAuditLog(userId, 'Password Reset')
    loadAdminData()
  }, [admin, addAuditLog, loadAdminData])

  const adminChangeRole = useCallback(async (userId, newRole) => {
    const pb = getPocketBase()
    const user = users.find((u) => u.id === userId)
    await pb.collection('users').update(userId, { role: newRole })
    await addAuditLog(userId, 'Role Changed', { from: user?.role, to: newRole })
    loadAdminData()
  }, [admin, users, addAuditLog, loadAdminData])

  const adminDeleteUser = useCallback(async (userId) => {
    const pb = getPocketBase()
    await addAuditLog(userId, 'User Deleted')
    await pb.collection('users').delete(userId)
    loadAdminData()
  }, [admin, addAuditLog, loadAdminData])

  const adminChangePlan = useCallback(async (userId, newPlan) => {
    const pb = getPocketBase()
    const user = users.find((u) => u.id === userId)
    const limit = PLAN_LIMITS[newPlan] || 10
    const totalTasks = limit + (user?.extraTasksPurchased || 0)
    const newTasksRemaining = Math.max(0, totalTasks - (user?.taskUsage || 0))
    await pb.collection('users').update(userId, {
      subscriptionPlan: newPlan,
      tasksRemaining: newTasksRemaining,
    })
    await addAuditLog(userId, 'Plan Changed', { from: user?.subscriptionPlan, to: newPlan })
    try {
      await pb.collection('taskUsageLogs').create({
        userId,
        action: 'Plan Changed',
        details: { from: user?.subscriptionPlan, to: newPlan },
      })
    } catch {}
    loadAdminData()
  }, [admin, users, addAuditLog, loadAdminData])

  const adminAddBonusTasks = useCallback(async (userId, qty) => {
    const pb = getPocketBase()
    const user = users.find((u) => u.id === userId)
    const newExtra = (user?.extraTasksPurchased || 0) + qty
    const limit = PLAN_LIMITS[user?.subscriptionPlan] || 10
    const newTasksRemaining = Math.max(0, (limit + newExtra) - (user?.taskUsage || 0))
    await pb.collection('users').update(userId, {
      extraTasksPurchased: newExtra,
      tasksRemaining: newTasksRemaining,
    })
    await addAuditLog(userId, 'Bonus Tasks Added', { qty, newTotal: newExtra })
    try {
      await pb.collection('taskUsageLogs').create({
        userId,
        action: 'Bonus Tasks Added',
        tasksConsumed: 0,
        remainingBalance: newTasksRemaining,
        details: { qty, newTotal: newExtra },
      })
    } catch {}
    loadAdminData()
  }, [admin, users, addAuditLog, loadAdminData])

  const adminRemoveBonusTasks = useCallback(async (userId, qty) => {
    const pb = getPocketBase()
    const user = users.find((u) => u.id === userId)
    const current = user?.extraTasksPurchased || 0
    const newExtra = Math.max(0, current - qty)
    const limit = PLAN_LIMITS[user?.subscriptionPlan] || 10
    const newTasksRemaining = Math.max(0, (limit + newExtra) - (user?.taskUsage || 0))
    await pb.collection('users').update(userId, {
      extraTasksPurchased: newExtra,
      tasksRemaining: newTasksRemaining,
    })
    await addAuditLog(userId, 'Bonus Tasks Removed', { qty, newTotal: newExtra })
    try {
      await pb.collection('taskUsageLogs').create({
        userId,
        action: 'Bonus Tasks Removed',
        remainingBalance: newTasksRemaining,
        details: { qty, newTotal: newExtra },
      })
    } catch {}
    loadAdminData()
  }, [admin, users, addAuditLog, loadAdminData])

  const totalUsers = users.length
  const planBreakdown = users.reduce((acc, u) => {
    acc[u.subscriptionPlan] = (acc[u.subscriptionPlan] || 0) + 1
    return acc
  }, {})
  const totalTasksUsed = users.reduce((sum, u) => sum + (u.taskUsage || 0), 0)
  const totalTasksLimit = users.reduce((sum, u) => sum + ((PLAN_LIMITS[u.subscriptionPlan] || 0) + (u.extraTasksPurchased || 0)), 0)

  const monthlyRevenue =
    (planBreakdown.Personal || 0) * 10 +
    (planBreakdown.Professional || 0) * 20 +
    (planBreakdown.Concierge || 0) * 49

  const value = {
    admin, login, logout, loadAdminData,
    requests, updateRequestStatus, addNoteToRequest,
    acceptRequest, requestMoreInfo, sendUpdate, markInProgress,
    requestApproval, completeRequest, rejectRequest,
    setOutcome, setProposedSolution, markActionRequired, clearActionRequired,
    addCallLog, addWhatsappLog, setNextAction,
    users: usersWithStats,
    totalUsers, planBreakdown, totalTasksUsed, totalTasksLimit,
    monthlyRevenue,
    allReminders, reminderStats,
    adminCreateUser, adminToggleDisabled, adminResetPassword, adminChangeRole, adminDeleteUser, addAuditLog,
    adminChangePlan, adminAddBonusTasks, adminRemoveBonusTasks,
    adminNotifications,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
