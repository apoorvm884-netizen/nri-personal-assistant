import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPocketBase } from '../../lib/pocketbase'

export default function VerifyEmail() {
  const { user, verified, resendVerification, logout } = useAuth()
  const navigate = useNavigate()
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!user) navigate('/portal/login', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    if (verified) navigate('/portal/dashboard', { replace: true })
  }, [verified, navigate])

  const handleCheckStatus = async () => {
    setChecking(true)
    setError('')
    try {
      const pb = getPocketBase()
      await pb.collection('users').authRefresh()
    } catch {
      setError('Could not refresh status. Try signing in again.')
    } finally {
      setChecking(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    setSent(false)
    const result = await resendVerification()
    setResending(false)
    if (result.success) {
      setSent(true)
    } else {
      setError(result.error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user || verified) return null

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl font-semibold text-charcoal-800 mb-3">Verify Your Email</h1>
        <p className="text-charcoal-500 text-sm mb-2">
          We sent a verification email to <strong className="text-charcoal-700">{user.email}</strong>
        </p>
        <p className="text-charcoal-400 text-sm mb-8">
          Click the link in the email to activate your account. Can't find it? Check your spam folder.
        </p>

        {sent && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl mb-6">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-600">Verification email resent successfully!</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mb-6">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={handleResend} disabled={resending}
            className="w-full bg-primary-500 text-white py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {resending && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <button onClick={handleCheckStatus} disabled={checking}
            className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide border border-primary-200 text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checking && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {checking ? 'Checking...' : 'I\'ve Verified — Check Status'}
          </button>

          <button onClick={handleLogout}
            className="w-full py-3 px-6 rounded-xl text-sm font-medium text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-50 transition-all"
          >
            Sign Out
          </button>
        </div>

        <p className="mt-8 text-xs text-charcoal-400">
          After clicking the verification link,{' '}
          <Link to="/portal/login" className="text-primary-500 hover:text-primary-600 font-medium">sign in</Link> to access your account.
        </p>
      </div>
    </div>
  )
}