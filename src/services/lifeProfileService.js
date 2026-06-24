import { getPocketBase } from '../lib/pocketbase'

export async function getLifeProfile(userId) {
  const pb = getPocketBase()
  try {
    const result = await pb.collection('life_profiles').getList(1, 1, {
      filter: `userId="${userId}"`,
    })
    return result.items.length > 0 ? result.items[0] : null
  } catch {
    return null
  }
}

export async function upsertLifeProfile(userId, data) {
  const pb = getPocketBase()
  const existing = await getLifeProfile(userId)
  if (existing) {
    return await pb.collection('life_profiles').update(existing.id, data)
  } else {
    return await pb.collection('life_profiles').create({ userId, ...data })
  }
}
