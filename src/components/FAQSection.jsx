import { useState } from 'react'

const faqs = [
  {
    q: "What is NRI Personal Assistant?",
    a: "We are a premium virtual assistance service designed specifically for NRIs. We handle everyday tasks like email management, calendar scheduling, subscription tracking, and concierge services so you can focus on what matters most.",
  },
  {
    q: "How is this different from hiring a full-time assistant?",
    a: "You get all the benefits of a personal assistant without the overhead of salary, benefits, training, or management. Our team handles everything, and you only pay for what you need.",
  },
  {
    q: "How do I get started?",
    a: "Simply book a free consultation call by filling out our contact form. We'll discuss your needs, set up your account, and have everything running within 24 hours.",
  },
  {
    q: "Can I change my plan later?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use enterprise-grade encryption for all data. We sign NDAs with every client and never share your information with third parties without your explicit consent.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We offer a 14-day satisfaction guarantee. If you're not happy with our service, we'll refund your first month, no questions asked.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto section-padding">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
            FAQ
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal-800 mt-4 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-charcoal-400 text-sm md:text-base leading-relaxed">
            Everything you need to know about our service.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-charcoal-100 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-medium text-sm md:text-base text-charcoal-800 pr-4">
                  {faq.q}
                </span>
                <svg
                  className={`w-4 h-4 text-charcoal-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-6 pb-5 text-sm text-charcoal-500 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
