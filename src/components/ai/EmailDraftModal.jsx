import { useState } from 'react'
import { getAIService } from '../../services/ai'

export default function EmailDraftModal({ request, onClose }) {
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const ai = getAIService()
      if (!ai.available) {
        setError('AI is not configured. Set DEEPSEEK_API_KEY in your environment variables.')
        return
      }
      const text = await ai.draftEmailResponse(request)
      setDraft(text)
    } catch (err) {
      setError(err.message || 'Failed to generate draft')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100">
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal-800">Draft Email Response</h3>
            <p className="text-xs text-charcoal-400 mt-0.5">{request.id} &middot; {request.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-400 hover:bg-charcoal-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!draft && !loading && !error && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                </svg>
              </div>
              <p className="text-sm text-charcoal-500 mb-1">Generate a professional email response</p>
              <p className="text-xs text-charcoal-400">The AI will use the request details and notes to draft a reply.</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-charcoal-500">Writing draft...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {draft && (
            <div className="relative">
              <textarea
                readOnly
                rows={14}
                value={draft}
                className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm text-charcoal-700 leading-relaxed resize-none focus:outline-none"
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-charcoal-100 text-charcoal-500 hover:bg-charcoal-50 transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-charcoal-100 flex items-center justify-between gap-3">
          <p className="text-[10px] text-charcoal-400">
            AI-generated draft &middot; Review before sending
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-charcoal-500 hover:bg-charcoal-50 transition-colors"
            >
              Close
            </button>
            {!draft && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary-500 text-white hover:bg-primary-600 px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {loading ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                )}
                Generate Draft
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
