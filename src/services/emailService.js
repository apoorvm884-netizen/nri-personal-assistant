import * as settingsService from './settingsService'

const SETTING_KEY = 'email_provider'

export async function getEmailSettings() {
  try {
    const value = await settingsService.getSetting(SETTING_KEY)
    return value || { provider: '', apiKey: '', senderEmail: '', enabled: false }
  } catch {
    return { provider: '', apiKey: '', senderEmail: '', enabled: false }
  }
}

export async function saveEmailSettings(settings) {
  try {
    await settingsService.setSetting(SETTING_KEY, settings, 'email')
  } catch {
    // unavailable
  }
}

export async function sendEmail({ to, subject, body }) {
  const settings = await getEmailSettings()
  if (!settings.enabled) {
    return { success: false, mock: true, message: 'Email service not enabled' }
  }
  return { success: true, mock: true, message: 'Email sent (mock)' }
}
