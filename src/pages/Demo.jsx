import { useState } from 'react'

const planData = [
  { name: 'Personal', price: '$10', tasks: 10, desc: 'Essential life admin support' },
  { name: 'Professional', price: '$20', tasks: 25, desc: 'For busy professionals juggling it all' },
  { name: 'Concierge', price: '$49', tasks: 60, desc: 'Full-service dedicated partnership' },
]

const allServices = [
  { id: 'travel', label: 'Travel & Flights', emoji: '✈️' },
  { id: 'finance', label: 'Finance & Bills', emoji: '💳' },
  { id: 'appointments', label: 'Appointments & Calendar', emoji: '🏥' },
  { id: 'subscriptions', label: 'Subscription Management', emoji: '📺' },
  { id: 'family', label: 'Family & Lifestyle', emoji: '🎁' },
  { id: 'paperwork', label: 'Paperwork & Admin', emoji: '📋' },
  { id: 'research', label: 'Research Services', emoji: '🔍' },
  { id: 'email', label: 'Email Assistance', emoji: '📧' },
  { id: 'calendar', label: 'Calendar & Scheduling', emoji: '📅' },
  { id: 'property', label: 'Property & Relocation', emoji: '🏠' },
]

export default function Demo() {
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])

  const maxServices = selectedPlan ? planData.find((p) => p.name === selectedPlan)?.tasks || 0 : 0
  const canAddMore = selectedServices.length < maxServices

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id))
    } else if (canAddMore) {
      setSelectedServices([...selectedServices, id])
    }
  }

  const reset = () => {
    setStep(1)
    setSelectedPlan(null)
    setSelectedServices([])
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto section-padding py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-primary-500 font-semibold text-xs uppercase tracking-[0.25em]">Interactive Demo</span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-charcoal-800 mt-4 mb-4 leading-tight">
            See What Your Plan Looks Like
          </h1>
          <p className="text-charcoal-400 text-base max-w-xl mx-auto">
            Choose a plan, pick your services, and preview a personalized dashboard — in under 30 seconds.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[{ n: 1, l: 'Plan' }, { n: 2, l: 'Services' }, { n: 3, l: 'Preview' }].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-primary-500 text-white' : 'bg-charcoal-100 text-charcoal-400'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-xs font-medium ${step >= s.n ? 'text-charcoal-700' : 'text-charcoal-400'}`}>{s.l}</span>
              {s.n < 3 && <div className={`w-8 h-0.5 ${step > s.n ? 'bg-green-500' : 'bg-charcoal-100'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-800 mb-6 text-center">Choose Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {planData.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { setSelectedPlan(p.name); setSelectedServices([]); setStep(2) }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                    selectedPlan === p.name ? 'border-primary-500 bg-primary-50' : 'border-charcoal-100 bg-white hover:border-primary-200'
                  }`}
                >
                  <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-1">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="font-serif text-3xl font-bold text-charcoal-800">{p.price}</span>
                    <span className="text-sm text-charcoal-400">/month</span>
                  </div>
                  <p className="text-sm text-charcoal-500 mb-4">{p.desc}</p>
                  <div className="flex items-center gap-2 text-sm text-charcoal-600">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="font-semibold">{p.tasks} services</span>
                    <span className="text-charcoal-400">/ month</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedPlan && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold text-charcoal-800">Choose Your Services</h2>
              <div className="text-sm">
                <span className="font-bold text-primary-600">{selectedServices.length}</span>
                <span className="text-charcoal-400"> / {maxServices} selected</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-charcoal-100 p-2 mb-4">
              <div className="h-2 bg-charcoal-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (selectedServices.length / maxServices) * 100)}%` }}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {allServices.map((s) => {
                const isSelected = selectedServices.includes(s.id)
                const isDisabled = !isSelected && !canAddMore
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    disabled={isDisabled && !isSelected}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : isDisabled
                          ? 'border-charcoal-50 bg-charcoal-50 opacity-40 cursor-not-allowed'
                          : 'border-charcoal-100 bg-white hover:border-primary-200'
                    }`}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-charcoal-700'}`}>{s.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 ml-auto text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedServices.length === 0}
                className="px-6 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Your Dashboard
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedPlan && (
          <div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-800 mb-6 text-center">Your Personalized Dashboard Preview</h2>
            <div className="bg-white rounded-2xl border border-charcoal-100 shadow-xl overflow-hidden max-w-2xl mx-auto">
              <div className="flex items-center gap-1.5 px-4 pt-4 pb-2 border-b border-charcoal-100 bg-charcoal-50">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-3 px-2 py-0.5 bg-white rounded text-[8px] text-charcoal-400 font-mono">{selectedPlan} Dashboard</div>
              </div>
              <div className="p-5 md:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">YN</div>
                    <div>
                      <div className="text-sm font-semibold text-charcoal-800">Your Dashboard</div>
                      <div className="text-[10px] text-charcoal-400">{selectedPlan} Plan · {selectedServices.length} services</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { n: selectedServices.length, l: 'Active', c: 'bg-blue-50 text-blue-600' },
                    { n: Math.max(0, maxServices - selectedServices.length), l: 'Remaining', c: 'bg-green-50 text-green-600' },
                    { n: Math.floor(selectedServices.length / 2), l: 'Completed', c: 'bg-purple-50 text-purple-600' },
                    { n: Math.ceil(selectedServices.length * 0.7), l: 'Reminders', c: 'bg-amber-50 text-amber-600' },
                  ].map((s, i) => (
                    <div key={i} className="p-3 rounded-xl text-center bg-charcoal-50/70">
                      <div className="text-xl font-bold text-charcoal-800">{s.n}</div>
                      <div className="text-[9px] font-medium text-charcoal-400">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider">Your Services</span>
                    <span className="text-[9px] text-charcoal-400">{selectedServices.length} of {maxServices}</span>
                  </div>
                  <div className="space-y-1.5">
                    {allServices.filter((s) => selectedServices.includes(s.id)).map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-charcoal-100">
                        <span className="text-base">{s.emoji}</span>
                        <span className="text-xs font-medium text-charcoal-700 flex-1">{s.label}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[9px] text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-800 font-medium">{selectedPlan} Plan</span>
                    <span className="text-primary-800 font-bold">{planData.find((p) => p.name === selectedPlan)?.price}/mo</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-primary-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(selectedServices.length / maxServices) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-primary-600 mt-1">{selectedServices.length} of {maxServices} services used</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all"
              >
                Adjust Services
              </button>
              <a
                href="/onboarding"
                className="px-8 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all text-center"
              >
                Get Started — {planData.find((p) => p.name === selectedPlan)?.price}/mo
              </a>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-500 hover:bg-charcoal-50 transition-all"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
