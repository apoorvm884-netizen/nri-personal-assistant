import { getPocketBase } from '../lib/pocketbase'

export async function getReminders(userId, page = 1, perPage = 100) {
  const pb = getPocketBase()
  return await pb.collection('reminders').getList(page, perPage, {
    filter: `userId="${userId}"`,
    sort: 'date',
  })
}

export async function getAllReminders(page = 1, perPage = 100) {
  const pb = getPocketBase()
  return await pb.collection('reminders').getList(page, perPage, {
    sort: 'date',
  })
}

export async function createReminder(data) {
  const pb = getPocketBase()
  return await pb.collection('reminders').create(data)
}

export async function updateReminder(id, data) {
  const pb = getPocketBase()
  return await pb.collection('reminders').update(id, data)
}

export async function deleteReminder(id) {
  const pb = getPocketBase()
  return await pb.collection('reminders').delete(id)
}

export async function toggleReminder(id, completed) {
  const pb = getPocketBase()
  return await pb.collection('reminders').update(id, { completed })
}

export function generateSchedule(dueDate) {
  const due = new Date(dueDate)
  return [
    { daysBefore: 7, triggerDate: new Date(due.getTime() - 7 * 86400000).toISOString().split('T')[0], triggered: false, triggeredAt: null },
    { daysBefore: 2, triggerDate: new Date(due.getTime() - 2 * 86400000).toISOString().split('T')[0], triggered: false, triggeredAt: null },
    { daysBefore: 1, triggerDate: new Date(due.getTime() - 1 * 86400000).toISOString().split('T')[0], triggered: false, triggeredAt: null },
    { daysBefore: 0, triggerDate: dueDate, triggered: false, triggeredAt: null },
  ]
}

export function computeReminderStatus(reminder) {
  if (reminder.cancelled) return 'Cancelled'
  if (reminder.completed) return 'Completed'
  const today = new Date().toISOString().split('T')[0]
  const dueDate = reminder.date
  if (dueDate < today) return 'Due Soon'
  const diffDays = Math.ceil((new Date(dueDate) - new Date(today)) / (1000 * 60 * 60 * 24))
  if (diffDays <= 2) return 'Due Soon'
  if (diffDays <= 7) return 'Upcoming'
  return 'Active'
}

export const REMINDER_CATEGORIES = ['Visa', 'Passport', 'Tax', 'Insurance', 'Subscription', 'Family', 'Medical', 'Custom']
export const REMINDER_PRIORITIES = ['High', 'Medium', 'Low']
