import { useState } from 'react'

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" className="py-20 md:py-28 bg-charcoal-50/50">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
              Contact
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal-800 mt-4 mb-4">
              Let's Talk About Your Needs
            </h2>
            <p className="text-charcoal-400 text-sm md:text-base leading-relaxed mb-8">
              Book a free consultation call and discover how we can simplify your life.
            </p>

            <div className="space-y-6">
              {[
                { label: 'Email', value: 'hello@nripa.com' },
                { label: 'Phone', value: '+1 (555) 123-4567' },
                { label: 'Response Time', value: 'Within 2 hours' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {i === 0 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      ) : i === 1 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-charcoal-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 md:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-charcoal-800 mb-2">Thank You!</h3>
                <p className="text-charcoal-400 text-sm">
                  We'll be in touch within 24 hours to schedule your consultation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John"
                      className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about what you need help with..."
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-500 text-white hover:bg-primary-600 py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide"
                >
                  Book Free Consultation
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
