import ContactSection from '../components/ContactSection'

export default function Contact() {
  return (
    <>
      <section className="pt-28 pb-8 md:pt-36 md:pb-12 bg-white">
        <div className="max-w-7xl mx-auto section-padding text-center">
          <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
            Get in Touch
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-charcoal-800 mt-4 mb-6">
            Ready to Reclaim Your{' '}
            <span className="text-primary-500 italic">Time</span>?
          </h1>
          <p className="text-charcoal-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Book a free 15-minute consultation. No commitment. No spam. Just a conversation about how we can help.
          </p>
        </div>
      </section>

      <ContactSection />
    </>
  )
}
