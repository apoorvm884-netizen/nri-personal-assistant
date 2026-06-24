import { useState, useMemo } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { REQUEST_STATUSES, OUTCOME_TYPES } from '../../config/appConfig'
import { getAIService } from '../../services/ai'

const statusColors = {
  Submitted: 'bg-amber-50 text-amber-600 border-amber-100',
  Assigned: 'bg-blue-50 text-blue-600 border-blue-100',
  Researching: 'bg-purple-50 text-purple-600 border-purple-100',
  'Waiting for Customer': 'bg-orange-50 text-orange-600 border-orange-100',
  Approved: 'bg-teal-50 text-teal-600 border-teal-100',
  'In Progress': 'bg-primary-50 text-primary-600 border-primary-100',
  Completed: 'bg-green-50 text-green-600 border-green-100',
  Cancelled: 'bg-red-50 text-red-600 border-red-100',
}

const priorityColors = {
  High: 'bg-red-50 text-red-600 border-red-100',
  Medium: 'bg-amber-50 text-amber-600 border-amber-100',
  Low: 'bg-blue-50 text-blue-600 border-blue-100',
}

const statusIndex = Object.fromEntries(REQUEST_STATUSES.map((s, i) => [s, i]))

export default function AdminRequests() {
  const { requests, addNoteToRequest, admin, users,
    acceptRequest, requestMoreInfo, sendUpdate, markInProgress,
    requestApproval, rejectRequest,
    setOutcome, setProposedSolution, markActionRequired, clearActionRequired,
    addCallLog, addWhatsappLog, setNextAction } = useAdmin()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [messageInputs, setMessageInputs] = useState({})
  const [actionModal, setActionModal] = useState({ id: null, type: null })
  const [solutionModal, setSolutionModal] = useState(null)
  const [outcomeModal, setOutcomeModal] = useState(null)
  const [actionNoteModal, setActionNoteModal] = useState(null)
  const [summaries, setSummaries] = useState({})
  const [loadingSummary, setLoadingSummary] = useState(null)
  const [queueView, setQueueView] = useState('all')
  const [callLogForm, setCallLogForm] = useState({})
  const [whatsappLogForm, setWhatsappLogForm] = useState({})
  const [nextActionForm, setNextActionForm] = useState({})

  const searchFiltered = useMemo(() => {
    let result = [...requests]
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) || (r.userName || '').toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [requests, search, statusFilter])

  const queues = useMemo(() => ({
    all: requests,
    new: requests.filter((r) => r.status === 'Submitted'),
    active: requests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled' && r.status !== 'Submitted'),
    waiting: requests.filter((r) => r.actionRequired && r.status !== 'Completed' && r.status !== 'Cancelled'),
    completed: requests.filter((r) => r.status === 'Completed' || r.status === 'Cancelled'),
  }), [requests])

  const currentQueue = queues[queueView] || requests
  const queueFiltered = useMemo(() => {
    if (queueView === 'all') return searchFiltered
    return currentQueue.filter((r) => {
      if (statusFilter !== 'all') return r.status === statusFilter
      return true
    })
  }, [queueView, searchFiltered, currentQueue, statusFilter])

  const getUserInfo = (userId) => users.find((u) => u.id === userId)

  const handleSummarize = async (req) => {
    if (summaries[req.id]) { setSummaries((prev) => ({ ...prev, [req.id]: '' })); return }
    setLoadingSummary(req.id)
    try {
      const ai = getAIService()
      if (!ai.available) { setSummaries((prev) => ({ ...prev, [req.id]: 'AI not configured.' })); return }
      const text = await ai.summarizeRequest(req)
      setSummaries((prev) => ({ ...prev, [req.id]: text }))
    } catch (err) {
      setSummaries((prev) => ({ ...prev, [req.id]: err.message || 'Summary failed' }))
    } finally { setLoadingSummary(null) }
  }

  const handleAdminAction = (action, id) => {
    switch (action) {
      case 'Accept': acceptRequest(id); break
      case 'Request More Information': setActionModal({ id, type: 'request_more_info' }); break
      case 'Mark In Progress': markInProgress(id); break
      case 'Send Update': setActionModal({ id, type: 'send_update' }); break
      case 'Request Approval': setActionModal({ id, type: 'request_approval' }); break
      default: break
    }
  }

  const handleModalSubmit = (id) => {
    const modalType = actionModal.type
    const text = messageInputs[id]?.trim()
    switch (modalType) {
      case 'request_more_info': if (text) requestMoreInfo(id, text); break
      case 'send_update': sendUpdate(id, text || ''); break
      case 'request_approval': if (text) requestApproval(id, text); break
    }
    setMessageInputs((prev) => ({ ...prev, [id]: '' }))
    setActionModal({ id: null, type: null })
  }

  const renderModal = (req) => {
    const modalType = actionModal.type
    if (!modalType || !req) return null
    const titles = { request_more_info: 'Request More Information', send_update: 'Send Update to Customer', request_approval: 'Request Approval' }
    const placeholders = { request_more_info: 'What additional information do you need?', send_update: 'Write your update message...', request_approval: 'Describe what has been completed...' }
    const btnLabels = { request_more_info: 'Send Request', send_update: 'Send Update', request_approval: 'Send for Approval' }
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setActionModal({ id: null, type: null })}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">{titles[modalType]}</h3>
          <p className="text-sm text-charcoal-500 mb-4">Request: {req.title}</p>
          <textarea value={messageInputs[req.id] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, [req.id]: e.target.value }))}
            placeholder={placeholders[modalType]}
            className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none" rows={4}
          />
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleModalSubmit(req.id)}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all"
            >{btnLabels[modalType]}</button>
            <button onClick={() => setActionModal({ id: null, type: null })}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 transition-all"
            >Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  const renderSolutionModal = () => {
    if (!solutionModal) return null
    const req = requests.find((r) => r.id === solutionModal)
    if (!req) return null
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSolutionModal(null)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">Propose Solution</h3>
          <p className="text-sm text-charcoal-500 mb-4">{req?.title}</p>
          <div className="space-y-3">
            <input value={messageInputs['sol-title'] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, 'sol-title': e.target.value }))}
              placeholder="Solution title e.g. Birthday Gift Package" className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <textarea value={messageInputs['sol-desc'] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, 'sol-desc': e.target.value }))}
              placeholder="Describe the proposed solution..." className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <input value={messageInputs['sol-opt1-name'] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, 'sol-opt1-name': e.target.value }))}
                placeholder="Option 1 name" className="px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <input type="number" value={messageInputs['sol-opt1-cost'] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, 'sol-opt1-cost': e.target.value }))}
                placeholder="Cost $" className="px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <input value={messageInputs['sol-opt2-name'] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, 'sol-opt2-name': e.target.value }))}
                placeholder="Option 2 name (optional)" className="px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <input type="number" value={messageInputs['sol-opt2-cost'] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, 'sol-opt2-cost': e.target.value }))}
                placeholder="Cost $" className="px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <input type="number" value={messageInputs['sol-total'] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, 'sol-total': e.target.value }))}
              placeholder="Total estimated cost $" className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => {
              const title = messageInputs['sol-title']?.trim()
              const desc = messageInputs['sol-desc']?.trim()
              const total = parseFloat(messageInputs['sol-total']) || 0
              if (!title) return
              const options = []
              if (messageInputs['sol-opt1-name']) options.push({ name: messageInputs['sol-opt1-name'], cost: parseFloat(messageInputs['sol-opt1-cost']) || 0 })
              if (messageInputs['sol-opt2-name']) options.push({ name: messageInputs['sol-opt2-name'], cost: parseFloat(messageInputs['sol-opt2-cost']) || 0 })
              setProposedSolution(solutionModal, { title, description: desc || '', options, estimatedCost: total || options.reduce((s, o) => s + o.cost, 0) })
              setMessageInputs({})
              setSolutionModal(null)
              markActionRequired(solutionModal, 'Please review the proposed solution and provide your approval.')
            }}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all"
            >Create & Send Proposal</button>
            <button onClick={() => { setSolutionModal(null); setMessageInputs({}) }}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 transition-all"
            >Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  const renderOutcomeModal = () => {
    if (!outcomeModal) return null
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setOutcomeModal(null)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">Set Outcome</h3>
          <p className="text-sm text-charcoal-500 mb-4">Select the outcome for this request</p>
          <div className="space-y-2">
            {OUTCOME_TYPES.map((o) => (
              <button key={o} onClick={() => { setOutcome(outcomeModal, o); setOutcomeModal(null) }}
                className="w-full text-left px-4 py-3 rounded-xl border border-charcoal-100 text-sm font-medium text-charcoal-700 hover:bg-primary-50 hover:border-primary-200 transition-all"
              >{o}</button>
            ))}
          </div>
          <button onClick={() => setOutcomeModal(null)}
            className="mt-3 text-sm font-semibold px-4 py-2.5 rounded-xl bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 transition-all w-full"
          >Cancel</button>
        </div>
      </div>
    )
  }

  const renderActionNoteModal = () => {
    if (!actionNoteModal) return null
    const req = requests.find((r) => r.id === actionNoteModal)
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setActionNoteModal(null)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">Mark Action Required</h3>
          <p className="text-sm text-charcoal-500 mb-4">{req?.title}</p>
          <textarea value={messageInputs['action-note'] || ''} onChange={(e) => setMessageInputs((prev) => ({ ...prev, 'action-note': e.target.value }))}
            placeholder="Describe what action is needed from the customer..."
            className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" rows={3}
          />
          <div className="flex gap-2 mt-4">
            <button onClick={() => { markActionRequired(actionNoteModal, messageInputs['action-note']?.trim() || 'Action required from you.'); setMessageInputs((prev) => ({ ...prev, 'action-note': '' })); setActionNoteModal(null) }}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all"
            >Mark as Action Required</button>
            <button onClick={() => { setActionNoteModal(null); setMessageInputs((prev) => ({ ...prev, 'action-note': '' })) }}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 transition-all"
            >Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  const renderCallLogForm = (req) => {
    const f = callLogForm[req.id] || {}
    return (
      <div className="mb-4 p-4 rounded-xl bg-charcoal-50 border border-charcoal-200">
        <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Log Call</p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input value={f.agent || ''} onChange={(e) => setCallLogForm((prev) => ({ ...prev, [req.id]: { ...prev[req.id], agent: e.target.value } }))}
            placeholder="Agent name" className="px-3 py-2 rounded-lg border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          <select value={f.outcome || ''} onChange={(e) => setCallLogForm((prev) => ({ ...prev, [req.id]: { ...prev[req.id], outcome: e.target.value } }))}
            className="px-3 py-2 rounded-lg border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">Outcome...</option>
            <option value="Connected">Connected</option>
            <option value="Voicemail">Voicemail</option>
            <option value="No Answer">No Answer</option>
            <option value="Callback Scheduled">Callback Scheduled</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button onClick={() => {
            const data = callLogForm[req.id]
            if (!data?.agent || !data?.outcome) return
            addCallLog(req.id, { agent: data.agent, outcome: data.outcome, note: data.note || '' })
            setCallLogForm((prev) => ({ ...prev, [req.id]: {} }))
          }}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all"
          >Log Call</button>
        </div>
        <input value={f.note || ''} onChange={(e) => setCallLogForm((prev) => ({ ...prev, [req.id]: { ...prev[req.id], note: e.target.value } }))}
          placeholder="Optional note about the call..." className="w-full px-3 py-2 rounded-lg border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>
    )
  }

  const renderWhatsappLogForm = (req) => {
    const f = whatsappLogForm[req.id] || {}
    return (
      <div className="mb-4 p-4 rounded-xl bg-charcoal-50 border border-charcoal-200">
        <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Log WhatsApp</p>
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 mb-2 items-end">
          <input value={f.agent || ''} onChange={(e) => setWhatsappLogForm((prev) => ({ ...prev, [req.id]: { ...prev[req.id], agent: e.target.value } }))}
            placeholder="Agent name" className="px-3 py-2 rounded-lg border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          <select value={f.direction || ''} onChange={(e) => setWhatsappLogForm((prev) => ({ ...prev, [req.id]: { ...prev[req.id], direction: e.target.value } }))}
            className="px-3 py-2 rounded-lg border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">Direction...</option>
            <option value="Sent">Sent</option>
            <option value="Received">Received</option>
          </select>
          <button onClick={() => {
            const data = whatsappLogForm[req.id]
            if (!data?.agent || !data?.direction) return
            addWhatsappLog(req.id, { agent: data.agent, direction: data.direction, note: data.note || '' })
            setWhatsappLogForm((prev) => ({ ...prev, [req.id]: {} }))
          }}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-all"
          >Log</button>
        </div>
        <input value={f.note || ''} onChange={(e) => setWhatsappLogForm((prev) => ({ ...prev, [req.id]: { ...prev[req.id], note: e.target.value } }))}
          placeholder="WhatsApp note / message summary..." className="w-full px-3 py-2 rounded-lg border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>
    )
  }

  const renderCallLogs = (req) => {
    const logs = req.callLogs || []
    return (
      <div className="mb-4">
        <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Call Logs ({logs.length})</p>
        {logs.length === 0 && <p className="text-xs text-charcoal-400 italic mb-2">No calls logged.</p>}
        <div className="space-y-1.5 mb-2">
          {logs.map((entry, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-50/50 border border-blue-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-charcoal-700">{entry.agent}</span>
                  <span className="text-blue-600 font-semibold">{entry.outcome}</span>
                  <span className="text-charcoal-400">{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                {entry.note && <p className="text-xs text-charcoal-500 mt-0.5">{entry.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderWhatsappLogs = (req) => {
    const logs = req.whatsappLogs || []
    return (
      <div className="mb-4">
        <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">WhatsApp Logs ({logs.length})</p>
        {logs.length === 0 && <p className="text-xs text-charcoal-400 italic mb-2">No WhatsApp messages logged.</p>}
        <div className="space-y-1.5 mb-2">
          {logs.map((entry, i) => (
            <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${entry.direction === 'Sent' ? 'bg-green-50/50 border-green-100' : 'bg-purple-50/50 border-purple-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${entry.direction === 'Sent' ? 'bg-green-500' : 'bg-purple-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-charcoal-700">{entry.agent}</span>
                  <span className={`font-semibold ${entry.direction === 'Sent' ? 'text-green-600' : 'text-purple-600'}`}>{entry.direction}</span>
                  <span className="text-charcoal-400">{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                {entry.note && <p className="text-xs text-charcoal-500 mt-0.5">{entry.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderNextAction = (req) => {
    return (
      <div className="mb-4 p-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Next Action</p>
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 mb-2 items-end">
          <select value={nextActionForm[req.id]?.action || req.nextAction || ''}
            onChange={(e) => setNextActionForm((prev) => ({ ...prev, [req.id]: { ...prev[req.id], action: e.target.value } }))}
            className="px-3 py-2 rounded-lg border border-amber-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="">Select next action...</option>
            <option value="Call Customer">Call Customer</option>
            <option value="Send Reminder">Send Reminder</option>
            <option value="Contact Vendor">Contact Vendor</option>
            <option value="Await Approval">Await Approval</option>
            <option value="Research">Research</option>
            <option value="Escalate">Escalate</option>
            <option value="Follow Up">Follow Up</option>
          </select>
          <input type="date" value={nextActionForm[req.id]?.dueDate || req.dueDate || ''}
            onChange={(e) => setNextActionForm((prev) => ({ ...prev, [req.id]: { ...prev[req.id], dueDate: e.target.value } }))}
            className="px-3 py-2 rounded-lg border border-amber-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          <button onClick={() => {
            const data = nextActionForm[req.id]
            const action = data?.action || req.nextAction
            if (!action) return
            setNextAction(req.id, { action, dueDate: data?.dueDate || req.dueDate || '' })
            setNextActionForm((prev) => ({ ...prev, [req.id]: {} }))
          }}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-all"
          >Set</button>
        </div>
        {req.nextAction && (
          <div className="flex items-center gap-2 text-xs text-amber-800">
            <span className="font-semibold">{req.nextAction}</span>
            {req.dueDate && (
              <span className={new Date(req.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-amber-600'}>
                Due: {req.dueDate}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderActivityTimeline = (req) => {
    const log = req.activityLog || []
    return (
      <div className="mb-4">
        <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Activity Timeline</p>
        {log.length === 0 && <p className="text-xs text-charcoal-400 italic">No activity recorded yet.</p>}
        <div className="space-y-0">
          {[...log].reverse().map((entry, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 relative">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  entry.type === 'status' ? 'bg-primary-500' :
                  entry.type === 'note' ? 'bg-amber-500' :
                  entry.type === 'call' ? 'bg-blue-500' :
                  entry.type === 'whatsapp' ? 'bg-green-500' :
                  entry.type === 'next_action' ? 'bg-purple-500' :
                  entry.type === 'assigned' ? 'bg-indigo-500' :
                  'bg-charcoal-400'
                }`} />
                {i < log.length - 1 && <div className="w-px h-full bg-charcoal-200 mt-1" />}
              </div>
              <div className="min-w-0 flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-charcoal-700">{entry.action}</span>
                  <span className="text-[10px] text-charcoal-400">{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                {entry.author && <span className="text-[10px] text-charcoal-500">by {entry.author}</span>}
                {entry.detail && <p className="text-[10px] text-charcoal-400 truncate">{entry.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderRequestCard = (req) => {
    const isExpanded = expandedId === req.id
    const summary = summaries[req.id]
    const isSummarizing = loadingSummary === req.id
    const userInfo = getUserInfo(req.userId)
    const conv = req.conversation || []
    const needsAction = req.actionRequired && req.status !== 'Completed' && req.status !== 'Cancelled'

    const activeActions = []
    if (req.status === 'Submitted') activeActions.push('Accept')
    if (req.status === 'Assigned' || req.status === 'Researching' || req.status === 'In Progress') {
      activeActions.push('Request More Information', 'Send Update')
    }
    if (req.status === 'Assigned' || req.status === 'Researching') activeActions.push('Mark In Progress')
    if (req.status === 'In Progress') activeActions.push('Request Approval')

    return (
      <div key={req.id} className={`bg-white rounded-2xl border transition-all duration-200 ${
        isExpanded ? 'border-primary-500 shadow-lg shadow-primary-500/5' : needsAction ? 'border-red-300 ring-1 ring-red-200' : 'border-charcoal-100'
      }`}>
        <button onClick={() => setExpandedId(isExpanded ? null : req.id)}
          className="w-full flex items-start gap-4 p-5 md:p-6 text-left"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            req.status === 'Completed' ? 'bg-green-50 text-green-600'
            : req.status === 'Cancelled' ? 'bg-red-50 text-red-600'
            : 'bg-amber-50 text-amber-600'
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {req.status === 'Completed' ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              : req.status === 'Cancelled' ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-mono text-charcoal-400">{req.id}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityColors[req.priority]}`}>{req.priority}</span>
                  {req.userName && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-600">{req.userName}</span>}
                  {req.userPlan && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent-50 text-accent-700">{req.userPlan}</span>}
                  {needsAction && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">Action Needed</span>}
                  {req.outcome && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">{req.outcome}</span>}
                  {req.assignedTo && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">Assigned</span>}
                  {req.nextAction && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">{req.nextAction}</span>}
                  <button onClick={(e) => { e.stopPropagation(); handleSummarize(req) }} disabled={isSummarizing}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-50"
                  >
                    {isSummarizing ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
                    {isSummarizing ? '...' : summary ? 'Hide' : 'Summarize'}
                  </button>
                </div>
                <h3 className="font-serif text-base md:text-lg font-semibold text-charcoal-800 text-left">{req.title}</h3>
                {summary && (
                  <div className="mt-2 px-3 py-2 rounded-lg bg-primary-50/50 border border-primary-100 text-left">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg className="w-3 h-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                      <span className="text-[10px] font-semibold text-primary-600">AI Summary</span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">{summary}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[req.status]}`}>{req.status}</span>
                <svg className={`w-4 h-4 text-charcoal-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-charcoal-400 mt-1 text-left">{req.category} &middot; Created {req.createdAt} &middot; {conv.length} messages</p>
          </div>
        </button>

        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-charcoal-100">
            {userInfo && (
              <div className="pt-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-sage-50"><p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-0.5">Customer</p><p className="text-sm font-medium text-charcoal-800">{userInfo.name}</p></div>
                <div className="p-3 rounded-xl bg-sage-50"><p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-0.5">Plan</p><p className="text-sm font-medium text-charcoal-800">{userInfo.subscriptionPlan}</p></div>
                <div className="p-3 rounded-xl bg-sage-50"><p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-0.5">Tasks Used</p><p className="text-sm font-medium text-charcoal-800">{userInfo.taskUsage}/{userInfo.subscriptionPlan === 'Concierge' ? '60' : userInfo.totalTasks || 10}</p></div>
                <div className="p-3 rounded-xl bg-sage-50"><p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-0.5">Remaining</p><p className="text-sm font-medium text-charcoal-800">{userInfo.remaining === Infinity ? 'Unlimited' : userInfo.remaining}</p></div>
              </div>
            )}

            <div className="pt-2 mb-5">
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-charcoal-600 leading-relaxed">{req.description}</p>
            </div>

            {/* Timeline */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Status Progress</p>
              <div className="flex items-center gap-1 mb-2">
                {REQUEST_STATUSES.map((s, i) => {
                  const currentIdx = statusIndex[req.status] || 0
                  const isPast = i < currentIdx || (i === currentIdx)
                  const isActive = i === currentIdx
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                        isPast ? (s === 'Cancelled' ? 'bg-red-500 text-white' : 'bg-primary-500 text-white')
                        : isActive ? 'bg-accent-500 text-primary-800'
                        : 'bg-charcoal-100 text-charcoal-400'
                      }`}>
                        {s === 'Cancelled' && isPast ? '✕' : s === 'Completed' && isPast ? '✓' : i + 1}
                      </div>
                      {i < REQUEST_STATUSES.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${isPast ? 'bg-primary-500' : 'bg-charcoal-100'}`} />}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] text-charcoal-400">
                {REQUEST_STATUSES.map((s) => {
                  const t = (req.timeline || []).find((tl) => tl.status === s)
                  return <span key={s} className="text-center flex-1">{t ? t.date : '—'}</span>
                })}
              </div>
            </div>

            {/* Conversation */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Conversation ({conv.length})</p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 mb-4">
                {conv.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'customer' ? 'bg-primary-500 text-white rounded-br-md' : 'bg-charcoal-50 text-charcoal-700 rounded-bl-md'
                    }`}>
                      <p className="text-[10px] font-medium opacity-70 mb-0.5">{msg.sender === 'customer' ? 'Customer' : 'Admin (You)'}</p>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'customer' ? 'text-primary-200' : 'text-charcoal-400'}`}>{new Date(msg.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposed Solution Display */}
            {req.proposedSolution && (
              <div className="mb-5 p-5 rounded-2xl bg-primary-50 border border-primary-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
                  </svg>
                  <h3 className="text-sm font-semibold text-primary-800">Proposed Solution</h3>
                </div>
                <h4 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">{req.proposedSolution.title}</h4>
                <p className="text-sm text-charcoal-600 mb-4">{req.proposedSolution.description}</p>
                <div className="space-y-2 mb-3">
                  {req.proposedSolution.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-primary-100">
                      <span className="text-sm text-charcoal-700">{opt.name}</span>
                      <span className="text-sm font-semibold text-charcoal-800">${opt.cost}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end px-4 py-2.5 rounded-xl bg-primary-100 border border-primary-200">
                  <span className="text-sm font-semibold text-primary-800 mr-3">Estimated Total</span>
                  <span className="text-lg font-bold text-primary-800">${req.proposedSolution.estimatedCost}</span>
                </div>
              </div>
            )}

            {/* Admin Actions */}
            <div className="flex flex-wrap gap-2 mb-5">
              {activeActions.map((action) => (
                <button key={action} onClick={() => handleAdminAction(action, req.id)}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                >{action}</button>
              ))}
              {req.status !== 'Completed' && req.status !== 'Cancelled' && (
                <>
                  <button onClick={() => setSolutionModal(req.id)}
                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >Propose Solution</button>
                  {needsAction ? (
                    <button onClick={() => clearActionRequired(req.id)}
                      className="text-xs font-semibold px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    >Clear Action Required</button>
                  ) : (
                    <button onClick={() => setActionNoteModal(req.id)}
                      className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >Mark Action Required</button>
                  )}
                </>
              )}
              {(req.status === 'In Progress' || req.status === 'Waiting for Customer') && (
                <button onClick={() => setOutcomeModal(req.id)}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                >Set Outcome</button>
              )}
              {req.status !== 'Cancelled' && req.status !== 'Completed' && (
                <button onClick={() => { const reason = prompt('Reason for cancellation:'); if (reason) rejectRequest(req.id, reason) }}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >Cancel Request</button>
              )}
            </div>

            {/* --- Phase 5A Sections --- */}

            {/* Next Action + Due Date */}
            {renderNextAction(req)}

            {/* Call Log Form */}
            {renderCallLogForm(req)}

            {/* Call Logs */}
            {renderCallLogs(req)}

            {/* WhatsApp Log Form */}
            {renderWhatsappLogForm(req)}

            {/* WhatsApp Logs */}
            {renderWhatsappLogs(req)}

            {/* Activity Timeline */}
            {renderActivityTimeline(req)}

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Internal Notes ({(req.notes || []).length})</p>
              <div className="space-y-2 mb-4">
                {(req.notes || []).length === 0 && <p className="text-xs text-charcoal-400 italic">No notes yet.</p>}
                {(req.notes || []).map((note, j) => (
                  <div key={j} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-charcoal-50">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary-600">{note.author?.split(' ').map((w) => w[0]).join('').slice(0, 2) || 'A'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5"><span className="text-xs font-semibold text-charcoal-700">{note.author}</span><span className="text-[10px] text-charcoal-400">{note.timestamp}</span></div>
                      <p className="text-sm text-charcoal-600">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={messageInputs[`note-${req.id}`] || ''}
                  onChange={(e) => setMessageInputs((prev) => ({ ...prev, [`note-${req.id}`]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { const text = messageInputs[`note-${req.id}`]?.trim(); if (text) { addNoteToRequest(req.id, text, admin?.name || 'Admin'); setMessageInputs((prev) => ({ ...prev, [`note-${req.id}`]: '' })) }}}}
                  placeholder="Add an internal note..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
                <button onClick={() => { const text = messageInputs[`note-${req.id}`]?.trim(); if (!text) return; addNoteToRequest(req.id, text, admin?.name || 'Admin'); setMessageInputs((prev) => ({ ...prev, [`note-${req.id}`]: '' })) }}
                  className="bg-charcoal-200 text-charcoal-600 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-charcoal-300 transition-all"
                >Add Note</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Request Management</h1>
        <p className="text-charcoal-400 text-sm mt-1">
          {queues.all.length} total &middot; {queues.new.length} new &middot; {queues.waiting.length} waiting for customer
        </p>
      </div>

      {/* Work Queues */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'All Requests', count: queues.all.length },
          { key: 'new', label: 'New', count: queues.new.length },
          { key: 'active', label: 'Active', count: queues.active.length },
          { key: 'waiting', label: 'Waiting For Customer', count: queues.waiting.length },
          { key: 'completed', label: 'Completed', count: queues.completed.length },
        ].map((q) => (
          <button key={q.key} onClick={() => { setQueueView(q.key); setStatusFilter('all') }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              queueView === q.key ? 'bg-charcoal-800 text-white' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'
            }`}
          >
            {q.label}
            {q.key !== 'all' && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                queueView === q.key ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-500'
              }`}>{q.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, ID, customer..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-charcoal-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...REQUEST_STATUSES].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s ? 'bg-charcoal-800 text-white' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'
              }`}
            >{s === 'all' ? 'All Statuses' : s}</button>
          ))}
        </div>
      </div>

      {queueFiltered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-charcoal-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">No requests found</h3>
          <p className="text-charcoal-400 text-sm">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="space-y-3">{queueFiltered.map(renderRequestCard)}</div>
      )}

      {actionModal.id && renderModal(requests.find((r) => r.id === actionModal.id))}
      {renderSolutionModal()}
      {renderOutcomeModal()}
      {renderActionNoteModal()}
    </div>
  )
}
