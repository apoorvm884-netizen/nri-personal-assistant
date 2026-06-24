import { categories } from '../../config/appConfig'
import {
  CATEGORIZE_SYSTEM, CATEGORIZE_USER,
  REMINDER_SYSTEM, REMINDER_USER,
  SUMMARIZE_SYSTEM, SUMMARIZE_USER,
  EMAIL_SYSTEM, EMAIL_USER,
} from './prompts'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'
const PROXY_PATH = '/api/ai'

class AIService {
  constructor(config = {}) {
    this.apiKey = config.apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY || ''
    this.model = config.model || import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat'
    this.baseUrl = config.baseUrl || DEEPSEEK_BASE
    this.useProxy = !this.apiKey
  }

  get available() {
    return !!(this.apiKey || this.useProxy)
  }

  async call(messages, options = {}) {
    if (this.useProxy) {
      return this.callViaProxy(messages, options)
    }
    return this.callDirect(messages, options)
  }

  async callDirect(messages, options = {}) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 600,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`AI API error (${res.status}): ${body}`)
    }

    const data = await res.json()
    return data.choices[0].message.content.trim()
  }

  async callViaProxy(messages, options = {}) {
    const res = await fetch(PROXY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, options }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `AI proxy error (${res.status})`)
    }

    const data = await res.json()
    return data.choices[0].message.content.trim()
  }

  async categorizeRequest(description) {
    const content = await this.call([
      { role: 'system', content: CATEGORIZE_SYSTEM },
      { role: 'user', content: CATEGORIZE_USER(description, categories) },
    ], { temperature: 0.2 })
    return JSON.parse(content)
  }

  async suggestReminders(requests) {
    const today = new Date().toISOString().split('T')[0]
    const active = requests
      .filter((r) => r.status !== 'Completed')
      .map(({ title, category, priority, description }) => ({ title, category, priority, description }))

    const content = await this.call([
      { role: 'system', content: REMINDER_SYSTEM },
      { role: 'user', content: REMINDER_USER(active, today) },
    ], { temperature: 0.4, maxTokens: 800 })
    return JSON.parse(content)
  }

  async summarizeRequest(request) {
    const content = await this.call([
      { role: 'system', content: SUMMARIZE_SYSTEM },
      { role: 'user', content: SUMMARIZE_USER(request) },
    ], { temperature: 0.3, maxTokens: 200 })
    return content
  }

  async draftEmailResponse(request) {
    const content = await this.call([
      { role: 'system', content: EMAIL_SYSTEM },
      { role: 'user', content: EMAIL_USER(request) },
    ], { temperature: 0.5, maxTokens: 600 })
    return content
  }
}

let instance = null

export function getAIService() {
  if (!instance) {
    instance = new AIService()
  }
  return instance
}

export function createAIService(config) {
  return new AIService(config)
}
