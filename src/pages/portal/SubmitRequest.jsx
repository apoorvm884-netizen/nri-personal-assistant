import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { categories, REQUEST_TEMPLATES } from '../../config/appConfig'
import { getAIService } from '../../services/ai'

export default function SubmitRequest() {
  const { addRequest, user, canSubmitTask, remainingTasks, totalAvailableTasks, purchaseExtraTasks, planPrice } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'Medium',
  })
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templateFields, setTemplateFields] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [buyQty, setBuyQty] = useState(1)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const aiPopoverRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (aiPopoverRef.current && !aiPopoverRef.current.contains(e.target)) {
        setAiResult(null)
        setAiError('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmitTask) {
      setShowUpgradeModal(true)
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    addRequest(form)
    setSubmitting(false)
    setSubmitted(true)
  }

  const handleAIAssist = async () => {
    const desc = form.description.trim()
    if (!desc) {
      setAiError('Please enter a description first.')
      return
    }
    setAiLoading(true)
    setAiError('')
    setAiResult(null)
    try {
      const ai = getAIService()
      if (!ai.available) {
        setAiError('AI is not configured. Set DEEPSEEK_API_KEY in your environment variables to enable AI Assist.')
        return
      }
      const result = await ai.categorizeRequest(desc)
      setAiResult(result)
    } catch (err) {
      setAiError(err.message || 'AI categorization failed')
    } finally {
      setAiLoading(false)
    }
  }

  const applySuggestion = () => {
    if (!aiResult) return
    setForm((prev) => ({
      ...prev,
      title: aiResult.title || prev.title,
      category: aiResult.category || prev.category,
      priority: aiResult.priority || prev.priority,
    }))
    setAiResult(null)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-charcoal-100 p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-charcoal-800 mb-2">Request Submitted!</h2>
          <p className="text-charcoal-400 text-sm mb-8 max-w-md mx-auto">
            Your request has been received. Our team will review it and get back to you within 24 hours. You can track its progress from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(false)
                setForm({ title: '', category: '', description: '', priority: 'Medium' })
              }}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all"
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate('/portal/dashboard')}
              className="border border-charcoal-800 text-charcoal-800 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-charcoal-800 hover:text-white transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Submit a New Request</h1>
        <p className="text-charcoal-400 text-sm mt-1">Tell us what you need help with and we'll take it from here.</p>
        {user?.subscriptionPlan && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-medium text-charcoal-400">Plan:</span>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{user.subscriptionPlan}</span>
            <span className="text-xs text-charcoal-400">
              {user?.taskUsage || 0} tasks used
            </span>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              {remainingTasks} remaining
            </span>
            {remainingTasks <= 3 && remainingTasks > 0 && (
              <button type="button" onClick={() => setShowBuyModal(true)}
                className="text-xs font-semibold text-accent-600 hover:text-accent-700 px-2 py-0.5 rounded-full bg-accent-50 hover:bg-accent-100 transition-all"
              >
                Buy Extra Tasks
              </button>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Request Title</label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Set up recurring bill payments"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Category</label>
              <select
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all appearance-none bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Priority</label>
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    name="priority"
                    onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      form.priority === p
                        ? p === 'High' ? 'bg-red-500 text-white'
                          : p === 'Medium' ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                        : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Quick Template (Optional)</label>
            <select value={selectedTemplate} onChange={(e) => {
              const t = e.target.value
              setSelectedTemplate(t)
              setTemplateFields({})
              if (t) {
                setForm((prev) => ({ ...prev, category: t, title: '' }))
              }
            }}
              className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all appearance-none bg-white mb-4"
            >
              <option value="">Free-form request</option>
              {Object.keys(REQUEST_TEMPLATES).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {selectedTemplate && REQUEST_TEMPLATES[selectedTemplate] && (
              <div className="grid sm:grid-cols-2 gap-4 mb-4 p-4 rounded-xl bg-sage-50 border border-sage-100">
                {REQUEST_TEMPLATES[selectedTemplate].fields.map((f) => (
                  <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-charcoal-500 mb-1">{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={templateFields[f.name] || ''} onChange={(e) => setTemplateFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all bg-white"
                      >
                        <option value="">Select...</option>
                        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={templateFields[f.name] || ''} onChange={(e) => setTemplateFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                        placeholder={f.placeholder || ''}
                        className="w-full px-3 py-2.5 rounded-lg border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                      />
                    )}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <button type="button" onClick={() => {
                    const parts = Object.entries(templateFields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)
                    const desc = `${selectedTemplate} request:\n${parts.join('\n')}`
                    setForm((prev) => ({ ...prev, title: `${selectedTemplate} Request`, description: desc }))
                  }}
                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all"
                  >Generate Description from Template</button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-charcoal-500 uppercase tracking-wider">Description</label>
              <div className="relative" ref={aiPopoverRef}>
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  )}
                  {aiLoading ? 'Analyzing...' : 'AI Categorize'}
                </button>

                {aiResult && (
                  <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-white border border-primary-200 rounded-xl shadow-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <span className="text-xs font-semibold text-charcoal-700">AI Suggestion</span>
                    </div>
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-400 text-xs">Title</span>
                        <span className="text-charcoal-700 font-medium text-xs">{aiResult.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-400 text-xs">Category</span>
                        <span className="text-primary-600 font-medium text-xs">{aiResult.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-400 text-xs">Priority</span>
                        <span className={`text-xs font-semibold ${aiResult.priority === 'High' ? 'text-red-500' : aiResult.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                          {aiResult.priority}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={applySuggestion}
                      className="w-full bg-primary-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-primary-600 transition-all"
                    >
                      Apply Suggestion
                    </button>
                  </div>
                )}

                {aiError && !aiResult && (
                  <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-red-50 border border-red-100 rounded-xl p-3 shadow-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <p className="text-xs text-red-600">{aiError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <textarea
              name="description"
              required
              rows={6}
              value={form.description}
              onChange={handleChange}
              placeholder="Please provide as much detail as possible. Include deadlines, preferences, links, or any relevant information that will help us serve you better."
              className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/portal/dashboard')}
            className="px-6 py-3 rounded-xl text-sm font-medium text-charcoal-500 hover:bg-charcoal-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary-500 text-white px-8 py-3 rounded-xl text-sm font-semibold tracking-wide hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-800 text-center mb-2">Task Limit Reached</h2>
            <p className="text-sm text-charcoal-400 text-center mb-6">
              You have reached your task limit. Purchase additional tasks or upgrade your plan.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { name: 'Personal', price: '$10/mo', tasks: '10 tasks, $2/extra', popular: false },
                { name: 'Professional', price: '$20/mo', tasks: '25 tasks, $1.5/extra', popular: true },
                { name: 'Concierge', price: '$49/mo', tasks: '75 tasks, priority support', popular: false },
              ].map((p) => (
                <div key={p.name} className={`flex items-center justify-between p-3 rounded-xl border ${p.popular ? 'border-primary-500 bg-primary-50' : 'border-charcoal-100'}`}>
                  <div>
                    <p className="text-sm font-semibold text-charcoal-800">{p.name}</p>
                    <p className="text-xs text-charcoal-400">{p.tasks}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-charcoal-800">{p.price}</p>
                    {p.name === user?.subscriptionPlan && (
                      <span className="text-[10px] font-medium text-primary-600">Current</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-charcoal-50">
              <span className="text-xs text-charcoal-500">Need just a few more tasks?</span>
              <button type="button" onClick={() => { setShowUpgradeModal(false); setShowBuyModal(true) }}
                className="text-xs font-semibold text-accent-600 hover:text-accent-700"
              >
                Buy Extra Tasks
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all"
              >
                Later
              </button>
              <Link
                to="/pricing"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold text-center hover:bg-primary-600 transition-all"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Buy Extra Tasks Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl">
            <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-800 text-center mb-2">Buy Extra Tasks</h2>
            <p className="text-sm text-charcoal-400 text-center mb-6">
              Your plan allows ${planPrice.extraTask?.toFixed(2)} per additional task. Purchase more to keep submitting requests.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button type="button" onClick={() => setBuyQty(Math.max(1, buyQty - 1))}
                className="w-10 h-10 rounded-xl border border-charcoal-100 flex items-center justify-center hover:bg-charcoal-50 transition-all text-lg font-medium"
              >−</button>
              <span className="font-serif text-3xl font-bold text-charcoal-800 w-12 text-center">{buyQty}</span>
              <button type="button" onClick={() => setBuyQty(Math.min(50, buyQty + 1))}
                className="w-10 h-10 rounded-xl border border-charcoal-100 flex items-center justify-center hover:bg-charcoal-50 transition-all text-lg font-medium"
              >+</button>
            </div>
            <div className="text-center mb-6">
              <p className="text-sm text-charcoal-400">Total cost</p>
              <p className="font-serif text-3xl font-bold text-primary-600">${((planPrice.extraTask || 2) * buyQty).toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowBuyModal(false); setBuyQty(1) }}
                className="flex-1 px-4 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all"
              >Cancel</button>
              <button onClick={async () => { await purchaseExtraTasks(buyQty); setShowBuyModal(false); setBuyQty(1) }}
                className="flex-1 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold text-center hover:bg-primary-600 transition-all"
              >Purchase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
