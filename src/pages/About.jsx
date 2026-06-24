import { Link } from 'react-router-dom'

const values = [
  {
    title: 'Trust',
    desc: 'We handle sensitive information daily. Trust is our most valuable currency, earned through transparency and reliability.',
  },
  {
    title: 'Excellence',
    desc: 'Every task, no matter how small, is executed with meticulous attention to detail and a commitment to quality.',
  },
  {
    title: 'Empathy',
    desc: 'We understand the unique challenges NRIs face. Every solution is designed with your lifestyle in mind.',
  },
  {
    title: 'Efficiency',
    desc: 'Time is your most precious resource. We optimize every process to deliver maximum value in minimum time.',
  },
]

const team = [
  { initials: 'AK', name: 'Anika Kapoor', role: 'CEO & Founder', bg: 'bg-primary-100', text: 'text-primary-700' },
  { initials: 'RJ', name: 'Rohan Joshi', role: 'Head of Operations', bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  { initials: 'SM', name: 'Priya Mehta', role: 'Client Success', bg: 'bg-primary-100', text: 'text-primary-700' },
  { initials: 'PL', name: 'Arun Patel', role: 'Tech Lead', bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
]

export default function About() {
  return (
    <>
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-white">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
                About Us
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-charcoal-800 mt-4 mb-6">
                We Built This Because{' '}
                <span className="text-primary-500 italic">We Needed It Too</span>
              </h1>
              <p className="text-charcoal-400 text-sm md:text-base leading-relaxed mb-6">
                As NRIs ourselves, we know the struggle of managing life across time zones. 
                The missed calls from family because of meetings. The forgotten bill payments. 
                The subscriptions you're paying for but never using.
              </p>
              <p className="text-charcoal-400 text-sm md:text-base leading-relaxed mb-8">
                We built NRI Personal Assistant to solve this — not with AI chatbots or 
                automated systems, but with real humans who understand your world.
              </p>
              <Link to="/contact" className="bg-primary-500 text-white hover:bg-primary-600 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide inline-block">
                Start Your Journey
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-charcoal-50 rounded-2xl p-6 text-center">
                  <p className="font-serif text-4xl font-bold text-primary-500">500+</p>
                  <p className="text-xs text-charcoal-400 mt-1">Tasks Completed</p>
                </div>
                <div className="bg-primary-50 rounded-2xl p-6 text-center">
                  <p className="font-serif text-4xl font-bold text-primary-500">200+</p>
                  <p className="text-xs text-charcoal-400 mt-1">Happy NRIs</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-primary-50 rounded-2xl p-6 text-center">
                  <p className="font-serif text-4xl font-bold text-primary-500">4.9</p>
                  <p className="text-xs text-charcoal-400 mt-1">Avg. Rating</p>
                </div>
                <div className="bg-charcoal-50 rounded-2xl p-6 text-center">
                  <p className="font-serif text-4xl font-bold text-primary-500">15min</p>
                  <p className="text-xs text-charcoal-400 mt-1">Avg. Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-50/50">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
              Our Values
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal-800 mt-4 mb-4">
              What Drives Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <div key={i} className="card-premium rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
                  <span className="font-serif text-xl font-bold text-primary-500">{val.title[0]}</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">{val.title}</h3>
                <p className="text-charcoal-400 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
              Team
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal-800 mt-4 mb-4">
              People Behind the Service
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="card-premium rounded-xl p-6 text-center">
                <div
                  className={`w-20 h-20 rounded-2xl ${member.bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <span className={`font-serif text-xl font-bold ${member.text}`}>{member.initials}</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal-800">{member.name}</h3>
                <p className="text-charcoal-400 text-xs mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
