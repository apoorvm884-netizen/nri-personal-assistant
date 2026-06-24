import * as consultationService from '../services/consultationService'
import * as notificationService from '../services/notificationService'

export async function loadConsultations() {
  try {
    const result = await consultationService.getConsultations()
    return result.items || []
  } catch {
    return []
  }
}

export async function addConsultation(data) {
  try {
    const newConsultation = await consultationService.createConsultation(data)
    try {
      await notificationService.createNotification({
        userId: null,
        title: 'New Consultation Request',
        message: `${data.fullName} has requested a consultation call.`,
        type: 'new_request',
        read: false,
      })
    } catch {
      // notification best effort
    }
    return newConsultation
  } catch {
    return null
  }
}

export async function updateConsultationStatus(id, status) {
  try {
    return await consultationService.updateConsultationStatus(id, status)
  } catch {
    return null
  }
}
