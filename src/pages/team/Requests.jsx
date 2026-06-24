import { useState, useMemo } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { getPocketBase } from '../../lib/pocketbase'

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

export default function TeamRequests() {
  const { requests, updateRequestStatus, addNoteToRequest,
    addCallLog, addWhatsappLog, setNextAction } = useAdmin()
  const [expandedId, setExpandedId] = useState(null)
  const [messageInputs, setMessageInputs] = useState({})
  const [callLogForm, setCallLogForm] = useState({})
  const [whatsappLogForm, setWhatsappLogForm] = useState({})
  const [nextActionForm, setNextActionForm] = useState({})

  const pb = getPocketBase()
  const currentUserId = pb.authStore.record?.id

  const assignedRequests = useMemo(() => {
    return requests.filter((r) => r.assignedTo === currentUserId && !['Completed', 'Cancelled'].includes(r.status))
  }, [requests, currentUserId])

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-charcoal-800">My Assigned Requests</h1>
        <p className="text-sm text-charcoal-500 mt-1">{assignedRequests.length} requests assigned to you</p>
      </div>

      {assignedRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-8 text-center">
          <p className="text-charcoal-400 text-sm">No requests assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignedRequests.map((req) => {
            const isExpanded = expandedId === req.id
            return (
              <div key={req.id} className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[req.status] || 'bg-charcoal-50 text-charcoal-600'}`}>
                      {req.status}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal-800 truncate">{req.title}</p>
                      <p className="text-xs text-charcoal-400 truncate">{req.userName || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.nextAction && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{req.nextAction}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[req.priority] || 'bg-charcoal-50 text-charcoal-600'}`}>
                      {req.priority}
                    </span>
                    <svg className={`w-4 h-4 text-charcoal-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-charcoal-100 p-4 space-y-4">
                    <p className="text-sm text-charcoal-600">{req.description}</p>

                    <div className="flex items-center gap-2">
                      {['Researching', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateRequestStatus(req.id, s)}
                          disabled={req.status === s}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            req.status === s
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white text-charcoal-600 border-charcoal-200 hover:bg-charcoal-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    {/* Next Action */}
                    {renderNextAction(req)}

                    {/* Call Logs */}
                    {renderCallLogForm(req)}
                    {renderCallLogs(req)}

                    {/* WhatsApp Logs */}
                    {renderWhatsappLogForm(req)}
                    {renderWhatsappLogs(req)}

                    {/* Activity Timeline */}
                    {renderActivityTimeline(req)}

                    {/* Internal Notes */}
                    <div className="bg-charcoal-50 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Internal Notes</p>
                      {(req.notes || []).length === 0 && <p className="text-xs text-charcoal-400">No notes yet</p>}
                      {(req.notes || []).map((note, i) => (
                        <div key={i} className="text-xs text-charcoal-600">
                          <span className="font-medium">{note.author}:</span> {note.text}
                          <span className="text-charcoal-400 ml-2">{note.timestamp}</span>
                        </div>
                      ))}
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        const text = e.target.note.value
                        if (text.trim()) {
                          addNoteToRequest(req.id, text, 'Team Member')
                          e.target.reset()
                        }
                      }}>
                        <div className="flex gap-2 mt-2">
                          <input name="note" className="flex-1 px-3 py-1.5 rounded-lg border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Add note..." />
                          <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500 text-white hover:bg-primary-600">Add</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
