import { getPocketBase } from '../lib/pocketbase'

export async function getConsultations(page = 1, perPage = 100) {
  const pb = getPocketBase()
  return await pb.collection('consultations').getList(page, perPage, {
    sort: '-created',
  })
}

export async function createConsultation(data) {
  const pb = getPocketBase()
  return await pb.collection('consultations').create(data)
}

export async function updateConsultationStatus(id, status) {
  const pb = getPocketBase()
  return await pb.collection('consultations').update(id, {
    status,
    updatedAt: new Date().toISOString().replace('Z', ''),
  })
}
