import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  return null
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const errors = {}
    if (!name.trim()) errors.name = 'Full name is required'
    if (!email.trim()) errors.email = 'Email is required'
    else if (!validateEmail(email)) errors.email = 'Invalid email format'
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
    const result = await register({ name: name.trim(), email: email.trim(), password, passwordConfirm: confirmPassword })
    setLoading(false)

    if (result.success) {
      navigate('/portal/verify')
    } else {
      setError(result.error || 'Registration failed')
    }
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
          <h1 className="font-serif text-2xl font-semibold text-charcoal-800">Create Account</h1>
          <p className="text-charcoal-400 text-sm mt-1">Join NRI Personal Assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-charcoal-100'}`} />
            {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-charcoal-100'}`} />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters, 1 letter & 1 number"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-charcoal-100'}`} />
            {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password"
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

          <button type="submit" disabled={loading}
            className="w-full bg-primary-500 text-white py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-charcoal-400">
            Already have an account?{' '}
            <Link to="/portal/login" className="text-primary-500 hover:text-primary-600 font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}