import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ContactSection from '../components/ContactSection'

const categories = [
  {
    title: 'Personal Assistant',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    desc: 'Dedicated support for your daily personal tasks, organized and handled with care.',
    services: [
      { name: 'Daily task management & prioritization', price: 'Included' },
      { name: 'To-do list creation & follow-up', price: 'Included' },
      { name: 'Appointment setting & confirmation', price: 'Included' },
      { name: 'Document preparation & formatting', price: 'Included' },
      { name: 'Personal errand coordination', price: 'Add-on' },
      { name: 'Online form & application filling', price: 'Included' },
    ],
  },
  {
    title: 'Calendar & Scheduling',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    desc: 'Smart scheduling across time zones so you never miss what matters.',
    services: [
      { name: 'Multi-timezone meeting coordination', price: 'Included' },
      { name: 'Recurring appointment management', price: 'Included' },
      { name: 'Calendar optimization & blocking', price: 'Included' },
      { name: 'Automated reminder setup', price: 'Included' },
      { name: 'Guest invitation & RSVP tracking', price: 'Included' },
      { name: 'Weekly schedule briefings', price: 'Included' },
    ],
  },
  {
    title: 'Email Assistance',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    desc: 'Full inbox management so you stay responsive without the overwhelm.',
    services: [
      { name: 'Inbox zero maintenance & triage', price: 'Included' },
      { name: 'Draft responses for your review', price: 'Included' },
      { name: 'Spam & newsletter filtering', price: 'Included' },
      { name: 'Priority flagging & categorization', price: 'Included' },
      { name: 'Email archive & folder organization', price: 'Included' },
    ],
  },
  {
    title: 'Subscription Management',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M2.25 6h-.75m0 0v9m19.5-9v.75c0 .414.336.75.75.75h.75m-1.5-1.5h-.375c-.621 0-1.125.504-1.125 1.125V9" />
      </svg>
    ),
    desc: 'Audit, track, and optimize every subscription you own.',
    services: [
      { name: 'Full subscription audit & inventory', price: 'Included' },
      { name: 'Renewal date tracking & alerts', price: 'Included' },
      { name: 'Cancellation & downgrade assistance', price: 'Included' },
      { name: 'Cost optimization recommendations', price: 'Included' },
      { name: 'Bill negotiation support', price: 'Add-on' },
    ],
  },
  {
    title: 'Lifestyle Assistance',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    desc: 'Enhance your everyday life with curated services and support.',
    services: [
      { name: 'Restaurant research & reservations', price: 'Included' },
      { name: 'Event ticket booking & recommendations', price: 'Included' },
      { name: 'Fitness class & wellness booking', price: 'Included' },
      { name: 'Gift sourcing & delivery coordination', price: 'Add-on' },
      { name: 'Personal shopping assistance', price: 'Add-on' },
      { name: 'Pet care & vet appointment booking', price: 'Add-on' },
    ],
  },
  {
    title: 'Research Services',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    desc: 'Deep-dive research on any topic — from products to destinations.',
    services: [
      { name: 'Product & brand comparisons', price: 'Included' },
      { name: 'Travel destination research', price: 'Included' },
      { name: 'School & university shortlisting', price: 'Included' },
      { name: 'Real estate market analysis', price: 'Add-on' },
      { name: 'Business & investment research', price: 'Add-on' },
    ],
  },
  {
    title: 'Administrative Support',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    desc: 'Paperwork, data entry, and documentation handled with precision.',
    services: [
      { name: 'Document formatting & proofreading', price: 'Included' },
      { name: 'Data entry & spreadsheet management', price: 'Included' },
      { name: 'Online form & application filling', price: 'Included' },
      { name: 'Digital file organization & backup', price: 'Included' },
      { name: 'Meeting notes & minutes preparation', price: 'Included' },
      { name: 'Presentation deck creation', price: 'Add-on' },
    ],
  },
  {
    title: 'Travel Assistance',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
    desc: 'End-to-end travel planning so your trips are seamless and stress-free.',
    services: [
      { name: 'Flight & hotel booking management', price: 'Included' },
      { name: 'Itinerary planning & optimization', price: 'Included' },
      { name: 'Visa & travel document checklist', price: 'Included' },
      { name: 'Travel insurance comparison', price: 'Add-on' },
      { name: 'Rental car & airport transfer booking', price: 'Included' },
      { name: 'Real-time travel alerts & rebooking', price: 'Included' },
    ],
  },
  {
    title: 'Family Assistance',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    desc: 'Keep your family coordinated and supported, even from across the world.',
    services: [
      { name: 'Family calendar sync & coordination', price: 'Included' },
      { name: 'Elder care appointment scheduling', price: 'Included' },
      { name: 'Children\'s activity & class booking', price: 'Included' },
      { name: 'Medical appointment coordination', price: 'Included' },
      { name: 'Family event planning (parties, gatherings)', price: 'Add-on' },
    ],
  },
  {
    title: 'Property & Relocation Assistance',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
    desc: 'Relocation, rental management, and property tasks across borders.',
    services: [
      { name: 'Property rental & lease review support', price: 'Add-on' },
      { name: 'Utility & internet connection setup', price: 'Included' },
      { name: 'Relocation vendor coordination', price: 'Included' },
      { name: 'Home maintenance scheduling', price: 'Add-on' },
      { name: 'Address change & mail forwarding', price: 'Included' },
    ],
  },
  {
    title: 'Concierge Services',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-3.647 3.647m0 0l-1.627-1.627m1.627 1.627l1.626 1.627M11.42 15.17l6.538-6.538m-6.538 6.538l-3.462-3.462m0 0l3.462-3.462m-3.462 3.462l1.626 1.627M16.5 7.5l-1.626-1.627M16.5 7.5a2.25 2.25 0 00-3-3l-1.626 1.627M16.5 7.5a2.25 2.25 0 113 3l-1.626 1.627" />
      </svg>
    ),
    desc: 'Premium, white-glove service for any special request.',
    services: [
      { name: 'Restaurant & dining concierge', price: 'Included' },
      { name: 'Exclusive event access & booking', price: 'Add-on' },
      { name: 'Gift curation & white-glove delivery', price: 'Add-on' },
      { name: 'Personal shopping & styling support', price: 'Add-on' },
      { name: 'Special occasion planning (anniversaries, birthdays)', price: 'Add-on' },
      { name: 'VIP travel upgrades & lounge access', price: 'Add-on' },
    ],
  },
  {
    title: 'Personal Finance Management',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M2.25 6h-.75m0 0v9m19.5-9v.75c0 .414.336.75.75.75h.75m-1.5-1.5h-.375c-.621 0-1.125.504-1.125 1.125V9" />
      </svg>
    ),
    desc: 'Stay on top of your finances with organized tracking and timely reminders.',
    services: [
      { name: 'Bill payment reminders & scheduling', price: 'Included' },
      { name: 'Expense categorization & reporting', price: 'Included' },
      { name: 'Bank statement reconciliation support', price: 'Add-on' },
      { name: 'Tax document organization', price: 'Included' },
      { name: 'Insurance policy review & renewal alerts', price: 'Included' },
    ],
  },
]

export default function Services() {
  const [openCategory, setOpenCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const q = searchQuery.toLowerCase()
    return categories
      .map((cat) => ({
        ...cat,
        services: cat.services.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            cat.title.toLowerCase().includes(q) ||
            cat.desc.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.services.length > 0)
  }, [searchQuery])

  const totalResults = filtered.reduce((acc, cat) => acc + cat.services.length, 0)

  return (
    <>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.2em]">
              Our Services
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-charcoal-800 mt-4 mb-6">
              Everything You Need,{' '}
              <span className="text-primary-500 italic">Nothing You Don't</span>
            </h1>
            <p className="text-charcoal-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Each service is fully customizable to match your lifestyle, preferences, and schedule.
            </p>
          </div>

          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-12 pr-10 py-4 rounded-2xl border border-charcoal-100 bg-charcoal-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-charcoal-300 hover:text-charcoal-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto section-padding pb-20 md:pb-28">
        {searchQuery && (
          <p className="text-sm text-charcoal-400 mb-6">
            {totalResults} service{totalResults !== 1 ? 's' : ''} found
          </p>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-semibold text-charcoal-800 mb-2">No services found</h3>
            <p className="text-charcoal-400 text-sm">
              Try a different search term or browse all categories.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((category, i) => {
            const isOpen = openCategory === i
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-primary-500 shadow-lg shadow-primary-500/5'
                    : 'border-charcoal-100 hover:border-charcoal-200'
                }`}
              >
                <button
                  onClick={() => setOpenCategory(isOpen ? null : i)}
                  className="w-full flex items-start gap-4 p-5 md:p-6 text-left"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isOpen ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-500'
                    }`}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-serif text-lg md:text-xl font-semibold text-charcoal-800">
                        {category.title}
                      </h3>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="hidden sm:inline text-xs text-charcoal-400 font-medium">
                          {searchQuery
                            ? `${category.services.length} service${category.services.length !== 1 ? 's' : ''}`
                            : `${category.services.length} service${category.services.length !== 1 ? 's' : ''}`}
                        </span>
                        <svg
                          className={`w-4 h-4 text-charcoal-400 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-charcoal-400 mt-1 leading-relaxed">{category.desc}</p>
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <div className="border-t border-charcoal-100 pt-4">
                      <div className="grid gap-2">
                        {category.services.map((service, j) => (
                          <div
                            key={j}
                            className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-charcoal-50/50 hover:bg-charcoal-50 transition-colors group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <svg
                                className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span className="text-sm text-charcoal-700 group-hover:text-charcoal-800 transition-colors">
                                {service.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-medium flex-shrink-0 px-2.5 py-1 rounded-full ${
                                service.price === 'Included'
                                  ? 'bg-primary-50 text-primary-600'
                                  : 'bg-charcoal-100 text-charcoal-500'
                              }`}
                            >
                              {service.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-charcoal-800 py-16 md:py-20">
        <div className="max-w-7xl mx-auto section-padding text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4">
            Not Sure What You Need?
          </h2>
          <p className="text-charcoal-300 text-sm md:text-base max-w-xl mx-auto mb-8">
            Book a free consultation and we'll help you build a personalized plan.
          </p>
          <Link
            to="/contact"
            className="bg-accent-500 text-primary-800 hover:bg-accent-400 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide inline-block"
          >
            Book Free Consultation
          </Link>
        </div>
      </div>

      <ContactSection />
    </>
  )
}
