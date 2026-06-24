import { useState } from 'react'
import { Link } from 'react-router-dom'

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

const steps = [
  { n: 1, l: 'Start' },
  { n: 2, l: 'Details' },
  { n: 3, l: 'Plan' },
  { n: 4, l: 'Services' },
  { n: 5, l: 'Payment' },
  { n: 6, l: 'Welcome' },
]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [startOption, setStartOption] = useState(null)
  const [details, setDetails] = useState({ name: '', email: '', phone: '', country: '' })
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [cards, setCards] = useState([])
  const [cardForm, setCardForm] = useState({ nickname: '', lastFour: '', expiry: '' })

  const maxServices = selectedPlan ? planData.find((p) => p.name === selectedPlan)?.tasks || 0 : 0
  const canAddMore = selectedServices.length < maxServices

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id))
    } else if (canAddMore) {
      setSelectedServices([...selectedServices, id])
    }
  }

  const addCard = () => {
    if (cards.length >= 5) return
    if (cardForm.nickname.trim() && cardForm.lastFour.length === 4 && cardForm.expiry.trim()) {
      setCards([...cards, { ...cardForm, id: Date.now() }])
      setCardForm({ nickname: '', lastFour: '', expiry: '' })
    }
  }

  const removeCard = (id) => {
    setCards(cards.filter((c) => c.id !== id))
  }

  const submitPayment = () => {
    setStep(6)
  }

  const canProceedPayment = cards.length > 0 && selectedPlan && selectedServices.length > 0

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-12 overflow-x-auto pb-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-1 flex-shrink-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
            step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-primary-500 text-white' : 'bg-charcoal-100 text-charcoal-400'
          }`}>
            {step > s.n ? '✓' : s.n}
          </div>
          <span className={`text-[9px] font-medium hidden sm:block ${step >= s.n ? 'text-charcoal-700' : 'text-charcoal-400'}`}>{s.l}</span>
          {i < steps.length - 1 && <div className={`w-6 h-px ${step > s.n ? 'bg-green-500' : 'bg-charcoal-100'}`} />}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto section-padding py-12 md:py-20">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">Get Started with NRI PA</h1>
          <p className="text-charcoal-400 text-sm mt-2">Set up your account in under 3 minutes</p>
        </div>

        {renderStepIndicator()}

        {/* Step 1: Start */}
        {step === 1 && (
          <div className="max-w-md mx-auto">
            <h2 className="font-serif text-xl font-semibold text-charcoal-800 mb-2 text-center">How would you like to start?</h2>
            <p className="text-sm text-charcoal-400 text-center mb-8">Choose the path that works best for you.</p>
            <div className="space-y-4">
              <button
                onClick={() => { setStartOption('consultation'); setStep(2) }}
                className="w-full p-6 rounded-2xl border-2 border-charcoal-100 hover:border-primary-200 hover:bg-primary-50/30 text-left transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📞</div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-charcoal-800 mb-1">Book a Consultation Call</h3>
                    <p className="text-sm text-charcoal-400">Speak with our team first. Tell us what you need and we'll recommend the best plan.</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => { setStartOption('subscription'); setStep(2) }}
                className="w-full p-6 rounded-2xl border-2 border-charcoal-100 hover:border-primary-200 hover:bg-primary-50/30 text-left transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🚀</div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-charcoal-800 mb-1">Start a Subscription Directly</h3>
                    <p className="text-sm text-charcoal-400">You know what you need. Pick your plan, set up payment, and we'll get started right away.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div className="max-w-md mx-auto">
            <h2 className="font-serif text-xl font-semibold text-charcoal-800 mb-6 text-center">Your Details</h2>
            <div className="space-y-4">
              {[
                { k: 'name', l: 'Full Name', p: 'e.g. Vikram Singh', t: 'text' },
                { k: 'email', l: 'Email Address', p: 'e.g. vikram@email.com', t: 'email' },
                { k: 'phone', l: 'Phone Number', p: 'e.g. +1 234 567 890', t: 'tel' },
                { k: 'country', l: 'Country of Residence', p: 'e.g. UAE, USA, India', t: 'text' },
              ].map((f) => (
                <div key={f.k}>
                  <label className="block text-xs font-medium text-charcoal-500 mb-1.5">{f.l}</label>
                  <input
                    type={f.t}
                    value={details[f.k]}
                    onChange={(e) => setDetails({ ...details, [f.k]: e.target.value })}
                    placeholder={f.p}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!details.name.trim() || !details.email.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Plan */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-800 mb-6 text-center">Choose Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {planData.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { setSelectedPlan(p.name); setSelectedServices([]) }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    selectedPlan === p.name ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-charcoal-100 bg-white hover:border-primary-200'
                  }`}
                >
                  <h3 className="font-serif text-base font-semibold text-charcoal-800 mb-1">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-2xl font-bold text-charcoal-800">{p.price}</span>
                    <span className="text-xs text-charcoal-400">/mo</span>
                  </div>
                  <p className="text-xs text-charcoal-500 mb-3">{p.desc}</p>
                  <div className="text-xs font-semibold text-primary-600">{p.tasks} services/mo</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-8 justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!selectedPlan}
                className="px-6 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose Services
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Select Services */}
        {step === 4 && selectedPlan && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-charcoal-800">Select Your Services</h2>
              <div className="text-sm">
                <span className="font-bold text-primary-600">{selectedServices.length}</span>
                <span className="text-charcoal-400"> / {maxServices}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-charcoal-100 p-2 mb-6">
              <div className="h-2 bg-charcoal-50 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (selectedServices.length / maxServices) * 100)}%` }} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mb-8">
              {allServices.map((s) => {
                const isSelected = selectedServices.includes(s.id)
                const isDisabled = !isSelected && !canAddMore
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    disabled={isDisabled && !isSelected}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected ? 'border-primary-500 bg-primary-50' : isDisabled ? 'border-charcoal-50 bg-charcoal-50 opacity-40 cursor-not-allowed' : 'border-charcoal-100 bg-white hover:border-primary-200'
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-charcoal-700'}`}>{s.label}</span>
                    {isSelected && <svg className="w-4 h-4 ml-auto text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all">Back</button>
              <button onClick={() => setStep(5)} disabled={selectedServices.length === 0} className="px-6 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Continue to Payment</button>
            </div>
          </div>
        )}

        {/* Step 5: Payment + Card Management */}
        {step === 5 && (
          <div className="max-w-md mx-auto">
            <h2 className="font-serif text-xl font-semibold text-charcoal-800 mb-2 text-center">Payment Method</h2>
            <p className="text-sm text-charcoal-400 text-center mb-6">Add a payment card. Your information is encrypted and secure.</p>

            {/* Saved cards */}
            {cards.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Saved Cards ({cards.length}/5)</p>
                {cards.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-charcoal-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded bg-primary-50 flex items-center justify-center text-[8px] font-bold text-primary-600">CC</div>
                      <div>
                        <div className="text-sm font-medium text-charcoal-700">{c.nickname}</div>
                        <div className="text-xs text-charcoal-400">•••• {c.lastFour} · Exp {c.expiry}</div>
                      </div>
                    </div>
                    <button onClick={() => removeCard(c.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Remove</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add card form */}
            {cards.length < 5 && (
              <div className="p-6 rounded-2xl bg-white border border-charcoal-100">
                <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-4">{cards.length > 0 ? 'Add Another Card' : 'Add Your First Card'}</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-500 mb-1">Card Nickname</label>
                    <input
                      value={cardForm.nickname}
                      onChange={(e) => setCardForm({ ...cardForm, nickname: e.target.value })}
                      placeholder="e.g. My Visa, Work Card"
                      maxLength={30}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-500 mb-1">Last 4 Digits</label>
                      <input
                        value={cardForm.lastFour}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setCardForm({ ...cardForm, lastFour: v })
                        }}
                        placeholder="1234"
                        maxLength={4}
                        inputMode="numeric"
                        className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal-500 mb-1">Expiry Date</label>
                      <input
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-charcoal-400">We never store full card numbers. Only nickname, last 4 digits, and expiry date.</p>
                  <button
                    onClick={addCard}
                    disabled={cardForm.nickname.trim().length === 0 || cardForm.lastFour.length !== 4 || cardForm.expiry.trim().length === 0}
                    className="w-full py-3 rounded-xl bg-charcoal-50 text-charcoal-700 text-sm font-semibold hover:bg-charcoal-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-charcoal-200"
                  >
                    {cards.length === 0 ? 'Add Card' : 'Add Another Card'}
                  </button>
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-600">Plan</span>
                <span className="text-sm font-semibold text-charcoal-800">{selectedPlan}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-600">Services</span>
                <span className="text-sm font-semibold text-charcoal-800">{selectedServices.length}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-primary-200">
                <span className="text-sm font-semibold text-charcoal-800">Total</span>
                <span className="font-serif text-xl font-bold text-charcoal-800">{planData.find((p) => p.name === selectedPlan)?.price}/mo</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(4)} className="flex-1 px-4 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all">Back</button>
              <button onClick={submitPayment} disabled={!canProceedPayment} className="flex-1 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {startOption === 'consultation' ? 'Book Consultation & Subscribe' : 'Start Subscription'}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Welcome Dashboard */}
        {step === 6 && (
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-charcoal-800 mb-2">Welcome to NRI PA!</h2>
            <p className="text-charcoal-400 text-sm mb-6">
              {startOption === 'consultation'
                ? 'We\'ve scheduled your consultation call. Our team will reach out within 24 hours.'
                : 'Your subscription is active. We\'ll start working on your services right away.'}
            </p>
            <div className="bg-white rounded-2xl border border-charcoal-100 p-5 mb-8 text-left">
              <div className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Your Setup Summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-charcoal-500">Name</span><span className="text-charcoal-700 font-medium">{details.name}</span></div>
                <div className="flex justify-between"><span className="text-charcoal-500">Plan</span><span className="text-charcoal-700 font-medium">{selectedPlan}</span></div>
                <div className="flex justify-between"><span className="text-charcoal-500">Services</span><span className="text-charcoal-700 font-medium">{selectedServices.length}</span></div>
                <div className="flex justify-between"><span className="text-charcoal-500">Cards</span><span className="text-charcoal-700 font-medium">{cards.length} saved</span></div>
                <div className="flex justify-between pt-2 border-t border-charcoal-100"><span className="font-semibold text-charcoal-800">Monthly</span><span className="font-bold text-primary-600">{planData.find((p) => p.name === selectedPlan)?.price}/mo</span></div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/portal/login"
                className="px-8 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all"
              >
                Go to Your Dashboard
              </Link>
              <button
                onClick={() => {
                  setStep(1)
                  setStartOption(null)
                  setDetails({ name: '', email: '', phone: '', country: '' })
                  setSelectedPlan(null)
                  setSelectedServices([])
                  setCards([])
                }}
                className="px-8 py-3 rounded-xl border border-charcoal-100 text-sm font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-all"
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
