import { useState } from 'react'
import { getAISettings, saveAISettings } from '../../services/aiService'
import { getEmailSettings, saveEmailSettings } from '../../services/emailService'
import { getSlackSettings, saveSlackSettings } from '../../services/slackService'
import { getGoogleSheetsSettings, saveGoogleSheetsSettings } from '../../services/googleSheetsService'
import { getRazorpaySettings, saveRazorpaySettings, getPaypalSettings, savePaypalSettings } from '../../services/paymentService'

const sections = [
  { id: 'deepseek', label: 'DeepSeek AI' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'slack', label: 'Slack' },
  { id: 'email', label: 'Email Service' },
  { id: 'sheets', label: 'Google Sheets' },
  { id: 'razorpay', label: 'Razorpay' },
  { id: 'paypal', label: 'PayPal' },
]

export default function CommandCenter() {
  const [activeSection, setActiveSection] = useState('deepseek')
  const [aiSettings, setAiSettings] = useState(getAISettings)
  const [emailSettings, setEmailSettings] = useState(getEmailSettings)
  const [slackSettings, setSlackSettings] = useState(getSlackSettings)
  const [sheetsSettings, setSheetsSettings] = useState(getGoogleSheetsSettings)
  const [razorpaySettings, setRazorpaySettings] = useState(getRazorpaySettings)
  const [paypalSettings, setPaypalSettings] = useState(getPaypalSettings)
  const [saved, setSaved] = useState('')

  const inputClass = "w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
  const labelClass = "block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider"

  const showSaved = (msg) => {
    setSaved(msg)
    setTimeout(() => setSaved(''), 2000)
  }

  const toggleEnabled = (key, settings, saveFn) => {
    const updated = { ...settings, enabled: !settings.enabled }
    saveFn(updated)
    return updated
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">System Command Center</h1>
          <p className="text-charcoal-400 text-sm mt-1">Configure integrations for future connectivity.</p>
        </div>
        {saved && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">{saved}</span>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {sections.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === s.id ? 'bg-charcoal-800 text-white' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'
            }`}
          >{s.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 p-6 md:p-8">
        {/* DeepSeek */}
        {activeSection === 'deepseek' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800">DeepSeek AI</h2>
              <button onClick={() => {
                const updated = toggleEnabled('deepseek', aiSettings, saveAISettings)
                setAiSettings(updated)
                showSaved(updated.enabled ? 'DeepSeek enabled' : 'DeepSeek disabled')
              }}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  aiSettings.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'
                }`}
              >{aiSettings.enabled ? 'Enabled' : 'Disabled'}</button>
            </div>
            <p className="text-sm text-charcoal-400">Configure DeepSeek API key for AI categorization and summarization.</p>
            <div>
              <label className={labelClass}>API Key</label>
              <input type="password" value={aiSettings.deepseekKey} onChange={(e) => {
                const updated = { ...aiSettings, deepseekKey: e.target.value }
                setAiSettings(updated)
                saveAISettings(updated)
                showSaved('Saved')
              }} placeholder="sk-..." className={inputClass} />
            </div>
          </div>
        )}

        {/* OpenAI */}
        {activeSection === 'openai' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800">OpenAI</h2>
              <button onClick={() => {
                const updated = toggleEnabled('openai', aiSettings, saveAISettings)
                setAiSettings(updated)
                showSaved(updated.enabled ? 'OpenAI enabled' : 'OpenAI disabled')
              }}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  aiSettings.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'
                }`}
              >{aiSettings.enabled ? 'Enabled' : 'Disabled'}</button>
            </div>
            <p className="text-sm text-charcoal-400">Configure OpenAI API key for AI features.</p>
            <div>
              <label className={labelClass}>API Key</label>
              <input type="password" value={aiSettings.openaiKey} onChange={(e) => {
                const updated = { ...aiSettings, openaiKey: e.target.value }
                setAiSettings(updated)
                saveAISettings(updated)
                showSaved('Saved')
              }} placeholder="sk-..." className={inputClass} />
            </div>
          </div>
        )}

        {/* Slack */}
        {activeSection === 'slack' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800">Slack Integration</h2>
              <button onClick={() => {
                const updated = toggleEnabled('slack', slackSettings, saveSlackSettings)
                setSlackSettings(updated)
                showSaved(updated.enabled ? 'Slack enabled' : 'Slack disabled')
              }}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  slackSettings.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'
                }`}
              >{slackSettings.enabled ? 'Enabled' : 'Disabled'}</button>
            </div>
            <p className="text-sm text-charcoal-400">Receive notifications in your Slack workspace.</p>
            <div>
              <label className={labelClass}>Webhook URL</label>
              <input type="text" value={slackSettings.webhookUrl} onChange={(e) => {
                const updated = { ...slackSettings, webhookUrl: e.target.value }
                setSlackSettings(updated)
                saveSlackSettings(updated)
                showSaved('Saved')
              }} placeholder="https://hooks.slack.com/services/..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Channel Name</label>
              <input type="text" value={slackSettings.channelName} onChange={(e) => {
                const updated = { ...slackSettings, channelName: e.target.value }
                setSlackSettings(updated)
                saveSlackSettings(updated)
                showSaved('Saved')
              }} placeholder="#nripa-notifications" className={inputClass} />
            </div>
          </div>
        )}

        {/* Email Service */}
        {activeSection === 'email' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800">Email Service</h2>
              <button onClick={() => {
                const updated = toggleEnabled('email', emailSettings, saveEmailSettings)
                setEmailSettings(updated)
                showSaved(updated.enabled ? 'Email enabled' : 'Email disabled')
              }}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  emailSettings.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'
                }`}
              >{emailSettings.enabled ? 'Enabled' : 'Disabled'}</button>
            </div>
            <p className="text-sm text-charcoal-400">Configure your email provider for sending notifications.</p>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Provider</label>
                <select value={emailSettings.provider} onChange={(e) => {
                  const updated = { ...emailSettings, provider: e.target.value }
                  setEmailSettings(updated)
                  saveEmailSettings(updated)
                  showSaved('Saved')
                }} className={inputClass + ' appearance-none bg-white'}>
                  <option value="">Select...</option>
                  <option value="SendGrid">SendGrid</option>
                  <option value="Mailgun">Mailgun</option>
                  <option value="SMTP">SMTP</option>
                  <option value="AWS SES">AWS SES</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>API Key</label>
                <input type="password" value={emailSettings.apiKey} onChange={(e) => {
                  const updated = { ...emailSettings, apiKey: e.target.value }
                  setEmailSettings(updated)
                  saveEmailSettings(updated)
                  showSaved('Saved')
                }} placeholder="API key" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Sender Email</label>
              <input type="email" value={emailSettings.senderEmail} onChange={(e) => {
                const updated = { ...emailSettings, senderEmail: e.target.value }
                setEmailSettings(updated)
                saveEmailSettings(updated)
                showSaved('Saved')
              }} placeholder="assistant@nripa.com" className={inputClass} />
            </div>
          </div>
        )}

        {/* Google Sheets */}
        {activeSection === 'sheets' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800">Google Sheets</h2>
              <button onClick={() => {
                const updated = toggleEnabled('sheets', sheetsSettings, saveGoogleSheetsSettings)
                setSheetsSettings(updated)
                showSaved(updated.enabled ? 'Sheets enabled' : 'Sheets disabled')
              }}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  sheetsSettings.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'
                }`}
              >{sheetsSettings.enabled ? 'Enabled' : 'Disabled'}</button>
            </div>
            <p className="text-sm text-charcoal-400">Connect Google Sheets for data export.</p>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Spreadsheet ID</label>
                <input type="text" value={sheetsSettings.spreadsheetId} onChange={(e) => {
                  const updated = { ...sheetsSettings, spreadsheetId: e.target.value }
                  setSheetsSettings(updated)
                  saveGoogleSheetsSettings(updated)
                  showSaved('Saved')
                }} placeholder="From sheet URL" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sheet Name</label>
                <input type="text" value={sheetsSettings.sheetName} onChange={(e) => {
                  const updated = { ...sheetsSettings, sheetName: e.target.value }
                  setSheetsSettings(updated)
                  saveGoogleSheetsSettings(updated)
                  showSaved('Saved')
                }} placeholder="Sheet1" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Apps Script Webhook URL</label>
              <input type="text" value={sheetsSettings.appsScriptUrl} onChange={(e) => {
                const updated = { ...sheetsSettings, appsScriptUrl: e.target.value }
                setSheetsSettings(updated)
                  saveGoogleSheetsSettings(updated)
                  showSaved('Saved')
                }} placeholder="https://script.google.com/macros/s/..." className={inputClass} />
              </div>
            </div>
          )}

          {/* Razorpay */}
          {activeSection === 'razorpay' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-charcoal-800">Razorpay</h2>
                <button onClick={() => {
                  const updated = toggleEnabled('razorpay', razorpaySettings, saveRazorpaySettings)
                  setRazorpaySettings(updated)
                  showSaved(updated.enabled ? 'Razorpay enabled' : 'Razorpay disabled')
                }}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                    razorpaySettings.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'
                  }`}
                >{razorpaySettings.enabled ? 'Enabled' : 'Disabled'}</button>
              </div>
              <p className="text-sm text-charcoal-400">Configure Razorpay payment gateway.</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Key ID</label>
                  <input type="text" value={razorpaySettings.keyId} onChange={(e) => {
                    const updated = { ...razorpaySettings, keyId: e.target.value }
                    setRazorpaySettings(updated)
                    saveRazorpaySettings(updated)
                    showSaved('Saved')
                  }} placeholder="rzp_live_..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Key Secret</label>
                  <input type="password" value={razorpaySettings.keySecret} onChange={(e) => {
                    const updated = { ...razorpaySettings, keySecret: e.target.value }
                    setRazorpaySettings(updated)
                    saveRazorpaySettings(updated)
                    showSaved('Saved')
                  }} placeholder="Secret" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* PayPal */}
          {activeSection === 'paypal' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-charcoal-800">PayPal</h2>
                <button onClick={() => {
                  const updated = toggleEnabled('paypal', paypalSettings, savePaypalSettings)
                  setPaypalSettings(updated)
                  showSaved(updated.enabled ? 'PayPal enabled' : 'PayPal disabled')
                }}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                    paypalSettings.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'
                  }`}
                >{paypalSettings.enabled ? 'Enabled' : 'Disabled'}</button>
              </div>
              <p className="text-sm text-charcoal-400">Configure PayPal payment gateway.</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Client ID</label>
                  <input type="text" value={paypalSettings.clientId} onChange={(e) => {
                    const updated = { ...paypalSettings, clientId: e.target.value }
                    setPaypalSettings(updated)
                    savePaypalSettings(updated)
                    showSaved('Saved')
                  }} placeholder="Client ID" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Secret Key</label>
                  <input type="password" value={paypalSettings.secretKey} onChange={(e) => {
                    const updated = { ...paypalSettings, secretKey: e.target.value }
                    setPaypalSettings(updated)
                    savePaypalSettings(updated)
                    showSaved('Saved')
                  }} placeholder="Secret" className={inputClass} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
