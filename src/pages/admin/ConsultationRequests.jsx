import { useState, useMemo, useEffect } from 'react'
import { loadConsultations, updateConsultationStatus } from '../../data/consultationStore'

const statusColors = {
  New: 'bg-amber-50 text-amber-600 border-amber-100',
  Contacted: 'bg-blue-50 text-blue-600 border-blue-100',
  Converted: 'bg-green-50 text-green-600 border-green-100',
  Closed: 'bg-charcoal-50 text-charcoal-500 border-charcoal-100',
}

export default function ConsultationRequests() {
  const [consultations, setConsultations] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadConsultations().then(setConsultations)
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return consultations
    return consultations.filter((c) => c.status === filter)
  }, [consultations, filter])

  const handleStatus = async (id, status) => {
    await updateConsultationStatus(id, status)
    const updated = await loadConsultations()
    setConsultations(updated)
  }

  const counts = useMemo(() => {
    const c = { all: consultations.length, New: 0, Contacted: 0, Converted: 0, Closed: 0 }
    consultations.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1 })
    return c
  }, [consultations])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Consultation Requests</h1>
        <p className="text-charcoal-400 text-sm mt-1">
          {counts.New} new consultations waiting for review
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'New', label: 'New', count: counts.New },
          { key: 'Contacted', label: 'Contacted', count: counts.Contacted },
          { key: 'Converted', label: 'Converted', count: counts.Converted },
          { key: 'Closed', label: 'Closed', count: counts.Closed },
        ].map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === t.key ? 'bg-charcoal-800 text-white' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'
            }`}
          >
            {t.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              filter === t.key ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-500'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-charcoal-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">No consultations found</h3>
          <p className="text-charcoal-400 text-sm">No requests matching the current filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-charcoal-100 p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-charcoal-400">{c.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[c.status]}`}>{c.status}</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">{c.fullName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal-500 mb-3">
                    <span>{c.email}</span>
                    <span>{c.phone}</span>
                    <span>{c.country}</span>
                    <span className="text-charcoal-400">Created {c.createdAt}</span>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-sage-50 border border-sage-100">
                    <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">Requirement</p>
                    <p className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-wrap">{c.message}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-charcoal-100">
                {c.status === 'New' && (
                  <button onClick={() => handleStatus(c.id, 'Contacted')}
                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >Mark Contacted</button>
                )}
                {c.status === 'Contacted' && (
                  <button onClick={() => handleStatus(c.id, 'Converted')}
                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                  >Mark Converted</button>
                )}
                {(c.status === 'New' || c.status === 'Contacted' || c.status === 'Converted') && (
                  <button onClick={() => handleStatus(c.id, 'Closed')}
                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 transition-colors"
                  >Mark Closed</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
