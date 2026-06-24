import { useMemo, useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { REQUEST_STATUSES } from '../../config/appConfig'

const priorityColors = {
  High: 'bg-red-50 text-red-600 border-red-100',
  Medium: 'bg-amber-50 text-amber-600 border-amber-100',
  Low: 'bg-blue-50 text-blue-600 border-blue-100',
}

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

const statusIndex = Object.fromEntries(REQUEST_STATUSES.map((s, i) => [s, i]))

export default function ActiveRequests() {
  const { requests, sendMessage, approveSolution, rejectSolution, provideAdditionalInfo, respondToActionRequired } = useAuth()
  const [expandedId, setExpandedId] = useState(null)
  const [replyText, setReplyText] = useState({})
  const [infoText, setInfoText] = useState({})
  const [showInfoInput, setShowInfoInput] = useState({})
  const [actionResponseText, setActionResponseText] = useState({})
  const [showActionInput, setShowActionInput] = useState({})
  const chatEndRef = useRef(null)

  const active = useMemo(() =>
    requests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled'),
    [requests],
  )

  const completedRejected = useMemo(() =>
    requests.filter((r) => r.status === 'Completed' || r.status === 'Cancelled'),
    [requests],
  )

  const actionRequiredCount = active.filter((r) => r.actionRequired).length

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [expandedId])

  const handleSendReply = (id) => {
    const text = replyText[id]?.trim()
    if (!text) return
    sendMessage(id, text)
    setReplyText((prev) => ({ ...prev, [id]: '' }))
  }

  const handleRespondAction = (id) => {
    const text = actionResponseText[id]?.trim() || 'I have reviewed and responded.'
    respondToActionRequired(id, text)
    setActionResponseText((prev) => ({ ...prev, [id]: '' }))
    setShowActionInput((prev) => ({ ...prev, [id]: false }))
  }

  const renderRequest = (req) => {
    const isExpanded = expandedId === req.id
    const conv = req.conversation || []
    const needsInfo = req.status === 'Waiting for Customer'
    const awaitingApproval = req.status === 'Approved'
    const needsAction = req.actionRequired && req.status !== 'Completed' && req.status !== 'Cancelled'
    const canReply = !needsInfo && req.status !== 'Completed' && req.status !== 'Cancelled'
    const hasSolution = req.proposedSolution

    return (
      <div key={req.id} className={`bg-white rounded-2xl border overflow-hidden ${
        needsAction ? 'border-red-300 ring-1 ring-red-200' : 'border-charcoal-100'
      }`}>
        <button onClick={() => setExpandedId(isExpanded ? null : req.id)}
          className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left hover:bg-charcoal-50/50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-charcoal-400">{req.id}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityColors[req.priority]}`}>{req.priority}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[req.status] || 'bg-charcoal-50 text-charcoal-500'}`}>{req.status}</span>
              {needsAction && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">Action Required</span>
              )}
              {req.outcome && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">{req.outcome}</span>
              )}
            </div>
            <h3 className="font-serif text-lg font-semibold text-charcoal-800">{req.title}</h3>
            <p className="text-xs text-charcoal-400 mt-1">{req.category} &middot; Updated {req.updatedAt}</p>
          </div>
          <svg className={`w-5 h-5 text-charcoal-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {isExpanded && (
          <div className="border-t border-charcoal-100">
            <div className="p-5 md:p-6">
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-charcoal-600 leading-relaxed mb-4">{req.description}</p>

              {/* Timeline */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Timeline</p>
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
                        {i < REQUEST_STATUSES.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${isPast ? 'bg-primary-500' : 'bg-charcoal-100'}`} />
                        )}
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

              {/* Proposed Solution Panel */}
              {hasSolution && (
                <div className="mb-5 p-5 rounded-2xl bg-primary-50 border border-primary-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
                    </svg>
                    <h3 className="text-sm font-semibold text-primary-800">Proposed Solution</h3>
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">{req.proposedSolution.title}</h4>
                  <p className="text-sm text-charcoal-600 mb-4">{req.proposedSolution.description}</p>
                  <div className="space-y-2 mb-4">
                    {req.proposedSolution.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-primary-100">
                        <span className="text-sm text-charcoal-700">{opt.name}</span>
                        <span className="text-sm font-semibold text-charcoal-800">${opt.cost}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-100 border border-primary-200">
                    <span className="text-sm font-semibold text-primary-800">Estimated Total</span>
                    <span className="text-lg font-bold text-primary-800">${req.proposedSolution.estimatedCost}</span>
                  </div>
                </div>
              )}

              {/* Outcome Display */}
              {req.outcome && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-green-700">Outcome: {req.outcome}</p>
                    <p className="text-xs text-green-600">This request has been resolved.</p>
                  </div>
                </div>
              )}

              {/* Action Required Banner */}
              {needsAction && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700">Action Required From You</p>
                      {req.actionRequiredNote && (
                        <p className="text-xs text-red-600 mt-0.5">{req.actionRequiredNote}</p>
                      )}
                      {showActionInput[req.id] ? (
                        <div className="mt-3 space-y-2">
                          <textarea value={actionResponseText[req.id] || req.actionRequiredNote} onChange={(e) => setActionResponseText((prev) => ({ ...prev, [req.id]: e.target.value }))}
                            placeholder="Your response..."
                            className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" rows={3}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleRespondAction(req.id)}
                              className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                            >Submit Response</button>
                            <button onClick={() => setShowActionInput((prev) => ({ ...prev, [req.id]: false }))}
                              className="text-xs font-semibold px-4 py-2 rounded-lg bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowActionInput((prev) => ({ ...prev, [req.id]: true }))}
                          className="mt-2 text-xs font-semibold px-4 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                        >Respond Now</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Conversation */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Conversation ({conv.length})</p>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {conv.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'customer' ? 'bg-primary-500 text-white rounded-br-md' : 'bg-charcoal-50 text-charcoal-700 rounded-bl-md'
                      }`}>
                        <p className="text-[10px] font-medium opacity-70 mb-0.5">
                          {msg.sender === 'customer' ? 'You' : 'Admin'}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === 'customer' ? 'text-primary-200' : 'text-charcoal-400'}`}>
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Customer Actions */}
              <div className="space-y-3">
                {needsInfo && (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                    <p className="text-xs font-semibold text-orange-700 mb-2">Additional Information Needed</p>
                    {showInfoInput[req.id] ? (
                      <div className="space-y-2">
                        <textarea value={infoText[req.id] || ''} onChange={(e) => setInfoText((prev) => ({ ...prev, [req.id]: e.target.value }))}
                          placeholder="Provide the requested information..."
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" rows={3}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => {
                            const text = infoText[req.id]?.trim()
                            if (!text) { setShowInfoInput((prev) => ({ ...prev, [req.id]: false })); return }
                            provideAdditionalInfo(req.id, text)
                            setInfoText((prev) => ({ ...prev, [req.id]: '' }))
                            setShowInfoInput((prev) => ({ ...prev, [req.id]: false }))
                          }}
                            className="text-xs font-semibold px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
                          >Submit Information</button>
                          <button onClick={() => setShowInfoInput((prev) => ({ ...prev, [req.id]: false }))}
                            className="text-xs font-semibold px-4 py-2 rounded-lg bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                          >Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowInfoInput((prev) => ({ ...prev, [req.id]: true }))}
                        className="text-xs font-semibold px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
                      >Provide Additional Information</button>
                    )}
                  </div>
                )}

                {awaitingApproval && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <p className="text-xs font-semibold text-purple-700 mb-2">Your approval is needed</p>
                    <div className="flex gap-2">
                      <button onClick={() => approveSolution(req.id)}
                        className="text-xs font-semibold px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
                      >Approve Solution ✓</button>
                      <button onClick={() => rejectSolution(req.id, '')}
                        className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                      >Request Changes</button>
                    </div>
                  </div>
                )}

                {!needsInfo && !awaitingApproval && canReply && (
                  <div className="flex gap-2">
                    <input value={replyText[req.id] || ''} onChange={(e) => setReplyText((prev) => ({ ...prev, [req.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(req.id) } }}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    />
                    <button onClick={() => handleSendReply(req.id)} disabled={!replyText[req.id]?.trim()}
                      className="bg-primary-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >Send</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">My Requests</h1>
        <p className="text-charcoal-400 text-sm mt-1">
          {active.length} active
          {actionRequiredCount > 0 && (
            <span className="ml-2 text-red-500 font-semibold">&middot; {actionRequiredCount} need your action</span>
          )}
        </p>
      </div>

      {active.length === 0 && completedRejected.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">All caught up!</h3>
          <p className="text-charcoal-400 text-sm">No requests yet. Submit a new request to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map(renderRequest)}
          {completedRejected.length > 0 && (
            <div className="pt-4">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800 mb-3">Completed &amp; Rejected</h2>
              {completedRejected.map(renderRequest)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
