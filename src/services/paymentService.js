import * as settingsService from './settingsService'

const RAZORPAY_KEY = 'razorpay_config'
const PAYPAL_KEY = 'paypal_config'

export async function getRazorpaySettings() {
  try {
    const value = await settingsService.getSetting(RAZORPAY_KEY)
    return value || { keyId: '', keySecret: '', enabled: false }
  } catch {
    return { keyId: '', keySecret: '', enabled: false }
  }
}

export async function saveRazorpaySettings(settings) {
  try {
    await settingsService.setSetting(RAZORPAY_KEY, settings, 'payment')
  } catch {
    // unavailable
  }
}

export async function getPaypalSettings() {
  try {
    const value = await settingsService.getSetting(PAYPAL_KEY)
    return value || { clientId: '', secretKey: '', enabled: false }
  } catch {
    return { clientId: '', secretKey: '', enabled: false }
  }
}

export async function savePaypalSettings(settings) {
  try {
    await settingsService.setSetting(PAYPAL_KEY, settings, 'payment')
  } catch {
    // unavailable
  }
}

export async function createPayment({ provider, amount, currency }) {
  if (provider === 'razorpay') {
    const settings = await getRazorpaySettings()
    if (!settings.enabled) {
      console.log('[paymentService] Mock: Razorpay disabled')
      return { success: false, mock: true, message: 'Razorpay not configured' }
    }
    console.log(`[paymentService] Mock: Razorpay payment of ${currency} ${amount}`)
    return { success: true, mock: true, paymentId: `mock_pay_${Date.now()}` }
  }
  if (provider === 'paypal') {
    const settings = await getPaypalSettings()
    if (!settings.enabled) {
      console.log('[paymentService] Mock: PayPal disabled')
      return { success: false, mock: true, message: 'PayPal not configured' }
    }
    console.log(`[paymentService] Mock: PayPal payment of ${currency} ${amount}`)
    return { success: true, mock: true, paymentId: `mock_paypal_${Date.now()}` }
  }
  return { success: false, mock: true, message: 'Unknown provider' }
}
