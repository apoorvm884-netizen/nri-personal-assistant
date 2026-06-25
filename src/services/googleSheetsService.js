import * as settingsService from './settingsService'

const SETTING_KEY = 'google_sheets_config'

export async function getGoogleSheetsSettings() {
  try {
    const value = await settingsService.getSetting(SETTING_KEY)
    return value || { spreadsheetId: '', sheetName: '', appsScriptUrl: '', enabled: false }
  } catch {
    return { spreadsheetId: '', sheetName: '', appsScriptUrl: '', enabled: false }
  }
}

export async function saveGoogleSheetsSettings(settings) {
  try {
    await settingsService.setSetting(SETTING_KEY, settings, 'google_sheets')
  } catch {
    // unavailable
  }
}

export async function appendToSheet({ values }) {
  const settings = await getGoogleSheetsSettings()
  if (!settings.enabled) {
    return { success: false, mock: true, message: 'Google Sheets service not enabled' }
  }
  return { success: true, mock: true, message: 'Row appended (mock)' }
}
