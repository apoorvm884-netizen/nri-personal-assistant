import { getPocketBase } from '../lib/pocketbase'

export async function getRequests(filter = '', page = 1, perPage = 100) {
  const pb = getPocketBase()
  const options = { sort: '-created' }
  if (filter) options.filter = filter
  return await pb.collection('requests').getList(page, perPage, options)
}

export async function getRequestById(id) {
  const pb = getPocketBase()
  return await pb.collection('requests').getOne(id, { expand: 'userId,assignedTo' })
}

export async function createRequest(data) {
  const pb = getPocketBase()
  return await pb.collection('requests').create(data)
}

export async function updateRequest(id, data) {
  const pb = getPocketBase()
  return await pb.collection('requests').update(id, data)
}

export async function deleteRequest(id) {
  const pb = getPocketBase()
  return await pb.collection('requests').delete(id)
}

export async function getUsersWithStats(requests) {
  const pb = getPocketBase()
  const users = await pb.collection('users').getList(1, 100, {
    filter: 'role != "Admin"',
  })
  return users.items.map((u) => {
    const userRequests = requests.filter((r) => r.userId === u.id)
    const activeRequests = userRequests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled')
    const completedRequests = userRequests.filter((r) => r.status === 'Completed' || r.status === 'Cancelled')
    return { ...u, totalRequests: userRequests.length, activeRequests, completedRequests }
  })
}

export function subscribeRequests(filter, callback) {
  const pb = getPocketBase()
  const options = filter ? { filter } : {}
  pb.collection('requests').subscribe('*', (e) => {
    callback(e)
  }, options)
  return () => {
    pb.collection('requests').unsubscribe('*')
  }
}
