import * as settingsService from './settingsService'

const SETTING_KEY = 'slack_webhook'

export async function getSlackSettings() {
  try {
    const value = await settingsService.getSetting(SETTING_KEY)
    return value || { webhookUrl: '', channelName: '', enabled: false }
  } catch {
    return { webhookUrl: '', channelName: '', enabled: false }
  }
}

export async function saveSlackSettings(settings) {
  try {
    await settingsService.setSetting(SETTING_KEY, settings, 'slack')
  } catch {
    // unavailable
  }
}

export async function sendSlackMessage({ channel, message }) {
  const settings = await getSlackSettings()
  if (!settings.enabled) {
    console.log('[slackService] Mock: Slack message not sent - service not enabled')
    return { success: false, mock: true, message: 'Slack service not enabled' }
  }
  console.log(`[slackService] Mock: Sending to channel ${channel || settings.channelName}: ${message}`)
  return { success: true, mock: true, message: 'Slack message sent (mock)' }
}
