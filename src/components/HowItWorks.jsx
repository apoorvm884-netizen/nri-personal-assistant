const steps = [
  {
    step: '01',
    title: 'Book a Consultation',
    desc: 'Schedule a free call to discuss your needs, preferences, and how we can best support you.',
  },
  {
    step: '02',
    title: 'We Set Everything Up',
    desc: 'Our team configures your dashboard, connects your accounts, and tailors the experience to you.',
  },
  {
    step: '03',
    title: 'Sit Back & Relax',
    desc: 'We handle the daily tasks while you focus on what truly matters. We report back to you regularly.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
            How It Works
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal-800 mt-4 mb-4">
            Three Simple Steps
          </h2>
          <p className="text-charcoal-400 text-sm md:text-base leading-relaxed">
            Getting started takes minutes. We handle the rest.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {steps.map((item, i) => (
            <div key={i} className="relative text-center md:text-left">
              <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-primary-300 to-transparent" />
              <div className="w-24 h-24 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto md:mx-0 mb-6">
                <span className="font-serif text-3xl font-bold text-primary-500">{item.step}</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-charcoal-800 mb-3">
                {item.title}
              </h3>
              <p className="text-charcoal-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
