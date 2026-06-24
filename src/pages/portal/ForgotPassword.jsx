import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!validateEmail(email)) {
      setError('Invalid email format')
      return
    }

    setLoading(true)
    const result = await forgotPassword(email.trim())
    setLoading(false)

    if (result.success) {
      setSent(true)
    } else {
      setError(result.error || 'Failed to send reset email')
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal-800 mb-3">Check Your Email</h1>
          <p className="text-charcoal-500 text-sm mb-2">
            We sent a password reset link to <strong className="text-charcoal-700">{email}</strong>
          </p>
          <p className="text-charcoal-400 text-sm mb-8">
            Click the link in the email to reset your password. It expires in 1 hour.
          </p>
          <Link to="/portal/login"
            className="inline-block w-full bg-primary-500 text-white py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide hover:bg-primary-600 transition-all text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/portal/login" className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-primary-500 transition-colors mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Sign In
          </Link>
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-serif font-bold text-xl">N</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal-800">Reset Password</h1>
          <p className="text-charcoal-400 text-sm mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />
          </div>

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-primary-500 text-white py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  )
}