import { getPocketBase } from '../lib/pocketbase'

export async function getNotifications(userId, page = 1, perPage = 100) {
  const pb = getPocketBase()
  let filter = ''
  if (userId) {
    filter = `userId="${userId}" || userId=null`
  }
  const options = { sort: '-created' }
  if (filter) options.filter = filter
  return await pb.collection('notifications').getList(page, perPage, options)
}

export async function getNotificationsByUser(userId, filters = {}) {
  const pb = getPocketBase()
  const conditions = [`userId="${userId}"`]
  if (filters.types && filters.types.length > 0) {
    const typeClause = filters.types.map((t) => `type="${t}"`).join(' || ')
    conditions.push(`(${typeClause})`)
  }
  if (filters.unreadOnly) {
    conditions.push('read=false')
  }
  const filter = conditions.join(' && ')
  return await pb.collection('notifications').getList(filters.page || 1, filters.perPage || 50, {
    sort: '-created',
    filter,
  })
}

export async function getUnreadCount(userId) {
  const pb = getPocketBase()
  const result = await pb.collection('notifications').getList(1, 1, {
    filter: `userId="${userId}" && read=false`,
    skipTotal: false,
  })
  return result.totalItems
}

export async function createNotification(data) {
  const pb = getPocketBase()
  return await pb.collection('notifications').create(data)
}

export async function createNotificationForUser(userId, type, title, message, relatedRecordId = null) {
  const pb = getPocketBase()
  try {
    return await pb.collection('notifications').create({
      userId,
      type,
      title,
      message,
      relatedRecordId,
      read: false,
    })
  } catch {
    return null
  }
}

export async function createNotificationForAllAdmins(type, title, message, relatedRecordId = null) {
  const pb = getPocketBase()
  try {
    return await pb.collection('notifications').create({
      userId: null,
      type,
      title,
      message,
      relatedRecordId,
      read: false,
    })
  } catch {
    return null
  }
}

export async function markNotificationRead(id) {
  const pb = getPocketBase()
  return await pb.collection('notifications').update(id, { read: true })
}

export async function markAllNotificationsRead(userId) {
  const pb = getPocketBase()
  const result = await pb.collection('notifications').getList(1, 100, {
    filter: `userId="${userId}" && read=false`,
  })
  const updates = result.items.map((n) =>
    pb.collection('notifications').update(n.id, { read: true })
  )
  return await Promise.all(updates)
}

export async function clearNotifications(userId) {
  const pb = getPocketBase()
  const result = await pb.collection('notifications').getList(1, 100, {
    filter: `userId="${userId}"`,
  })
  const deletes = result.items.map((n) =>
    pb.collection('notifications').delete(n.id)
  )
  return await Promise.all(deletes)
}

export function subscribeNotifications(filter, callback) {
  const pb = getPocketBase()
  const options = filter ? { filter } : {}
  pb.collection('notifications').subscribe('*', (e) => {
    callback(e)
  }, options)
  return () => {
    pb.collection('notifications').unsubscribe('*')
  }
}
