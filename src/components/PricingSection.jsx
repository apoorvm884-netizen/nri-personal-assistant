import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Personal',
    price: '10',
    desc: 'Perfect for getting started with basic task management.',
    features: [
      'Up to 10 tasks/month',
      '$2 per additional task',
      'Email management',
      'Calendar scheduling',
      'Basic reminders',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: '20',
    desc: 'Our most popular plan for comprehensive daily support.',
    features: [
      'Up to 25 tasks/month',
      '$1.50 per additional task',
      'Full email management',
      'Calendar & scheduling',
      'Subscription tracking',
      'Concierge requests',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Concierge',
    price: '49',
    desc: 'For busy professionals who need dedicated full-time support.',
    features: [
      '60 tasks/month included',
      'Priority support',
      'Everything in Professional',
      'Dedicated assistant',
      'Travel & booking concierge',
      'Bill payment assistance',
      '24/7 priority support',
      'Monthly strategy call',
    ],
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-sage-50">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">Pricing</span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal-800 mt-4 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-charcoal-400 text-sm md:text-base leading-relaxed">No hidden fees. No surprises. Choose what fits your lifestyle.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-charcoal-800 text-white ring-2 ring-primary-500 scale-105 md:scale-110'
                  : 'bg-white border border-charcoal-100 text-charcoal-800'
              }`}
            >
              {plan.popular && (
                <div className="inline-block px-3 py-1 bg-accent-500 text-primary-800 text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                  Most Popular
                </div>
              )}
              {!plan.popular && <div className="h-7" />}
              <h3 className="font-serif text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-serif text-4xl font-bold">${plan.price}</span>
                <span className={`text-sm ${plan.popular ? 'text-charcoal-300' : 'text-charcoal-400'}`}>/month</span>
              </div>
              <p className={`text-sm mb-6 ${plan.popular ? 'text-charcoal-300' : 'text-charcoal-400'}`}>{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className={plan.popular ? 'text-charcoal-200' : 'text-charcoal-500'}>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  plan.popular
                    ? 'bg-accent-500 text-primary-800 hover:bg-accent-400'
                    : 'border border-charcoal-800 text-charcoal-800 hover:bg-charcoal-800 hover:text-white'
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
