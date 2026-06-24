import { getPocketBase } from '../lib/pocketbase'

export async function getSetting(key) {
  const pb = getPocketBase()
  try {
    const result = await pb.collection('system_settings').getList(1, 1, {
      filter: `key="${key}"`,
    })
    return result.items.length > 0 ? result.items[0].value : null
  } catch {
    return null
  }
}

export async function setSetting(key, value, category = 'general') {
  const pb = getPocketBase()
  try {
    const existing = await pb.collection('system_settings').getList(1, 1, {
      filter: `key="${key}"`,
    })
    if (existing.items.length > 0) {
      return await pb.collection('system_settings').update(existing.items[0].id, { value, category })
    } else {
      return await pb.collection('system_settings').create({ key, value, category })
    }
  } catch {
    return null
  }
}

export async function getSettingsByCategory(category) {
  const pb = getPocketBase()
  const result = await pb.collection('system_settings').getList(1, 50, {
    filter: `category="${category}"`,
  })
  return result.items
}

export async function getAllSettings() {
  const pb = getPocketBase()
  const result = await pb.collection('system_settings').getList(1, 50)
  return result.items
}

export async function deleteSetting(key) {
  const pb = getPocketBase()
  const result = await pb.collection('system_settings').getList(1, 1, {
    filter: `key="${key}"`,
  })
  if (result.items.length > 0) {
    return await pb.collection('system_settings').delete(result.items[0].id)
  }
  return false
}
