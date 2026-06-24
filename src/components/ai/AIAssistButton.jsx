import { useState, useRef, useEffect } from 'react'
import { getAIService } from '../../services/ai'

export default function AIAssistButton({ onSuggestion, label = 'AI Assist', iconOnly = false }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = async () => {
    setOpen(true)
    setError('')
    setLoading(true)
    try {
      const ai = getAIService()
      if (!ai.available) {
        setError('AI is not configured. Set DEEPSEEK_API_KEY in your environment variables.')
        setLoading(false)
        return
      }
      await onSuggestion(ai, { setLoading, setError, setOpen })
    } catch (err) {
      setError(err.message || 'AI request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 transition-all duration-200 ${
          iconOnly
            ? 'w-8 h-8 rounded-lg hover:bg-primary-50 justify-center text-primary-500'
            : 'px-3 py-2 rounded-xl text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={label}
      >
        {loading ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        )}
        {!iconOnly && (loading ? 'Thinking...' : label)}
      </button>

      {error && open && (
        <div className="absolute top-full mt-2 right-0 z-50 w-72 bg-red-50 border border-red-100 rounded-xl p-3 shadow-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div className="text-xs text-red-600">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}
