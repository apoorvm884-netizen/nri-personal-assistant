import { useState, useMemo, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAIService } from '../../services/ai'
import { REMINDER_CATEGORIES, REMINDER_PRIORITIES, computeReminderStatus } from '../../services/reminderService'

const reminderTypes = ['one-time', 'monthly', 'quarterly', 'yearly']
const preferences = ['app', 'email', 'both']

const typeLabels = { 'one-time': 'One-time', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' }
const prefLabels = { app: 'App Notification', email: 'Email Notification', both: 'Both' }

const typeColors = { 'one-time': 'bg-blue-50 text-blue-600', monthly: 'bg-purple-50 text-purple-600', quarterly: 'bg-amber-50 text-amber-600', yearly: 'bg-green-50 text-green-600' }
const prefColors = { app: 'bg-primary-50 text-primary-600', email: 'bg-sage-50 text-sage-700', both: 'bg-accent-50 text-accent-700' }

const statusColors = {
  Active: 'bg-blue-50 text-blue-600',
  Upcoming: 'bg-purple-50 text-purple-600',
  'Due Soon': 'bg-red-50 text-red-600',
  Completed: 'bg-green-50 text-green-600',
  Cancelled: 'bg-charcoal-50 text-charcoal-500',
}

const priorityColors = {
  High: 'bg-red-50 text-red-600',
  Medium: 'bg-amber-50 text-amber-600',
  Low: 'bg-blue-50 text-blue-600',
}

const categoryColors = {
  Visa: 'bg-indigo-50 text-indigo-600',
  Passport: 'bg-blue-50 text-blue-600',
  Tax: 'bg-red-50 text-red-600',
  Insurance: 'bg-purple-50 text-purple-600',
  Subscription: 'bg-teal-50 text-teal-600',
  Family: 'bg-pink-50 text-pink-600',
  Medical: 'bg-green-50 text-green-600',
  Custom: 'bg-charcoal-50 text-charcoal-600',
}

export default function ReminderCenter() {
  const { reminders, toggleReminder, deleteReminder, addReminder, updateReminder, requests } = useAuth()
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [newReminder, setNewReminder] = useState({ title: '', description: '', date: '', time: '12:00', type: 'one-time', category: 'Custom', priority: 'Medium', preference: 'both' })
  const [detailId, setDetailId] = useState(null)
  const [showSchedule, setShowSchedule] = useState({})

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const aiRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (aiRef.current && !aiRef.current.contains(e.target)) {
        setAiSuggestions(null)
        setAiError('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'active') return reminders.filter((r) => !r.completed && !r.cancelled)
    if (filter === 'completed') return reminders.filter((r) => r.completed || r.cancelled)
    if (filter === 'due_soon') return reminders.filter((r) => computeReminderStatus(r) === 'Due Soon')
    if (filter === 'upcoming') return reminders.filter((r) => computeReminderStatus(r) === 'Upcoming')
    return reminders
  }, [reminders, filter])

  const activeCount = reminders.filter((r) => !r.completed && !r.cancelled).length
  const dueSoonCount = reminders.filter((r) => computeReminderStatus(r) === 'Due Soon').length

  const today = new Date().toISOString().split('T')[0]
  const isOverdue = (date) => date < today

  const openForm = (rem = null) => {
    if (rem) {
      setEditId(rem.id)
      setNewReminder({ title: rem.title, description: rem.description || '', date: rem.date, time: rem.time || '12:00', type: rem.type || 'one-time', category: rem.category || 'Custom', priority: rem.priority || 'Medium', preference: rem.preference || 'app' })
    } else {
      setEditId(null)
      setNewReminder({ title: '', description: '', date: '', time: '12:00', type: 'one-time', category: 'Custom', priority: 'Medium', preference: 'both' })
    }
    setShowForm(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!newReminder.title.trim() || !newReminder.date) return
    if (editId) {
      updateReminder(editId, newReminder)
    } else {
      addReminder(newReminder)
    }
    setNewReminder({ title: '', description: '', date: '', time: '12:00', type: 'one-time', category: 'Custom', priority: 'Medium', preference: 'both' })
    setShowForm(false)
    setEditId(null)
  }

  const handleAISuggest = async () => {
    setAiLoading(true)
    setAiError('')
    setAiSuggestions(null)
    try {
      const ai = getAIService()
      if (!ai.available) {
        setAiError('AI is not configured. Set DEEPSEEK_API_KEY in your environment variables to enable AI suggestions.')
        return
      }
      const suggestions = await ai.suggestReminders(requests)
      setAiSuggestions(suggestions)
    } catch (err) {
      setAiError(err.message || 'Failed to generate suggestions')
    } finally {
      setAiLoading(false)
    }
  }

  const addSuggested = (item) => {
    addReminder({ title: item.title, date: item.date })
  }

  const addAllSuggested = () => {
    if (!aiSuggestions) return
    aiSuggestions.forEach((item) => addReminder({ title: item.title, date: item.date }))
    setAiSuggestions(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Reminder Center</h1>
          <p className="text-charcoal-400 text-sm mt-1">
            {activeCount} active {dueSoonCount > 0 && <span className="text-red-500 font-semibold">&middot; {dueSoonCount} due soon</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative" ref={aiRef}>
            <button onClick={handleAISuggest} disabled={aiLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              )}
              {aiLoading ? 'Thinking...' : 'AI Suggest'}
            </button>
            {aiSuggestions && (
              <div className="absolute top-full right-0 mt-2 z-50 w-96 bg-white border border-primary-200 rounded-xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span className="text-xs font-semibold text-charcoal-700">Suggested Reminders</span>
                  </div>
                  <button onClick={addAllSuggested} className="text-[10px] font-semibold text-primary-600 hover:text-primary-700 transition-colors">Add All</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {aiSuggestions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-charcoal-50 hover:bg-charcoal-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-charcoal-700 truncate">{item.title}</p>
                        <p className="text-[10px] text-charcoal-400 mt-0.5">Due: {item.date}</p>
                      </div>
                      <button onClick={() => addSuggested(item)} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-accent-50 text-accent-600 hover:bg-accent-100 transition-colors flex-shrink-0">Add</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {aiError && !aiSuggestions && (
              <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-red-50 border border-red-100 rounded-xl p-3 shadow-lg">
                <p className="text-xs text-red-600">{aiError}</p>
              </div>
            )}
          </div>
          <button onClick={() => openForm()} className="bg-primary-500 text-white hover:bg-primary-600 px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 self-start">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Reminder
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-primary-500 shadow-lg shadow-primary-500/5 p-5 mb-6">
          <h3 className="font-serif text-base font-semibold text-charcoal-800 mb-4">{editId ? 'Edit Reminder' : 'New Reminder'}</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-charcoal-500 mb-1 uppercase tracking-wider">Title</label>
              <input type="text" required value={newReminder.title} onChange={(e) => setNewReminder((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Pay credit card bill" className="w-full px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-charcoal-500 mb-1 uppercase tracking-wider">Description</label>
              <textarea value={newReminder.description} onChange={(e) => setNewReminder((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description..." className="w-full px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none" rows={2} />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1 uppercase tracking-wider">Due Date</label>
              <input type="date" required value={newReminder.date} onChange={(e) => setNewReminder((p) => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1 uppercase tracking-wider">Due Time</label>
              <input type="time" required value={newReminder.time} onChange={(e) => setNewReminder((p) => ({ ...p, time: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1 uppercase tracking-wider">Category</label>
              <div className="flex gap-1.5 flex-wrap">
                {REMINDER_CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => setNewReminder((p) => ({ ...p, category: c }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${newReminder.category === c ? 'bg-primary-500 text-white' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'}`}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1 uppercase tracking-wider">Priority</label>
              <div className="flex gap-1.5 flex-wrap">
                {REMINDER_PRIORITIES.map((p) => (
                  <button key={p} type="button" onClick={() => setNewReminder((prev) => ({ ...prev, priority: p }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${newReminder.priority === p ? 'bg-primary-500 text-white' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'}`}
                  >{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1 uppercase tracking-wider">Reminder Type</label>
              <div className="flex gap-1.5 flex-wrap">
                {reminderTypes.map((t) => (
                  <button key={t} type="button" onClick={() => setNewReminder((p) => ({ ...p, type: t }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${newReminder.type === t ? 'bg-primary-500 text-white' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'}`}
                  >{typeLabels[t]}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1 uppercase tracking-wider">Notification Preference</label>
              <div className="flex gap-1.5 flex-wrap">
                {preferences.map((p) => (
                  <button key={p} type="button" onClick={() => setNewReminder((prev) => ({ ...prev, preference: p }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${newReminder.preference === p ? 'bg-primary-500 text-white' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'}`}
                  >{prefLabels[p]}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 rounded-xl text-sm font-medium text-charcoal-500 hover:bg-charcoal-50 transition-colors">Cancel</button>
            <button type="submit" className="bg-primary-500 text-white hover:bg-primary-600 px-5 py-2 rounded-xl text-sm font-semibold">{editId ? 'Update' : 'Add Reminder'}</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: `All (${reminders.length})` },
          { key: 'active', label: `Active (${activeCount})` },
          { key: 'due_soon', label: `Due Soon (${dueSoonCount})` },
          { key: 'completed', label: `Completed (${reminders.filter((r) => r.completed || r.cancelled).length})` },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === tab.key ? 'bg-primary-500 text-white' : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100'}`}
          >{tab.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-12 text-center">
          <p className="text-charcoal-400 text-sm">
            {filter === 'completed' ? 'No completed reminders yet.' : filter === 'due_soon' ? 'No reminders due soon.' : filter === 'active' ? "No active reminders. You're all set!" : 'No reminders yet. Add one to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((rem) => {
            const status = computeReminderStatus(rem)
            const overdue = !rem.completed && !rem.cancelled && isOverdue(rem.date)
            const expanded = detailId === rem.id
            const schedExpanded = showSchedule[rem.id]
            return (
              <div key={rem.id}
                className={`bg-white rounded-xl border p-4 transition-all ${rem.completed ? 'border-green-100 bg-green-50/30' : overdue ? 'border-red-100 bg-red-50/30 shadow-sm shadow-red-100' : 'border-charcoal-100'}`}
              >
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleReminder(rem.id, !rem.completed)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${rem.completed ? 'bg-green-500 border-green-500' : 'border-charcoal-300 hover:border-primary-500'}`}
                  >
                    {rem.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDetailId(expanded ? null : rem.id)}>
                    <p className={`text-sm font-medium ${rem.completed ? 'text-charcoal-400 line-through' : 'text-charcoal-800'}`}>{rem.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {overdue ? (
                        <span className="text-xs text-red-500 font-semibold">Overdue: {rem.date} at {rem.time}</span>
                      ) : rem.completed ? (
                        <span className="text-xs text-charcoal-400">Completed</span>
                      ) : (
                        <span className="text-xs text-charcoal-400">Due: {rem.date} at {rem.time}</span>
                      )}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[status] || 'bg-charcoal-50 text-charcoal-500'}`}>{status}</span>
                      {rem.category && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${categoryColors[rem.category] || 'bg-charcoal-50 text-charcoal-500'}`}>{rem.category}</span>}
                      {rem.priority && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priorityColors[rem.priority] || 'bg-charcoal-50 text-charcoal-500'}`}>{rem.priority}</span>}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeColors[rem.type] || 'bg-charcoal-50 text-charcoal-500'}`}>{typeLabels[rem.type] || rem.type}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${prefColors[rem.preference] || 'bg-charcoal-50 text-charcoal-500'}`}>{prefLabels[rem.preference] || rem.preference}</span>
                    </div>

                    {expanded && (
                      <div className="mt-3 space-y-3">
                        {rem.description && (
                          <p className="text-xs text-charcoal-600 px-3 py-2 rounded-lg bg-charcoal-50">{rem.description}</p>
                        )}

                        {/* Schedule */}
                        {(rem.schedule || []).length > 0 && (
                          <div>
                            <button onClick={(e) => { e.stopPropagation(); setShowSchedule((prev) => ({ ...prev, [rem.id]: !prev[rem.id] })) }}
                              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                            >
                              {schedExpanded ? 'Hide' : 'Show'} Schedule ({rem.schedule.length} reminders)
                            </button>
                            {schedExpanded && (
                              <div className="mt-2 space-y-1">
                                {rem.schedule.map((s, i) => {
                                  const schedDate = s.triggerDate
                                  const isPast = schedDate <= today
                                  return (
                                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${s.triggered ? 'bg-green-50' : isPast ? 'bg-red-50' : 'bg-charcoal-50'}`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${s.triggered ? 'bg-green-500' : isPast ? 'bg-red-500' : 'bg-charcoal-400'}`} />
                                      <span className="font-medium text-charcoal-700">{s.daysBefore === 0 ? 'Same Day' : `${s.daysBefore} Days Before`}</span>
                                      <span className="text-charcoal-400">{s.triggerDate}</span>
                                      {s.triggered && <span className="text-green-600 font-medium">Triggered</span>}
                                      {!s.triggered && isPast && <span className="text-red-600 font-medium">Missed</span>}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timeline */}
                        {(rem.timeline || []).length > 0 && (
                          <div className="px-3 py-2 rounded-lg bg-charcoal-50">
                            <p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Activity Timeline</p>
                            <div className="space-y-1">
                              {[...rem.timeline].reverse().map((entry, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                                  <span className="text-charcoal-500">{new Date(entry.timestamp).toLocaleString()}</span>
                                  <span className="font-medium text-charcoal-700">{entry.action}</span>
                                  {entry.detail && <span className="text-charcoal-400">— {entry.detail}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button onClick={(e) => { e.stopPropagation(); openForm(rem) }} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); toggleReminder(rem.id, !rem.completed) }} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">{rem.completed ? 'Undo' : 'Complete'}</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteReminder(rem.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
