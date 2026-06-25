import * as settingsService from './settingsService'

const SETTING_KEY = 'ai_config'

export async function getAISettings() {
  try {
    const value = await settingsService.getSetting(SETTING_KEY)
    return value || { deepseekKey: '', openaiKey: '', enabled: false }
  } catch {
    return { deepseekKey: '', openaiKey: '', enabled: false }
  }
}

export async function saveAISettings(settings) {
  try {
    await settingsService.setSetting(SETTING_KEY, settings, 'ai')
  } catch {
    // unavailable
  }
}

export async function categorizeRequest(text) {
  const settings = await getAISettings()
  if (!settings.enabled) {
    return { category: 'Personal Assistant', priority: 'Medium', title: text.slice(0, 50) }
  }
  return { category: 'Personal Assistant', priority: 'Medium', title: text.slice(0, 50) }
}
