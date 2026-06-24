import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addConsultation } from '../../data/consultationStore'

const countries = [
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain',
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Singapore', 'Malaysia',
  'Other',
]

export default function PortalConsultation() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    message: '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addConsultation(form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-charcoal-100 p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-charcoal-800 mb-2">Consultation Booked!</h2>
          <p className="text-charcoal-400 text-sm mb-8 max-w-md mx-auto">
            Thank you for booking a consultation call. Our team will reach out to you within 24 hours to schedule the call at a convenient time.
          </p>
          <button onClick={() => navigate('/')}
            className="bg-primary-500 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all"
          >Return to Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Book a Consultation Call</h1>
        <p className="text-charcoal-400 text-sm mt-1">
          Tell us about yourself and what you need help with. We will get back to you within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-charcoal-100 p-6 md:p-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input type="text" name="fullName" required value={form.fullName} onChange={handleChange}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange}
              placeholder="e.g. rajesh@example.com"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
            <input type="tel" name="phone" required value={form.phone} onChange={handleChange}
              placeholder="e.g. +971 50 123 4567"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Country</label>
            <select name="country" required value={form.country} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all appearance-none bg-white"
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">Requirement / Message</label>
          <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
            placeholder="Tell us what you need help with — task management, subscription tracking, travel planning, or anything else..."
            className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <button type="button" onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl text-sm font-medium text-charcoal-500 hover:bg-charcoal-50 transition-colors"
          >Cancel</button>
          <button type="submit"
            className="bg-primary-500 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all"
          >Book Consultation Call</button>
        </div>
      </form>
    </div>
  )
}
