const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY

  if (!apiKey) {
    return res.status(400).json({
      error: 'DeepSeek API key is not configured. Set DEEPSEEK_API_KEY in Vercel environment variables.',
    })
  }

  try {
    const { messages, options = {} } = req.body

    const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 600,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      return res.status(response.status).json({
        error: `DeepSeek API error (${response.status}): ${body}`,
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
