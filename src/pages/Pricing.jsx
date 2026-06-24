import PricingSection from '../components/PricingSection'
import FAQSection from '../components/FAQSection'
import ContactSection from '../components/ContactSection'

const comparisons = [
  { feature: 'Virtual assistant', us: true, fulltime: false },
  { feature: 'No training required', us: true, fulltime: false },
  { feature: 'Scalable plans', us: true, fulltime: false },
  { feature: 'No benefits overhead', us: true, fulltime: false },
  { feature: '24/7 availability', us: true, fulltime: false },
  { feature: 'Dedicated support', us: true, fulltime: true },
]

export default function Pricing() {
  return (
    <>
      <section className="pt-28 pb-8 md:pt-36 md:pb-12 bg-white">
        <div className="max-w-7xl mx-auto section-padding text-center">
          <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
            Pricing
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-charcoal-800 mt-4 mb-6">
            Invest in Your{' '}
            <span className="text-primary-500 italic">Peace of Mind</span>
          </h1>
          <p className="text-charcoal-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            For less than the cost of a coffee a day, gain back hours of your time.
          </p>
        </div>
      </section>

      <PricingSection />

      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
              Comparison
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal-800 mt-4 mb-4">
              NRI PA vs Full-Time Assistant
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-4 px-4">
              <div className="text-left text-xs font-semibold uppercase tracking-wider text-charcoal-400">Feature</div>
              <div className="text-center text-xs font-semibold uppercase tracking-wider text-primary-500">NRI PA</div>
              <div className="text-center text-xs font-semibold uppercase tracking-wider text-charcoal-400">Full-Time</div>
            </div>
            <div className="space-y-2">
              {comparisons.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-4 px-4 py-3 rounded-xl bg-charcoal-50/50"
                >
                  <span className="text-sm text-charcoal-700">{item.feature}</span>
                  <div className="flex justify-center">
                    {item.us ? (
                      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {item.fulltime ? (
                      <svg className="w-5 h-5 text-charcoal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FAQSection />
      <ContactSection />
    </>
  )
}
