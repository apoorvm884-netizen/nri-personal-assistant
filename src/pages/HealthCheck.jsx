import { useState, useEffect } from 'react'
import { runHealthCheck } from '../lib/healthCheck'

export default function HealthCheck() {
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  const run = async () => {
    setRunning(true)
    const res = await runHealthCheck()
    setResult(res)
    setRunning(false)
  }

  useEffect(() => { run() }, [])

  return (
    <div className="min-h-screen bg-charcoal-50/50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6 md:p-8">
          <h1 className="font-serif text-xl font-semibold text-charcoal-800 mb-1">System Health Check</h1>
          <p className="text-sm text-charcoal-400 mb-6">Production status verification</p>

          {!result && !running && (
            <button onClick={run} className="bg-primary-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600">
              Run Health Check
            </button>
          )}

          {running && (
            <div className="flex items-center gap-3 text-sm text-charcoal-500">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Running checks...
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${result.status === 'PASS' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                Overall Status: {result.status}
              </div>

              {Object.values(result.checks).map((check) => (
                <div key={check.name} className={`px-4 py-3 rounded-xl border text-sm ${check.status === 'PASS' ? 'bg-white border-green-100' : 'bg-white border-red-100'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-charcoal-700">{check.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${check.status === 'PASS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {check.status}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 break-all">{check.detail}</p>
                </div>
              ))}

              <p className="text-[10px] text-charcoal-400 text-right">
                Checked at: {new Date(result.timestamp).toLocaleString()}
              </p>

              <button onClick={run} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                Re-run checks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}