import { useState } from 'react'
import { Link } from 'react-router-dom'

const painPoints = [
  {
    icon: <svg className="w-full h-full" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EDF5F2"/><path d="M16 20h16M16 26h12M16 32h8" stroke="#2E5B4E" strokeWidth="2" strokeLinecap="round"/><rect x="12" y="14" width="24" height="22" rx="3" stroke="#2E5B4E" strokeWidth="1.5"/></svg>,
    title: 'Bills & Paperwork Piling Up',
    desc: 'Credit card due dates, insurance renewals, tax filings — it never ends.',
  },
  {
    icon: <svg className="w-full h-full" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EDF5F2"/><circle cx="24" cy="20" r="6" stroke="#2E5B4E" strokeWidth="1.5"/><path d="M16 34c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#2E5B4E" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: 'No Time for Appointments',
    desc: 'Doctor visits, school meetings, embassy runs — squeezed between work and family.',
  },
  {
    icon: <svg className="w-full h-full" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EDF5F2"/><circle cx="24" cy="24" r="10" stroke="#2E5B4E" strokeWidth="1.5"/><path d="M24 18v6l4 4" stroke="#2E5B4E" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: 'Subscriptions You Forgot About',
    desc: 'Netflix, Spotify, cloud storage — paying for things you barely use.',
  },
  {
    icon: <svg className="w-full h-full" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EDF5F2"/><path d="M18 20l-4 4 4 4M30 20l4 4-4 4" stroke="#2E5B4E" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: 'Mental Load Never Turns Off',
    desc: 'Even at dinner, your mind is running through everything you need to do.',
  },
]

const services = [
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>,
    title: 'Travel & Flights',
    desc: 'Bookings, visa paperwork, itineraries — we handle the entire journey.',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m0 0H3.75m0 0h5.25m0 0a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v-.75a.75.75 0 01.75-.75h.75z"/></svg>,
    title: 'Finance & Bills',
    desc: 'Bill payments, credit cards, insurance renewals, tax organization.',
    color: 'text-accent-600 bg-accent-50',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"/></svg>,
    title: 'Appointments & Calendar',
    desc: 'Doctor visits, embassy runs, school meetings — scheduled and confirmed.',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>,
    title: 'Subscription Management',
    desc: 'Track renewals, cancel unused services, negotiate better rates.',
    color: 'text-accent-600 bg-accent-50',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>,
    title: 'Family & Lifestyle',
    desc: 'Gift deliveries, event planning, research — we take care of the details.',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
    title: 'Paperwork & Admin',
    desc: 'Forms, applications, renewals — the bureaucracy you should never have to deal with.',
    color: 'text-accent-600 bg-accent-50',
  },
]

const steps = [
  {
    num: '01',
    title: 'Tell Us What You Need',
    desc: 'Book a free call or submit a request. Tell us about your to-do list, your stress points, and what you want to free up time for.',
  },
  {
    num: '02',
    title: 'We Take It From There',
    desc: 'Our team gets to work — making calls, filling forms, scheduling appointments, tracking down the best options.',
  },
  {
    num: '03',
    title: 'We Keep You Updated',
    desc: 'You get clear updates, proposed solutions, and a simple yes/no when we need your input. No jargon. No surprises.',
  },
  {
    num: '04',
    title: 'You Focus on Life',
    desc: 'While we handle the details, you get back to what actually matters — family, work, rest, and the things you enjoy.',
  },
]

const plans = [
  {
    name: 'Personal',
    price: '$10',
    period: '/month',
    desc: 'For handling the essential life admin that keeps piling up.',
    tasks: '10 tasks/mo',
    extra: '$2/extra task',
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Professional',
    price: '$20',
    period: '/month',
    desc: 'For busy professionals juggling work, family, and life abroad.',
    tasks: '25 tasks/mo',
    extra: '$1.50/extra task',
    cta: 'Get Started',
    featured: true,
  },
  {
    name: 'Concierge',
    price: '$49',
    period: '/month',
    desc: 'For those who want a dedicated partner handling everything.',
    tasks: '60 tasks/mo',
    extra: 'Priority support',
    cta: 'Get Started',
    featured: false,
  },
]

const nriChallenges = [
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
    title: 'Across Time Zones',
    desc: 'Handle tasks in India while you work in the US, Europe, or Middle East.',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
    title: 'Multi-Currency Finance',
    desc: 'Manage bills, taxes, and investments in INR, USD, AED, GBP, and more.',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
    title: 'Remote Family Support',
    desc: 'Send gifts, schedule appointments, and take care of aging parents from abroad.',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
    title: 'Cross-Border Paperwork',
    desc: 'Visa renewals, embassy forms, POA documents, and government filings — all handled.',
  },
]

const realExamples = [
  { emoji: '✈️', task: 'Booked a family of 4 from Dubai to Mumbai for Diwali — found business class seats under $3,000.' },
  { emoji: '🏥', task: 'Scheduled annual checkups at Apollo Clinic and pediatrician appointments for the kids — all on a weekend.' },
  { emoji: '💳', task: 'Resolved a declined $2,450 credit card payment with HDFC Bank before the due date.' },
  { emoji: '📄', task: 'Organized 3 years of tax documents into a folder structure with a complete filing checklist.' },
  { emoji: '🎁', task: 'Curated and delivered a birthday gift package to a mother in Pune — saree, sweets, flowers, card.' },
  { emoji: '🏫', task: 'Researched 5 international IB schools in Singapore with fee breakdowns and admission deadlines.' },
  { emoji: '📺', task: 'Optimized Netflix Premium and Spotify Family subscriptions — saved $8/month with annual plans.' },
  { emoji: '📋', task: 'Completed NPS account application with PAN/Aadhaar verification through the official portal.' },
  { emoji: '🛂', task: 'Prepared and submitted visa renewal paperwork for a family of 3 to the embassy.' },
  { emoji: '🏠', task: 'Coordinated property tax payment and home insurance renewal across two countries.' },
]

const interactiveTasks = [
  { emoji: '💳', label: 'Credit card bills stacking up' },
  { emoji: '✈️', label: 'Need to book flights for family' },
  { emoji: '🏥', label: 'Doctor appointments to schedule' },
  { emoji: '📺', label: 'Subscriptions I never use' },
  { emoji: '📋', label: 'Tax paperwork is overwhelming' },
  { emoji: '🎁', label: 'Send gifts to family back home' },
  { emoji: '🛂', label: 'Visa or passport renewal' },
  { emoji: '🏠', label: 'Property or rent paperwork' },
]

const trustPoints = [
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    title: 'Real Human Support',
    desc: 'No chatbots. No automated replies. Every request is handled by a trained human assistant who understands your context.',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
    title: 'Full Request Tracking',
    desc: 'Every task has a status: submitted, accepted, in progress, completed. You always know where things stand — no guessing.',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Timeline Visibility',
    desc: 'See every milestone — when we started, what we did, what\'s next. Full transparency into progress at all times.',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    title: 'Secure Handling',
    desc: 'All documents are encrypted. Conversations stay private. We handle sensitive data with bank-grade security protocols.',
  },
  {
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
    title: 'Transparent Communication',
    desc: 'No hidden fees, no surprise charges. We tell you exactly what we\'re doing, what it costs, and when it\'ll be done.',
  },
]

function DashboardPreview() {
  return (
    <div className="p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">VS</div>
          <div><div className="text-xs font-semibold text-charcoal-800">Vikram Singh</div><div className="text-[9px] text-charcoal-400">Concierge Plan</div></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-charcoal-50 flex items-center justify-center relative">
            <svg className="w-3.5 h-3.5 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { n: '3', l: 'Active', c: 'bg-blue-50 text-blue-600' },
          { n: '2', l: 'Pending', c: 'bg-amber-50 text-amber-600' },
          { n: '7', l: 'Reminders', c: 'bg-purple-50 text-purple-600' },
          { n: '12', l: 'Done', c: 'bg-green-50 text-green-600' },
        ].map((s, i) => (
          <div key={i} className="p-2 rounded-lg text-center">
            <div className="text-lg font-bold text-charcoal-800">{s.n}</div>
            <div className="text-[8px] font-medium text-charcoal-400">{s.l}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-semibold text-charcoal-400 uppercase tracking-wider">Active Requests</span>
          <span className="text-[8px] text-primary-500 font-semibold">View all</span>
        </div>
        <div className="space-y-1.5">
          {[
            { t: 'Flight Booking - Diwali Trip', s: 'In Progress', c: 'bg-blue-100 text-blue-700' },
            { t: 'Doctor Appointments', s: 'Need Info', c: 'bg-amber-100 text-amber-700' },
            { t: 'Gift Delivery - Mother\'s Bday', s: 'Approval', c: 'bg-purple-100 text-purple-700' },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-charcoal-50/70">
              <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-amber-500' : 'bg-purple-500'}`} />
              <div className="flex-1 min-w-0"><div className="text-[10px] font-medium text-charcoal-700 truncate">{r.t}</div></div>
              <div className={`text-[7px] font-semibold px-1.5 py-0.5 rounded ${r.c}`}>{r.s}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-charcoal-50/70">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3 h-3 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
            <span className="text-[8px] font-semibold text-charcoal-500">Upcoming Renewals</span>
          </div>
          <div className="text-[9px] text-charcoal-600">Netflix - Jun 15<span className="text-charcoal-300"> · </span>Spotify - Jun 20</div>
        </div>
        <div className="p-2 rounded-lg bg-charcoal-50/70">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3 h-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            <span className="text-[8px] font-semibold text-charcoal-500">Family Events</span>
          </div>
          <div className="text-[9px] text-charcoal-600">Mom's Birthday - Jun 25<span className="text-charcoal-300"> · </span>Anaya's Recital - Jul 2</div>
        </div>
      </div>
    </div>
  )
}

function RequestsPreview() {
  return (
    <div className="p-4 md:p-5 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-charcoal-100">
        {[{ l: 'All', a: true }, { l: 'New', a: false }, { l: 'Active', a: false }, { l: 'Waiting', a: false }].map((t, i) => (
          <div key={i} className={`text-[9px] font-semibold px-2.5 py-1 rounded-lg ${t.a ? 'bg-charcoal-800 text-white' : 'text-charcoal-500 hover:bg-charcoal-50'}`}>{t.l}</div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { t: 'Flight Booking - Diwali Trip', s: 'In Progress', p: 'High', si: 1, pi: 0 },
{ t: 'Doctor Appointment Scheduling', s: 'Waiting for Customer', p: 'High', si: 2, pi: 0 },
          { t: 'Netflix & Spotify Renewal Review', s: 'Assigned', p: 'Medium', si: 3, pi: 1 },
          // { t: 'Gift Delivery - Mother\'s Birthday', s: 'Proposal Sent', p: 'Medium', si: 4, pi: 1 },
          { t: 'Gift Delivery - Mother\'s Birthday', s: 'Approved', p: 'Medium', si: 4, pi: 1 },
        ].map((r, i) => {
          const statusColors = ['bg-blue-50 text-blue-700', 'bg-amber-50 text-amber-700', 'bg-teal-50 text-teal-700', 'bg-purple-50 text-purple-700', 'bg-green-50 text-green-700']
          const priorityDots = ['bg-red-500', 'bg-amber-500', 'bg-blue-500']
          return (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-charcoal-100 hover:border-primary-200 transition-colors">
              <div className={`w-1.5 h-1.5 rounded-full ${priorityDots[r.pi]}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium text-charcoal-700 truncate">{r.t}</div>
                <div className="text-[8px] text-charcoal-400">REQ-00{i+1} · Flight · 2 messages</div>
              </div>
              <div className={`text-[7px] font-semibold px-1.5 py-0.5 rounded ${statusColors[r.si]}`}>{r.s}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RemindersPreview() {
  return (
    <div className="p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          <span className="text-xs font-semibold text-charcoal-700">Upcoming Reminders</span>
        </div>
        <div className="w-5 h-5 rounded-lg bg-accent-100 flex items-center justify-center">
          <svg className="w-3 h-3 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { t: 'Credit Card Bill Due - $2,450', d: 'Jun 18', c: 'bg-red-50 border-red-100', dc: 'text-red-600' },
          { t: 'Insurance Renewal - HDFC Life', d: 'Jul 8', c: 'bg-amber-50 border-amber-100', dc: 'text-amber-600' },
          { t: 'Doctor Appointment - Annual Checkup', d: 'Jun 22', c: 'bg-blue-50 border-blue-100', dc: 'text-blue-600' },
          { t: 'Quarterly Portfolio Review', d: 'Jul 1', c: 'bg-purple-50 border-purple-100', dc: 'text-purple-600' },
          { t: "Mother's Birthday Gift", d: 'Jun 25', c: 'bg-green-50 border-green-100', dc: 'text-green-600' },
        ].map((r, i) => (
          <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${r.c}`}>
            <div className="w-4 h-4 rounded border-2 border-charcoal-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-charcoal-700 truncate">{r.t}</div>
            </div>
            <div className={`text-[8px] font-semibold ${r.dc}`}>{r.d}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 pt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-charcoal-300" />
        <div className="w-3 h-1.5 rounded-full bg-charcoal-800" />
        <div className="w-1.5 h-1.5 rounded-full bg-charcoal-300" />
      </div>
    </div>
  )
}

function AdminPreview() {
  return (
    <div className="p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-charcoal-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-[8px] font-bold">AT</div>
          <span className="text-[10px] font-semibold text-charcoal-700">Admin Team</span>
        </div>
        <div className="text-[8px] text-charcoal-400 font-mono">3 active · 2 waiting</div>
      </div>
      <div className="space-y-2">
        {[
          { t: 'Flight Booking - Diwali Trip', u: 'Ananya Patel', s: 'In Progress', c: 'bg-blue-100 text-blue-700', msg: 'Found 3 Emirates options within budget' },
          { t: 'Doctor Appointment Scheduling', u: 'Rajesh Sharma', s: 'Need Info', c: 'bg-amber-100 text-amber-700', msg: 'Waiting for preferred time slots' },
          { t: 'Gift Delivery - Mother\'s Bday', u: 'Vikram Singh', s: 'Approval', c: 'bg-purple-100 text-purple-700', msg: 'Proposal sent - awaiting approval' },
        ].map((r, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-white border border-charcoal-100 hover:border-primary-200 transition-colors">
            <div className="flex items-start gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-amber-500' : 'bg-purple-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-medium text-charcoal-700 truncate">{r.t}</div>
                  <div className={`text-[7px] font-semibold px-1.5 py-0.5 rounded ${r.c}`}>{r.s}</div>
                </div>
                <div className="text-[8px] text-charcoal-400 mt-0.5">{r.u} · {r.msg}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[8px] text-charcoal-400 pt-1">
        {['Submitted', 'Assigned', 'In Progress', 'Completed'].map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-primary-500' : i === 2 ? 'bg-blue-500' : 'bg-charcoal-200'}`} />
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

const mockups = [
  { label: 'Customer Dashboard', desc: 'See everything at a glance — active requests, upcoming renewals, reminders, and family events in one unified view.', screen: <DashboardPreview /> },
  { label: 'Active Requests', desc: 'Track every task from submission to completion with real-time status updates, priority indicators, and message history.', screen: <RequestsPreview /> },
  { label: 'Reminder Center', desc: 'Never miss a renewal, payment, or important date again. Custom reminders for bills, insurance, appointments, and family milestones.', screen: <RemindersPreview /> },
  { label: 'Admin Workflow', desc: 'Behind the scenes: our team tracks every request with full timeline, internal notes, customer communication, and status management.', screen: <AdminPreview /> },
]

function SectionHeading({ label, title, text }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
      <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.25em]">{label}</span>
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-charcoal-800 mt-4 mb-5 leading-tight">{title}</h2>
      {text && <p className="text-charcoal-400 text-base md:text-lg leading-relaxed">{text}</p>}
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-accent-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto section-padding pt-28 pb-16 md:pt-40 md:pb-24 relative w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
              <span className="text-primary-700 text-xs font-semibold uppercase tracking-widest">
                Life Admin for Busy NRIs
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-charcoal-800 leading-[1.1] mb-6">
              Stop Managing Life.{' '}
              <span className="text-primary-500 italic">Start Living It.</span>
            </h1>

            <p className="text-charcoal-500 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mb-10">
              We handle the reminders, appointments, paperwork, and life admin — so you can focus on your family, your work, and what actually matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/portal/consultation"
                className="group bg-primary-500 text-white hover:bg-primary-600 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide text-center inline-flex items-center justify-center gap-2 transition-all"
              >
                Book a Free Consultation
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <a
                href="#how-it-works"
                className="btn-outline px-8 py-4 rounded-xl text-sm font-semibold tracking-wide text-center inline-flex items-center justify-center gap-2"
              >
                See How It Works
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-8 mt-12">
              <div className="flex -space-x-2">
                {['AK', 'RJ', 'SM', 'PL'].map((l, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">{l}</div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-500 flex items-center justify-center text-white text-xs font-bold">2k+</div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-accent-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-charcoal-400 text-xs">Trusted by 2,000+ NRIs worldwide</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl" />
              <div className="absolute inset-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
                  </div>
                  <div>
                    <p className="text-charcoal-800 font-semibold text-sm">Saturday Morning</p>
                    <p className="text-charcoal-400 text-xs">Usually: paperwork & stress</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <p className="text-xs text-red-700 font-medium line-through">Forgot insurance renewal</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <p className="text-xs text-red-700 font-medium line-through">Missed credit card payment</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-medium">All handled by NRI PA ✓</p>
                      <p className="text-[10px] text-green-600">Enjoying your weekend</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-primary-50 border border-primary-100">
                  <p className="text-xs text-primary-700 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Time gained this week: <strong>5.5 hours</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PainPoints() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="The Mental Load"
          title="Does This Feel Familiar?"
          text="If you're an NRI juggling life across time zones, these aren't complaints — they're daily reality."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {painPoints.map((p, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-charcoal-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-300">
              <div className="w-14 h-14 mb-5">{p.icon}</div>
              <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">{p.title}</h3>
              <p className="text-sm text-charcoal-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BeforeAfter() {
  const [baView, setBaView] = useState('before')

  return (
    <section className="py-20 md:py-28 bg-charcoal-50/40">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="The Transformation"
          title="Before NRI PA vs After"
          text="We don't just check boxes. We change how your week feels."
        />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-10">
            {['before', 'after'].map((v) => (
              <button
                key={v}
                onClick={() => setBaView(v)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  baView === v
                    ? v === 'before' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                    : 'bg-white text-charcoal-400 border border-charcoal-100'
                }`}
              >
                {v === 'before' ? '☹️ Life Without NRI PA' : '😊 Life With NRI PA'}
              </button>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-white border shadow-xl">
            {baView === 'before' ? (
              <div className="p-8 md:p-10 md:pb-0">
                <div className="grid md:grid-cols-2 gap-8 items-end">
                  <div className="pb-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                      <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-charcoal-800 mb-3">The Overwhelm</h3>
                    <p className="text-sm text-charcoal-500 leading-relaxed mb-5">Weekends disappear into paperwork. Your mind never stops running through the to-do list. Even quality time feels stolen, not earned.</p>
                    <ul className="space-y-2.5">
                      {[
                        { t: 'Dreading bill due dates', s: 'Late fees, stress, credit score anxiety' },
                        { t: 'Mental to-do list never ends', s: 'Even at dinner, your brain is running' },
                        { t: 'Procrastinating on paperwork', s: 'Visa renewals, taxes, forms — always tomorrow' },
                        { t: 'Weekends = catch-up time', s: 'Not rest. Not family. Not you.' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          <div><div className="text-sm font-medium text-charcoal-700">{item.t}</div><div className="text-xs text-charcoal-400">{item.s}</div></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative md:-mb-10">
                    <div className="bg-gradient-to-t from-red-50 to-transparent rounded-2xl p-6 md:p-8">
                      <div className="w-full aspect-[3/2] relative">
                        <div className="absolute inset-0 rounded-xl bg-white border border-red-100 overflow-hidden">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2"><div className="w-8 h-2 bg-red-200 rounded" /><div className="flex-1" /></div>
                            {[70, 90, 50, 80].map((w, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-4 h-2 bg-red-100 rounded" />
                                <div className={`h-2 bg-red-200 rounded`} style={{ width: `${w}%` }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-10 md:pb-0">
                <div className="grid md:grid-cols-2 gap-8 items-end">
                  <div className="pb-6">
                    <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-charcoal-800 mb-3">The Relief</h3>
                    <p className="text-sm text-charcoal-500 leading-relaxed mb-5">Weekends belong to you again. The mental load is lifted. You're present with your family — because someone else is handling the details.</p>
                    <ul className="space-y-2.5">
                      {[
                        { t: 'Bills paid automatically', s: 'On time, every time. No late fees. No anxiety.' },
                        { t: 'Calendar is clear', s: 'We schedule everything. You just show up.' },
                        { t: 'Paperwork done for you', s: 'Forms filed. Renewals processed. Stress eliminated.' },
                        { t: 'Weekends are weekends', s: 'Family time. Rest. Hobbies. Actual living.' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          <div><div className="text-sm font-medium text-charcoal-700">{item.t}</div><div className="text-xs text-charcoal-400">{item.s}</div></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative md:-mb-10">
                    <div className="bg-gradient-to-t from-green-50 to-transparent rounded-2xl p-6 md:p-8">
                      <div className="w-full aspect-[3/2] relative">
                        <div className="absolute inset-0 rounded-xl bg-white border border-green-100 overflow-hidden">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2"><div className="w-8 h-2 bg-green-200 rounded" /><div className="flex-1" /><div className="w-4 h-2 bg-green-200 rounded-full" /></div>
                            <div className="flex items-center justify-center h-20">
                              <div className="text-center"><div className="text-2xl">☀️</div><div className="text-[10px] text-charcoal-400 mt-1">Enjoying your weekend</div></div>
                            </div>
                            <div className="flex gap-1 justify-center">
                              {[1,2,3].map(i => <div key={i} className="w-6 h-2 bg-green-100 rounded" />)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ServicesGrid() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="What We Handle"
          title="Your Entire Life Admin. One Partner."
          text="Not just one service. Everything that steals your time, we take off your plate."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-charcoal-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color} mb-4 group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">{s.title}</h3>
              <p className="text-sm text-charcoal-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-charcoal-50/30">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="How It Works"
          title="4 Steps to a Lighter Mental Load"
          text="No onboarding calls. No learning curves. Just tell us what you need, and we go."
        />
        <div className="grid md:grid-cols-4 gap-8 md:gap-6 relative">
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-primary-200" />
          {steps.map((s, i) => (
            <div key={i} className="relative text-center md:text-left">
              <div className="w-20 h-20 mx-auto md:mx-0 rounded-2xl bg-primary-500 flex items-center justify-center mb-5 relative z-10 shadow-lg shadow-primary-500/20">
                <span className="text-white font-serif text-xl font-bold">{s.num}</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">{s.title}</h3>
              <p className="text-sm text-charcoal-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyNotDIY() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="The Real Cost"
          title="Why Not Do It Yourself?"
          text="Let's be honest — you already know how to do these things. The question is: should you be spending your time on them?"
        />
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border-2 border-charcoal-100 bg-white">
              <div className="text-center mb-6">
                <div className="text-5xl font-serif font-bold text-red-400 mb-2">~12 hrs</div>
                <p className="text-sm text-charcoal-400">per week doing life admin</p>
              </div>
              <ul className="space-y-3">
                {[
                  'Chasing bill payments & due dates',
                  'Researching flights, schools, doctors',
                  'Filling out government forms',
                  'Coordinating family schedules',
                  'Tracking subscription renewals',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-charcoal-500">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-xs text-red-700 font-medium text-center">That's 624 hours a year — 26 entire days.</p>
              </div>
            </div>
            <div className="p-8 rounded-2xl border-2 border-primary-200 bg-primary-50/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap">WITH NRI PA</div>
              <div className="text-center mb-6">
                <div className="text-5xl font-serif font-bold text-primary-500 mb-2">~0 hrs</div>
                <p className="text-sm text-primary-600/70">per week on life admin</p>
              </div>
              <ul className="space-y-3">
                {[
                  'Bills & renewals handled automatically',
                  'Appointments scheduled & confirmed',
                  'Paperwork submitted on time',
                  'Family calendar managed for you',
                  'Subscriptions optimized & tracked',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-charcoal-500">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs text-green-700 font-medium text-center">That's 624 hours back. Imagine what you could do.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingOutcome() {
  return (
    <section className="py-20 md:py-28 bg-charcoal-50/30">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="Simple Pricing"
          title="Less Than a Coffee a Day"
          text="For less than the cost of a streaming subscription, gain back hours of your time every week."
        />
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <div key={i} className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
              p.featured
                ? 'border-primary-500 bg-white shadow-xl shadow-primary-500/10 scale-[1.02] md:scale-105 relative'
                : 'border-charcoal-100 bg-white hover:border-primary-200'
            }`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap">MOST POPULAR</div>
              )}
              <div className="text-center mb-6">
                <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">{p.name}</h3>
                <p className="text-charcoal-400 text-sm mb-4">{p.desc}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-serif text-4xl font-bold text-charcoal-800">{p.price}</span>
                  <span className="text-sm text-charcoal-400">{p.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-charcoal-600">
                  <svg className="w-4 h-4 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  {p.tasks}
                </li>
                <li className="flex items-center gap-3 text-sm text-charcoal-600">
                  <svg className="w-4 h-4 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  {p.extra}
                </li>
                <li className="flex items-center gap-3 text-sm text-charcoal-600">
                  <svg className="w-4 h-4 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Dedicated support
                </li>
              </ul>
              <Link
                to="/portal/consultation"
                className={`block text-center py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  p.featured
                    ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'
                    : 'bg-charcoal-50 text-charcoal-700 hover:bg-charcoal-100 border border-charcoal-200'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustPrivacy() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="Trust & Privacy"
          title="Your Life Is Private. We Treat It That Way."
          text="We handle sensitive information every day. Here's how we earn and keep your trust."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {[
            {
              icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
              title: 'End-to-End Encryption',
              desc: 'All your documents and conversations are encrypted. We never share your data.',
            },
            {
              icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>,
              title: 'No Data Sharing',
              desc: 'We never sell, rent, or share your personal information with third parties. Ever.',
            },
            {
              icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              title: 'Secure Payments',
              desc: 'All billing is processed through encrypted payment gateways. Your financial data stays safe.',
            },
            {
              icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
              title: 'Vetted Team',
              desc: 'Every team member signs an NDA and undergoes background verification before handling your data.',
            },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-charcoal-100 hover:border-primary-200 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="font-serif text-base font-semibold text-charcoal-800 mb-2">{item.title}</h3>
              <p className="text-sm text-charcoal-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-charcoal-800 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto section-padding relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-primary-300 font-semibold text-xs uppercase tracking-[0.25em]">Start Your Journey</span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mt-4 mb-6 leading-tight">
            Ready to Stop Managing Life?
          </h2>
          <p className="text-charcoal-300 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            One conversation is all it takes. Tell us what's on your plate, and we'll show you exactly how we can help lift it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/portal/consultation"
              className="group bg-primary-500 text-white hover:bg-primary-400 px-10 py-4 rounded-xl text-sm font-semibold tracking-wide inline-flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-500/20"
            >
              Book Your Free Consultation
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
            <a
              href="/services"
              className="text-sm font-semibold tracking-wide px-10 py-4 rounded-xl border border-charcoal-500 text-charcoal-300 hover:bg-charcoal-700 hover:text-white transition-all inline-flex items-center justify-center"
            >
              Explore Services
            </a>
          </div>
          <p className="text-charcoal-500 text-xs mt-6">No commitment required. Free 15-minute discovery call.</p>
        </div>
      </div>
    </section>
  )
}

function NRISpecificSection() {
  return (
    <section className="py-20 md:py-28 bg-charcoal-800 overflow-hidden">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="text-primary-300 font-semibold text-xs uppercase tracking-[0.25em]">For the Global Indian</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mt-4 mb-6 leading-tight">
              Built for NRIs Managing Life Across Countries
            </h2>
            <p className="text-charcoal-300 text-base md:text-lg leading-relaxed mb-8">
              Your life doesn't fit into one time zone. Your assistant shouldn't either. We understand the unique complexity of managing finances, family, and paperwork across borders — because that's all we do.
            </p>
            <Link
              to="/portal/consultation"
              className="inline-flex items-center gap-2 text-primary-300 hover:text-primary-200 font-semibold text-sm transition-colors group"
            >
              See how it works for NRIs
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {nriChallenges.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-300 flex items-center justify-center mb-3">{item.icon}</div>
                <h3 className="font-serif text-base font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-charcoal-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RealExamplesSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="Real Examples"
          title="Things We've Actually Done"
          text="Not hypothetical. Every example here is a real task we've handled for NRI families just like yours."
        />
        <div className="max-w-3xl mx-auto space-y-3">
          {realExamples.map((ex, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-charcoal-50/50 hover:bg-primary-50/50 hover:border-primary-100 border border-transparent transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg flex-shrink-0 shadow-sm">{ex.emoji}</div>
              <p className="text-sm text-charcoal-600 leading-relaxed pt-1.5">{ex.task}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function InteractiveExamplesSection() {
  const [selectedTask, setSelectedTask] = useState(null)
  const responses = {
    'Credit card bills stacking up': '"We\'ll review your due dates, set up payment reminders, and negotiate late fee waivers if needed. One less thing to worry about."',
    'Need to book flights for family': '"We\'ll research the best routes, compare airlines, check visa requirements, and book the tickets — keeping your budget and preferences in mind."',
    'Doctor appointments to schedule': '"We\'ll find the best specialists, check availability, book appointments that fit your schedule, and send you calendar invites."',
    'Subscriptions I never use': '"We\'ll audit every subscription, identify unused services, cancel what you don\'t need, and optimize the ones you keep."',
    'Tax paperwork is overwhelming': '"We\'ll organize all your documents, create a filing checklist, and prepare everything your CA needs — in the right format."',
    'Send gifts to family back home': '"We\'ll find the perfect gift, arrange delivery, include a personalized message, and make sure it arrives on time."',
    'Visa or passport renewal': '"We\'ll gather the forms, verify your documents, schedule the appointment, and track the application until it\'s done."',
    'Property or rent paperwork': '"We\'ll review the agreements, coordinate with the property manager, handle the payments, and keep digital copies organized."',
  }

  return (
    <section className="py-20 md:py-28 bg-charcoal-50/40">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="What's Weighing on You?"
          title="What Is Currently on Your Mind?"
          text="Tap any item. We'll tell you exactly how we'd handle it."
        />
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {interactiveTasks.map((t, i) => (
              <button
                key={i}
                onClick={() => setSelectedTask(selectedTask === t.label ? null : t.label)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedTask === t.label
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-white border border-charcoal-100 text-charcoal-600 hover:border-primary-200 hover:bg-primary-50'
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          {selectedTask && (
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-primary-200 shadow-lg shadow-primary-500/5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">How We'd Handle This</p>
                  <p className="text-sm md:text-base text-charcoal-700 leading-relaxed">{responses[selectedTask]}</p>
                  <Link
                    to="/portal/consultation"
                    className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-semibold text-sm mt-4 transition-colors"
                  >
                    Let's talk about this
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ProductShowcaseSection() {
  const [activeMockup, setActiveMockup] = useState(0)

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="See the Platform"
          title="Your Dashboard Awaits"
          text="This isn't a concept. It's a working platform designed to give you clarity and control over every aspect of your life admin."
        />
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
          <div className="space-y-3">
            {mockups.map((m, i) => (
              <button
                key={i}
                onClick={() => setActiveMockup(i)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  activeMockup === i
                    ? 'bg-primary-50 border border-primary-200 shadow-sm'
                    : 'bg-transparent border border-transparent hover:bg-charcoal-50'
                }`}
              >
                <h3 className={`font-serif text-base font-semibold mb-1 ${activeMockup === i ? 'text-primary-700' : 'text-charcoal-800'}`}>{m.label}</h3>
                <p className="text-sm text-charcoal-400 leading-relaxed">{m.desc}</p>
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl opacity-60" />
            <div className="relative bg-white rounded-2xl border border-charcoal-100 shadow-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 pt-4 pb-2 border-b border-charcoal-100">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-3 px-3 py-0.5 bg-charcoal-50 rounded text-[8px] text-charcoal-400 font-mono">{mockups[activeMockup].label}</div>
              </div>
              {mockups[activeMockup].screen}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section className="py-20 md:py-28 bg-charcoal-50/30">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionHeading
          label="Why Trust Us"
          title="The NRI PA Difference"
          text="We don't just claim to be different. Here's exactly how we operate."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {trustPoints.map((t, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-charcoal-100 hover:border-primary-200 hover:shadow-md transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">{t.icon}</div>
              <h3 className="font-serif text-base font-semibold text-charcoal-800 mb-2">{t.title}</h3>
              <p className="text-sm text-charcoal-400 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustCTA() {
  return (
    <section className="py-20 md:py-28 bg-charcoal-800 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto section-padding relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-primary-300 font-semibold text-xs uppercase tracking-[0.25em]">Take the First Step</span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mt-4 mb-6 leading-tight">
            Life is too short to spend your weekends managing reminders, paperwork, and follow-ups.
          </h2>
          <p className="text-charcoal-300 text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            You built a life across countries. You deserve the time to actually live it. Let us handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/portal/consultation"
              className="group bg-primary-500 text-white hover:bg-primary-400 px-10 py-4 rounded-xl text-sm font-semibold tracking-wide inline-flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-500/20"
            >
              Book a Free Consultation
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
            <a
              href="/about"
              className="text-sm font-semibold tracking-wide px-10 py-4 rounded-xl border border-charcoal-500 text-charcoal-300 hover:bg-charcoal-700 hover:text-white transition-all inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
          <p className="text-charcoal-500 text-xs mt-6">No commitment. Free 15-minute discovery call. See if we're a fit.</p>
        </div>
      </div>
    </section>
  )
}

function EmotionalSection({ bg, label, title, text, visual, reverse }) {
  return (
    <section className={`py-20 md:py-28 ${bg}`}>
      <div className="max-w-7xl mx-auto section-padding">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? '' : ''}`}>
          <div className={reverse ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}>
            <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.25em]">{label}</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-charcoal-800 mt-4 mb-5 leading-tight">{title}</h2>
            <p className="text-charcoal-500 text-base md:text-lg leading-relaxed">{text}</p>
            <Link
              to="/portal/consultation"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm mt-6 transition-colors group"
            >
              Start your journey
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
          <div className={reverse ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}>
            {visual}
          </div>
        </div>
      </div>
    </section>
  )
}

function PeaceOfMindSection() {
  return (
    <EmotionalSection
      bg="bg-white"
      label="Peace of Mind"
      title="Imagine an Evening Where Nothing Is Urgent"
      text="No bills due tomorrow. No forgotten renewals. No visa deadlines you just realized you missed. Just quiet. Just calm. Just your evening — exactly as it should be."
      visual={
        <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl" />
          <div className="absolute inset-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-primary-100 p-6 md:p-8 flex flex-col justify-center items-center text-center">
            <div className="text-5xl mb-5">🌅</div>
            <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 bg-primary-500 rounded-full" /><span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">Your Evening, Unplugged</span></div>
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 w-full max-w-xs">
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-xl">📖</div>
                <div className="text-left"><div className="text-sm font-medium text-charcoal-700">Reading Time</div><div className="text-xs text-charcoal-400">No notifications. No stress.</div></div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}

function FamilyTimeSection() {
  return (
    <EmotionalSection
      bg="bg-charcoal-50/30"
      label="Family Time"
      title="Saturdays Are for Family Again"
      text="While you're at the park with your kids or on a call with your parents back home, we're handling the insurance renewals, travel bookings, and paperwork. You're present. We've got the rest."
      reverse
      visual={
        <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tl from-green-50 via-white to-primary-50 rounded-3xl" />
          <div className="absolute inset-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-green-100 p-6 md:p-8 flex flex-col justify-center items-center text-center">
            <div className="text-5xl mb-5">👨‍👩‍👧‍👦</div>
            <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 bg-green-500 rounded-full" /><span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">Weekend, Finally</span></div>
            <div className="space-y-2 w-full max-w-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-3"><span className="text-lg">🎮</span><span className="text-sm text-charcoal-700">Game night with kids</span></div>
                <span className="text-[10px] font-semibold text-green-600">Handled ✓</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-3"><span className="text-lg">📞</span><span className="text-sm text-charcoal-700">Call with parents</span></div>
                <span className="text-[10px] font-semibold text-green-600">Handled ✓</span>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}

function FreedomSection() {
  return (
    <EmotionalSection
      bg="bg-white"
      label="Freedom"
      title="The Mental Load Just... Stops"
      text="That background hum of anxiety? The one that's always there because you're always 'on'? It fades. When someone else is tracking the deadlines, you get to just live your life."
      visual={
        <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-50 via-white to-primary-50 rounded-3xl" />
          <div className="absolute inset-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-accent-200 p-6 md:p-8 flex flex-col justify-center">
            <div className="text-center mb-4">
              <span className="text-5xl">🕊️</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-accent-50 border border-accent-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-charcoal-700">Mental Load Level</span>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Low</span>
                </div>
                <div className="mt-2 h-2 bg-accent-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/5 bg-green-500 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-charcoal-100">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm">✓</div>
                <div><div className="text-xs font-medium text-charcoal-700">12 tasks handled this week</div><div className="text-[10px] text-charcoal-400">You didn't lift a finger</div></div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <PainPoints />
      <NRISpecificSection />
      <BeforeAfter />
      <PeaceOfMindSection />
      <ServicesGrid />
      <RealExamplesSection />
      <InteractiveExamplesSection />
      <HowItWorksSection />
      <FamilyTimeSection />
      <ProductShowcaseSection />
      <WhyNotDIY />
      <PricingOutcome />
      <FreedomSection />
      <TrustPrivacy />
      <TrustSection />
      <TrustCTA />
    </>
  )
}
