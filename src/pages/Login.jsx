import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPocketBase } from '../lib/pocketbase'
import { ROLE_PORTALS, ROLE_LABELS } from '../config/roles'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    try {
      const pb = getPocketBase()
      const authData = await pb.collection('users').authWithPassword(email, password)
      const role = authData.record?.role
      const portal = ROLE_PORTALS[role]
      if (portal) {
        window.location.href = portal
      } else {
        setError('Your account does not have a valid role assigned.')
      }
    } catch {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-primary-300 transition-colors mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Return to Home
          </Link>
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-serif font-bold text-xl">N</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white">
            NRI Personal Assistant
          </h1>
          <p className="text-charcoal-400 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-charcoal-400 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-charcoal-700 border border-charcoal-600 text-white text-sm placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-charcoal-700 border border-charcoal-600 text-white text-sm placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <svg className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-500 text-primary-800 hover:bg-accent-400 py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <Link to="/register" className="block text-sm text-charcoal-400 hover:text-primary-300 transition-colors">
            Don't have an account? Register
          </Link>
          <Link to="/forgot-password" className="block text-sm text-charcoal-400 hover:text-primary-300 transition-colors">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  )
}
