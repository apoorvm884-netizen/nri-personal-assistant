import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { confirmPasswordReset } from '../../services/authService'

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  return null
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!token) {
      setError('Missing reset token')
      return
    }

    const errors = {}
    if (!password) errors.password = 'Password is required'
    else {
      const pwErr = validatePassword(password)
      if (pwErr) errors.password = pwErr
    }
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await confirmPasswordReset(token, password, confirmPassword)
      setSuccess(true)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to reset password'
      if (message.includes('expired') || message.includes('invalid')) {
        setError('This reset link has expired or is invalid. Please request a new one.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal-800 mb-3">Password Reset Successful</h1>
          <p className="text-charcoal-500 text-sm mb-8">Your password has been updated. You can now sign in with your new password.</p>
          <Link to="/portal/login"
            className="inline-block w-full bg-primary-500 text-white py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide hover:bg-primary-600 transition-all text-center"
          >
            Sign In
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
          <h1 className="font-serif text-2xl font-semibold text-charcoal-800">Set New Password</h1>
          <p className="text-charcoal-400 text-sm mt-1">Choose a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">New Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters, 1 letter & 1 number"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-charcoal-100'}`} />
            {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your new password"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${fieldErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-charcoal-100'}`} />
            {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || !token}
            className="w-full bg-primary-500 text-white py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}