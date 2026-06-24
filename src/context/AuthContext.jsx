import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { getPocketBase } from '../lib/pocketbase'
import * as authService from '../services/authService'
import * as requestService from '../services/requestService'
import * as messageService from '../services/messageService'
import * as reminderService from '../services/reminderService'
import * as notificationService from '../services/notificationService'
import { PLAN_LIMITS, PLAN_PRICES } from '../config/appConfig'

const AuthContext = createContext(null)

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function computeRemaining(user) {
  if (!user) return 0
  const limit = PLAN_LIMITS[user.subscriptionPlan] || 10
  const total = limit + (user.extraTasksPurchased || 0)
  return user.subscriptionPlan === 'Concierge' ? Infinity : Math.max(0, total - (user.taskUsage || 0))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const pb = getPocketBase()
    return pb.authStore.isValid ? pb.authStore.record : null
  })
  const [requests, setRequests] = useState([])
  const [reminders, setReminders] = useState([])
  const [notifications, setNotifications] = useState([])
  const unsubRef = useRef([])
  const loadedRef = useRef(false)

  const loadUserData = useCallback(async (userId) => {
    if (!userId) return
    loadedRef.current = false
    try {
      const [reqResult, remResult, notifResult] = await Promise.all([
        requestService.getRequests(`userId="${userId}"`),
        reminderService.getReminders(userId),
        notificationService.getNotifications(userId),
      ])
      const reqsWithMessages = await Promise.all((reqResult.items || []).map(async (req) => {
        try {
          const msgResult = await messageService.getMessagesByRequest(req.id)
          const { notes, callLogs, whatsappLogs, activityLog, ...safe } = req
          return { ...safe, conversation: msgResult.items || [] }
        } catch {
          const { notes, callLogs, whatsappLogs, activityLog, ...safe } = req
          return { ...safe, conversation: req.conversation || [] }
        }
      }))
      setRequests(reqsWithMessages)
      setReminders(remResult.items || [])
      setNotifications(notifResult.items || [])
      // Auto-generate notifications for reminder due/overdue
      const todayStr = new Date().toISOString().split('T')[0]
      for (const rem of (remResult.items || [])) {
        if (rem.completed || rem.cancelled) continue
        const hasDueNotif = (notifResult.items || []).some((n) => n.type === 'reminder_due' && n.relatedRecordId === rem.id)
        const hasOverdueNotif = (notifResult.items || []).some((n) => n.type === 'reminder_overdue' && n.relatedRecordId === rem.id)
        if (rem.date === todayStr && !hasDueNotif) {
          notificationService.createNotificationForUser(userId, 'reminder_due', `Reminder Due Today: ${rem.title}`, `Your reminder "${rem.title}" is due today.`, rem.id)
        } else if (rem.date < todayStr && !hasOverdueNotif) {
          notificationService.createNotificationForUser(userId, 'reminder_overdue', `Overdue Reminder: ${rem.title}`, `Your reminder "${rem.title}" was due on ${rem.date}. Please take action.`, rem.id)
        }
      }
      // Auto-generate plan near limit notification
      const pb = getPocketBase()
      if (pb.authStore.record) {
        const u = pb.authStore.record
        if (u.subscriptionPlan !== 'Concierge') {
          const limit = PLAN_LIMITS[u.subscriptionPlan] || 10
          const total = limit + (u.extraTasksPurchased || 0)
          const usage = u.taskUsage || 0
          const usagePercent = total > 0 ? (usage / total) * 100 : 0
          if (usagePercent >= 80) {
            const hasPlanWarning = (notifResult.items || []).some((n) => n.type === 'plan_near_limit')
            if (!hasPlanWarning) {
              notificationService.createNotificationForUser(userId, 'plan_near_limit', 'Plan Usage Warning', `You have used ${usage} of ${total} tasks (${Math.round(usagePercent)}%). Consider upgrading to avoid interruption.`)
            }
          }
        }
      }
    } catch {
      // PB may not be ready
    } finally {
      loadedRef.current = true
    }
  }, [])

  useEffect(() => {
    const pb = getPocketBase()
    const unsubAuth = pb.authStore.onChange((token, record) => {
      if (record) {
        setUser(record)
        loadUserData(record.id)
      } else {
        setUser(null)
        setRequests([])
        setReminders([])
        setNotifications([])
      }
    })
    if (pb.authStore.isValid && pb.authStore.record) {
      loadUserData(pb.authStore.record.id)
    }
    return () => unsubAuth()
  }, [loadUserData])

  useEffect(() => {
    const unsubs = unsubRef.current
    if (user) {
      const unsubReq = requestService.subscribeRequests(`userId="${user.id}"`, (e) => {
        if (e.action === 'create') {
          const { notes, callLogs, whatsappLogs, activityLog, ...safe } = e.record
          const record = { ...safe, conversation: [] }
          messageService.getMessagesByRequest(e.record.id).then((msgResult) => {
            record.conversation = msgResult.items || []
            setRequests((prev) => [record, ...prev])
          }).catch(() => {
            setRequests((prev) => [record, ...prev])
          })
        } else if (e.action === 'update') {
          const { notes, callLogs, whatsappLogs, activityLog, ...safe } = e.record
          setRequests((prev) => prev.map((r) => r.id === e.record.id ? { ...r, ...safe, conversation: r.conversation || [] } : r))
        } else if (e.action === 'delete') {
          setRequests((prev) => prev.filter((r) => r.id !== e.record.id))
        }
      })
      const unsubNotif = notificationService.subscribeNotifications(`userId="${user.id}" || userId=null`, (e) => {
        if (e.action === 'create') {
          setNotifications((prev) => [e.record, ...prev])
        } else if (e.action === 'update') {
          setNotifications((prev) => prev.map((n) => n.id === e.record.id ? e.record : n))
        } else if (e.action === 'delete') {
          setNotifications((prev) => prev.filter((n) => n.id !== e.record.id))
        }
      })
      const unsubMsg = messageService.subscribeMessagesByUser(user.id, (e) => {
        if (e.action === 'create') {
          setRequests((prev) => prev.map((r) => {
            if (r.id === e.record.requestId) {
              const conv = [...(r.conversation || []), e.record]
              return { ...r, conversation: conv }
            }
            return r
          }))
        }
      })
      unsubs.push(unsubReq, unsubNotif, unsubMsg)
    }
    return () => {
      unsubs.forEach((fn) => fn())
      unsubs.length = 0
    }
  }, [user])

  const login = useCallback(async (email, password) => {
    try {
      const record = await authService.login(email, password)
      return true
    } catch {
      return false
    }
  }, [])

  const register = useCallback(async ({ name, email, password, passwordConfirm }) => {
    try {
      await authService.register({ name, email, password, passwordConfirm })
      await authService.requestVerification(email)
      await authService.login(email, password)
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.email?.message || err?.message || 'Registration failed'
      if (message.includes('already exists')) {
        return { success: false, error: 'An account with this email already exists' }
      }
      return { success: false, error: message }
    }
  }, [])

  const resendVerification = useCallback(async () => {
    if (!user?.email) return { success: false, error: 'No email on record' }
    try {
      await authService.requestVerification(user.email)
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to resend verification email' }
    }
  }, [user])

  const forgotPassword = useCallback(async (email) => {
    try {
      await authService.requestPasswordReset(email)
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to send password reset email' }
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setRequests([])
    setReminders([])
    setNotifications([])
  }, [])

  const addNotification = useCallback(async (title, message, type) => {
    if (!user) return
    try {
      await notificationService.createNotification({
        userId: user.id,
        title,
        message,
        type: type || 'info',
        read: false,
      })
    } catch {
      // Best effort
    }
  }, [user])

  const planLimits = user ? PLAN_LIMITS[user.subscriptionPlan] || 10 : 0
  const planPrice = user ? PLAN_PRICES[user.subscriptionPlan] || PLAN_PRICES.Personal : PLAN_PRICES.Personal
  const totalAvailableTasks = user ? (planLimits + (user.extraTasksPurchased || 0)) : 0
  const remainingTasks = computeRemaining(user)
  const canSubmitTask = user
    ? user.subscriptionPlan === 'Concierge' || remainingTasks > 0
    : false

  const purchaseExtraTasks = useCallback(async (qty) => {
    if (!user) return false
    const cost = (planPrice.extraTask || 2) * qty
    const pb = getPocketBase()
    try {
      const updated = await pb.collection('users').update(user.id, {
        extraTasksPurchased: (user.extraTasksPurchased || 0) + qty,
      })
      setUser(updated)
      addNotification('Purchase Successful', `Purchased ${qty} extra task(s) for $${cost.toFixed(2)}.`, 'info')
      return true
    } catch {
      return false
    }
  }, [user, planPrice, addNotification])

  const addRequest = useCallback(async (req) => {
    if (!user) return null
    const now = new Date().toISOString()
    const date = now.split('T')[0]
    try {
      const newReq = await requestService.createRequest({
        title: req.title,
        category: req.category,
        description: req.description,
        priority: req.priority,
        status: 'Submitted',
        userId: user.id,
        userName: user.name || '',
        userPlan: user.subscriptionPlan || 'Personal',
        actionRequired: false,
        actionRequiredNote: '',
        proposedSolution: null,
        outcome: null,
        notes: [],
        timeline: [{ status: 'Submitted', date }],
        conversation: [],
      })
      const msg = await messageService.createMessage({
        requestId: newReq.id,
        sender: 'customer',
        text: req.description,
      })
      await requestService.updateRequest(newReq.id, {
        conversation: [msg],
      })
      const pb = getPocketBase()
      const newTaskUsage = (user.taskUsage || 0) + 1
      const limit = PLAN_LIMITS[user.subscriptionPlan] || 10
      const tasksRemaining = Math.max(0, (limit + (user.extraTasksPurchased || 0)) - newTaskUsage)
      const updatedUser = await pb.collection('users').update(user.id, {
        taskUsage: newTaskUsage,
        tasksRemaining,
      })
      try {
        await pb.collection('taskUsageLogs').create({
          userId: user.id,
          action: 'Request Created',
          tasksConsumed: 1,
          remainingBalance: tasksRemaining,
          details: { requestId: newReq.id, title: req.title },
        })
      } catch {
        // best effort
      }
      setUser(updatedUser)
      addNotification('New Request Submitted', `Your request "${req.title}" has been submitted successfully.`, 'new_request')
      // Notify admins
      notificationService.createNotificationForAllAdmins('new_request', `New Request: ${req.title}`, `${user.name || 'A customer'} submitted a new request "${req.title}".`, newReq.id)
      return newReq
    } catch {
      return null
    }
  }, [user, addNotification])

  const sendMessage = useCallback(async (id, text) => {
    try {
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'customer',
        text,
      })
      const current = await requestService.getRequestById(id)
      const conv = [...(current.conversation || []), msg]
      await requestService.updateRequest(id, { conversation: conv })
      addNotification('New Message Sent', `You sent a message regarding request ${id}.`, 'new_message')
    } catch {
      // Best effort
    }
  }, [addNotification])

  const respondToActionRequired = useCallback(async (id, text) => {
    const now = new Date().toISOString()
    const date = now.split('T')[0]
    try {
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'customer',
        text,
      })
      const current = await requestService.getRequestById(id)
      const conv = [...(current.conversation || []), msg]
      await requestService.updateRequest(id, {
        status: 'Assigned',
        actionRequired: false,
        actionRequiredNote: '',
        conversation: conv,
        updatedAt: date,
      })
      addNotification('Action Responded', `You have responded to the action required for request ${id}.`, 'info')
    } catch {
      // Best effort
    }
  }, [addNotification])

  const acceptOutcome = useCallback(async (id) => {
    const now = new Date().toISOString()
    const date = now.split('T')[0]
    try {
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'customer',
        text: 'I accept the proposed outcome. Thank you!',
      })
      const current = await requestService.getRequestById(id)
      const conv = [...(current.conversation || []), msg]
      await requestService.updateRequest(id, {
        status: 'Completed',
        outcome: 'Completed',
        conversation: conv,
        updatedAt: date,
      })
      addNotification('Outcome Accepted', `You have accepted the outcome for request ${id}.`, 'outcome_added')
    } catch {
      // Best effort
    }
  }, [addNotification])

  const rejectOutcome = useCallback(async (id, reason) => {
    const now = new Date().toISOString()
    const date = now.split('T')[0]
    try {
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'customer',
        text: reason || 'I would like to discuss the outcome further.',
      })
      const current = await requestService.getRequestById(id)
      const conv = [...(current.conversation || []), msg]
      await requestService.updateRequest(id, {
        status: 'In Progress',
        conversation: conv,
        updatedAt: date,
      })
      addNotification('Outcome Rejected', `You requested discussion on the outcome for request ${id}.`, 'info')
    } catch {
      // Best effort
    }
  }, [addNotification])

  const approveSolution = useCallback(async (id) => {
    const now = new Date().toISOString()
    const date = now.split('T')[0]
    try {
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'customer',
        text: 'I approve this solution. Thank you!',
      })
      const current = await requestService.getRequestById(id)
      const conv = [...(current.conversation || []), msg]
      await requestService.updateRequest(id, {
        status: 'Completed',
        actionRequired: false,
        actionRequiredNote: '',
        conversation: conv,
        updatedAt: date,
      })
      addNotification('Solution Approved', `You have approved the solution for request ${id}.`, 'completed')
    } catch {
      // Best effort
    }
  }, [addNotification])

  const rejectSolution = useCallback(async (id, reason) => {
    const now = new Date().toISOString()
    const date = now.split('T')[0]
    try {
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'customer',
        text: reason || 'I would like some changes to this solution.',
      })
      const current = await requestService.getRequestById(id)
      const conv = [...(current.conversation || []), msg]
      await requestService.updateRequest(id, {
        status: 'In Progress',
        actionRequired: false,
        actionRequiredNote: '',
        conversation: conv,
        updatedAt: date,
      })
      addNotification('Solution Rejected', `You requested changes for request ${id}.`, 'info')
    } catch {
      // Best effort
    }
  }, [addNotification])

  const provideAdditionalInfo = useCallback(async (id, text) => {
    const now = new Date().toISOString()
    const date = now.split('T')[0]
    try {
      const msg = await messageService.createMessage({
        requestId: id,
        sender: 'customer',
        text,
      })
      const current = await requestService.getRequestById(id)
      const conv = [...(current.conversation || []), msg]
      await requestService.updateRequest(id, {
        status: 'Assigned',
        actionRequired: false,
        actionRequiredNote: '',
        conversation: conv,
        updatedAt: date,
      })
      addNotification('Additional Info Provided', `You provided additional information for request ${id}.`, 'info')
    } catch {
      // Best effort
    }
  }, [addNotification])

  const updateRequestStatus = useCallback(async (id, status, adminMsg) => {
    const now = new Date().toISOString()
    const date = now.split('T')[0]
    try {
      const updateData = { status, updatedAt: date }
      if (adminMsg) {
        const msg = await messageService.createMessage({
          requestId: id,
          sender: 'admin',
          text: adminMsg,
        })
        const current = await requestService.getRequestById(id)
        const conv = [...(current.conversation || []), msg]
        updateData.conversation = conv
      }
      await requestService.updateRequest(id, updateData)
    } catch {
      // Best effort
    }
  }, [])

  const addNoteToRequest = useCallback(async (id, text, author) => {
    try {
      const current = await requestService.getRequestById(id)
      const note = { text, author, timestamp: new Date().toISOString().split('T')[0] }
      const notes = [...(current.notes || []), note]
      await requestService.updateRequest(id, { notes, updatedAt: note.timestamp })
    } catch {
      // Best effort
    }
  }, [])

  const addReminder = useCallback(async (rem) => {
    if (!user) return
    try {
      const schedule = reminderService.generateSchedule(rem.date)
      const timelineEntry = { action: 'Created', timestamp: new Date().toISOString(), detail: 'Reminder created' }
      const newRem = await reminderService.createReminder({
        userId: user.id,
        title: rem.title,
        description: rem.description || '',
        date: rem.date,
        time: rem.time || '12:00',
        type: rem.type || 'one-time',
        category: rem.category || 'Custom',
        priority: rem.priority || 'Medium',
        preference: rem.preference || 'app',
        completed: false,
        cancelled: false,
        schedule,
        timeline: [timelineEntry],
      })
      setReminders((prev) => [newRem, ...prev])
    } catch {
      // Best effort
    }
  }, [user])

  const toggleReminder = useCallback(async (id, completed) => {
    try {
      const current = reminders.find((r) => r.id === id)
      const timeline = [...(current?.timeline || []), { action: completed ? 'Completed' : 'Reopened', timestamp: new Date().toISOString(), detail: completed ? 'Marked as completed' : 'Reopened' }]
      await reminderService.updateReminder(id, { completed, timeline })
    } catch {
      // Best effort
    }
  }, [reminders])

  const updateReminder = useCallback(async (id, updates) => {
    try {
      const current = reminders.find((r) => r.id === id)
      const timeline = [...(current?.timeline || []), { action: 'Updated', timestamp: new Date().toISOString(), detail: 'Reminder details updated' }]
      await reminderService.updateReminder(id, { ...updates, timeline })
    } catch {
      // Best effort
    }
  }, [reminders])

  const deleteReminder = useCallback(async (id) => {
    try {
      await reminderService.deleteReminder(id)
    } catch {
      // Best effort
    }
  }, [])

  const markNotificationRead = useCallback(async (id) => {
    try {
      await notificationService.markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
    } catch {
      // Best effort
    }
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    if (!user) return
    try {
      await notificationService.markAllNotificationsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // Best effort
    }
  }, [user])

  const clearNotifications = useCallback(async () => {
    if (!user) return
    try {
      await notificationService.clearNotifications(user.id)
    } catch {
      // Best effort
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const verified = user?.verified === true

  const value = {
    user, verified, login, register, resendVerification, forgotPassword, logout,
    requests, addRequest, updateRequestStatus, addNoteToRequest, sendMessage,
    approveSolution, rejectSolution, provideAdditionalInfo,
    respondToActionRequired, acceptOutcome, rejectOutcome,
    reminders, addReminder, toggleReminder, updateReminder, deleteReminder,
    notifications, addNotification, markNotificationRead, markAllNotificationsRead, clearNotifications, unreadCount,
    planLimits, planPrice, totalAvailableTasks, remainingTasks, canSubmitTask, purchaseExtraTasks,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
