import { getPocketBase } from '../lib/pocketbase'

export async function login(email, password) {
  const pb = getPocketBase()
  const authData = await pb.collection('users').authWithPassword(email, password)
  if (authData.record?.disabled) {
    pb.authStore.clear()
    throw new Error('Account is disabled. Contact your administrator.')
  }
  try {
    await pb.collection('users').update(authData.record.id, { lastLogin: new Date().toISOString() })
  } catch {
    // best effort
  }
  return authData.record
}

export function logout() {
  const pb = getPocketBase()
  pb.authStore.clear()
}

export function getCurrentUser() {
  const pb = getPocketBase()
  return pb.authStore.isValid ? pb.authStore.record : null
}

export function isAuthenticated() {
  const pb = getPocketBase()
  return pb.authStore.isValid
}

export function onAuthChange(callback) {
  const pb = getPocketBase()
  return pb.authStore.onChange((token, record) => {
    callback(token, record)
  })
}

export async function register({ name, email, password, passwordConfirm }) {
  const pb = getPocketBase()
  const record = await pb.collection('users').create({
    name,
    email,
    password,
    passwordConfirm,
    subscriptionPlan: 'Personal',
    taskUsage: 0,
    extraTasksPurchased: 0,
    tasksRemaining: 10,
    role: 'Customer',
  })
  return record
}

export async function requestVerification(email) {
  const pb = getPocketBase()
  await pb.collection('users').requestVerification(email)
}

export async function confirmVerification(token) {
  const pb = getPocketBase()
  await pb.collection('users').confirmVerification(token)
}

export async function requestPasswordReset(email) {
  const pb = getPocketBase()
  await pb.collection('users').requestPasswordReset(email)
}

export async function confirmPasswordReset(token, password, passwordConfirm) {
  const pb = getPocketBase()
  await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
}

export async function getUserById(id) {
  const pb = getPocketBase()
  return await pb.collection('users').getOne(id)
}

export async function getUsersByPlan(plan) {
  const pb = getPocketBase()
  return await pb.collection('users').getList(1, 100, {
    filter: `subscriptionPlan="${plan}"`,
  })
}

export async function getAllUsers() {
  const pb = getPocketBase()
  return await pb.collection('users').getList(1, 100, {
    sort: '-created',
  })
}
