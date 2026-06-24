import { useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'

const priorityColors = {
  High: 'bg-red-50 text-red-600 border-red-100',
  Medium: 'bg-amber-50 text-amber-600 border-amber-100',
  Low: 'bg-blue-50 text-blue-600 border-blue-100',
}

export default function CompletedRequests() {
  const { requests } = useAuth()

  const completed = useMemo(
    () => requests.filter((r) => r.status === 'Completed' || r.status === 'Cancelled'),
    [requests]
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">
          Completed Requests
        </h1>
        <p className="text-charcoal-400 text-sm mt-1">
          {completed.length} request{completed.length !== 1 ? 's' : ''} completed
        </p>
      </div>

      {completed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-charcoal-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">
            No completed requests yet
          </h3>
          <p className="text-charcoal-400 text-sm">
            Completed requests will appear here once your team marks them done.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-charcoal-100 p-5 md:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-charcoal-400">{req.id}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                        priorityColors[req.priority]
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal-800">
                    {req.title}
                  </h3>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 flex-shrink-0">
                  Completed
                </span>
              </div>

              <p className="text-sm text-charcoal-500 leading-relaxed mb-4">
                {req.description}
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs text-charcoal-400 bg-charcoal-50 px-2.5 py-1 rounded-full">
                  {req.category}
                </span>
                <span className="text-xs text-charcoal-400">
                  Completed: {req.updatedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
