import { getPocketBase } from '../lib/pocketbase'

export async function getMessagesByRequest(requestId, page = 1, perPage = 200) {
  const pb = getPocketBase()
  return await pb.collection('messages').getList(page, perPage, {
    filter: `requestId="${requestId}"`,
    sort: 'created',
  })
}

export async function createMessage(data) {
  const pb = getPocketBase()
  return await pb.collection('messages').create(data)
}

export function subscribeMessages(requestId, callback) {
  const pb = getPocketBase()
  const filter = `requestId="${requestId}"`
  pb.collection('messages').subscribe('*', (e) => {
    callback(e)
  }, { filter })
  return () => {
    pb.collection('messages').unsubscribe('*')
  }
}

export function subscribeMessagesByUser(userId, callback) {
  const pb = getPocketBase()
  const filter = `requestId.userId="${userId}"`
  pb.collection('messages').subscribe('*', (e) => {
    callback(e)
  }, { filter })
  return () => {
    pb.collection('messages').unsubscribe('*')
  }
}
