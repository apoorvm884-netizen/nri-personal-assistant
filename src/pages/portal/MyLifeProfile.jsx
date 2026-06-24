import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import * as lifeProfileService from '../../services/lifeProfileService'

const EMPTY_PROFILE = {
  personalInfo: { name: '', country: '', timezone: '', preferredContact: '' },
  familyInfo: { members: [] },
  subscriptions: [],
  cards: [],
  documents: { passport: '', visa: '', insurance: '', taxDocuments: '' },
  preferences: { preferredAirline: '', preferredHotel: '', preferredCurrency: '', preferredCommMethod: '' },
}

const tabs = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'family', label: 'Family Information' },
  { id: 'subscriptions', label: 'Subscription Vault' },
  { id: 'cards', label: 'Bills & Cards' },
  { id: 'documents', label: 'Important Documents' },
  { id: 'preferences', label: 'Preferences' },
]

export default function MyLifeProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [activeTab, setActiveTab] = useState('personal')
  const [saved, setSaved] = useState(false)
  const [newFamilyMember, setNewFamilyMember] = useState({ name: '', birthday: '', anniversary: '' })
  const [newSub, setNewSub] = useState({ serviceName: '', renewalDate: '', monthlyCost: '', reminderDays: '' })
  const [newCard, setNewCard] = useState({ nickname: '', lastFour: '', dueDate: '', bankName: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    lifeProfileService.getLifeProfile(user.id).then((existing) => {
      if (existing) {
        setProfile({
          personalInfo: existing.personalInfo || EMPTY_PROFILE.personalInfo,
          familyInfo: existing.familyInfo || EMPTY_PROFILE.familyInfo,
          subscriptions: existing.subscriptions || [],
          cards: existing.cards || [],
          documents: existing.documents || EMPTY_PROFILE.documents,
          preferences: existing.preferences || EMPTY_PROFILE.preferences,
        })
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const saveProfile = useCallback(async (section, data) => {
    if (!user) return
    const updated = { ...profile, [section]: data }
    setProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    try {
      await lifeProfileService.upsertLifeProfile(user.id, updated)
    } catch {
      // Best effort
    }
  }, [user, profile])

  const handlePersonalChange = (e) => {
    saveProfile('personalInfo', { ...profile.personalInfo, [e.target.name]: e.target.value })
  }

  const addFamilyMember = () => {
    if (!newFamilyMember.name.trim()) return
    const members = [...profile.familyInfo.members, { ...newFamilyMember, id: Date.now() }]
    saveProfile('familyInfo', { ...profile.familyInfo, members })
    setNewFamilyMember({ name: '', birthday: '', anniversary: '' })
  }

  const removeFamilyMember = (id) => {
    saveProfile('familyInfo', { ...profile.familyInfo, members: profile.familyInfo.members.filter((m) => m.id !== id) })
  }

  const addSubscription = () => {
    if (!newSub.serviceName.trim()) return
    saveProfile('subscriptions', [...profile.subscriptions, { ...newSub, id: Date.now() }])
    setNewSub({ serviceName: '', renewalDate: '', monthlyCost: '', reminderDays: '' })
  }

  const removeSubscription = (id) => {
    saveProfile('subscriptions', profile.subscriptions.filter((s) => s.id !== id))
  }

  const addCard = () => {
    if (!newCard.nickname.trim() || newCard.lastFour.length !== 4) return
    saveProfile('cards', [...profile.cards, { ...newCard, id: Date.now() }])
    setNewCard({ nickname: '', lastFour: '', dueDate: '', bankName: '' })
  }

  const removeCard = (id) => {
    saveProfile('cards', profile.cards.filter((c) => c.id !== id))
  }

  const handleDocumentChange = (e) => {
    saveProfile('documents', { ...profile.documents, [e.target.name]: e.target.value })
  }

  const handlePreferenceChange = (e) => {
    saveProfile('preferences', { ...profile.preferences, [e.target.name]: e.target.value })
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
  const labelClass = "block text-xs font-medium text-charcoal-500 mb-1.5 uppercase tracking-wider"

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">My Life Profile</h1>
          <p className="text-charcoal-400 text-sm mt-1">Manage your personal information and preferences.</p>
        </div>
        {saved && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">Saved</span>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === t.id ? 'bg-primary-500 text-white' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'
            }`}
          >{t.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 p-6 md:p-8">
        {/* Personal Information */}
        {activeTab === 'personal' && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" name="name" value={profile.personalInfo.name} onChange={handlePersonalChange}
                  placeholder="Your full name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input type="text" name="country" value={profile.personalInfo.country} onChange={handlePersonalChange}
                  placeholder="e.g. UAE" className={inputClass} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Timezone</label>
                <input type="text" name="timezone" value={profile.personalInfo.timezone} onChange={handlePersonalChange}
                  placeholder="e.g. Asia/Dubai (UTC+4)" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Preferred Contact Method</label>
                <select name="preferredContact" value={profile.personalInfo.preferredContact} onChange={handlePersonalChange}
                  className={inputClass + ' appearance-none bg-white'}>
                  <option value="">Select...</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Family Information */}
        {activeTab === 'family' && (
          <div className="space-y-5">
            {profile.familyInfo.members.length === 0 && (
              <p className="text-sm text-charcoal-400 italic">No family members added yet.</p>
            )}
            {profile.familyInfo.members.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-sage-50 border border-sage-100">
                <div>
                  <p className="text-sm font-semibold text-charcoal-800">{m.name}</p>
                  <div className="flex gap-3 text-xs text-charcoal-500 mt-1">
                    {m.birthday && <span>Birthday: {m.birthday}</span>}
                    {m.anniversary && <span>Anniversary: {m.anniversary}</span>}
                  </div>
                </div>
                <button onClick={() => removeFamilyMember(m.id)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >Remove</button>
              </div>
            ))}
            <div className="border-t border-charcoal-100 pt-5">
              <h3 className="text-sm font-semibold text-charcoal-700 mb-3">Add Family Member</h3>
              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                <input type="text" value={newFamilyMember.name} onChange={(e) => setNewFamilyMember((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Name" className={inputClass} />
                <input type="date" value={newFamilyMember.birthday} onChange={(e) => setNewFamilyMember((p) => ({ ...p, birthday: e.target.value }))}
                  className={inputClass} />
                <input type="date" value={newFamilyMember.anniversary} onChange={(e) => setNewFamilyMember((p) => ({ ...p, anniversary: e.target.value }))}
                  className={inputClass} />
              </div>
              <button onClick={addFamilyMember}
                className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all"
              >Add Member</button>
            </div>
          </div>
        )}

        {/* Subscription Vault */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-5">
            {profile.subscriptions.length === 0 && (
              <p className="text-sm text-charcoal-400 italic">No subscriptions added yet.</p>
            )}
            {profile.subscriptions.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-sage-50 border border-sage-100">
                <div>
                  <p className="text-sm font-semibold text-charcoal-800">{s.serviceName}</p>
                  <div className="flex gap-3 text-xs text-charcoal-500 mt-1">
                    <span>Renewal: {s.renewalDate}</span>
                    <span>${s.monthlyCost}/mo</span>
                    <span>Remind {s.reminderDays} days before</span>
                  </div>
                </div>
                <button onClick={() => removeSubscription(s.id)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >Remove</button>
              </div>
            ))}
            <div className="border-t border-charcoal-100 pt-5">
              <h3 className="text-sm font-semibold text-charcoal-700 mb-3">Add Subscription</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input type="text" value={newSub.serviceName} onChange={(e) => setNewSub((p) => ({ ...p, serviceName: e.target.value }))}
                  placeholder="Service Name" className={inputClass} />
                <input type="date" value={newSub.renewalDate} onChange={(e) => setNewSub((p) => ({ ...p, renewalDate: e.target.value }))}
                  className={inputClass} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input type="number" value={newSub.monthlyCost} onChange={(e) => setNewSub((p) => ({ ...p, monthlyCost: e.target.value }))}
                  placeholder="Monthly Cost ($)" className={inputClass} />
                <input type="number" value={newSub.reminderDays} onChange={(e) => setNewSub((p) => ({ ...p, reminderDays: e.target.value }))}
                  placeholder="Reminder Days Before" className={inputClass} />
              </div>
              <button onClick={addSubscription}
                className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all"
              >Add Subscription</button>
            </div>
          </div>
        )}

        {/* Bills & Cards */}
        {activeTab === 'cards' && (
          <div className="space-y-5">
            {profile.cards.length === 0 && (
              <p className="text-sm text-charcoal-400 italic">No cards added yet.</p>
            )}
            {profile.cards.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-sage-50 border border-sage-100">
                <div>
                  <p className="text-sm font-semibold text-charcoal-800">{c.nickname}</p>
                  <div className="flex gap-3 text-xs text-charcoal-500 mt-1">
                    <span>****{c.lastFour}</span>
                    <span>Due: {c.dueDate}</span>
                    <span>{c.bankName}</span>
                  </div>
                </div>
                <button onClick={() => removeCard(c.id)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >Remove</button>
              </div>
            ))}
            <div className="border-t border-charcoal-100 pt-5">
              <h3 className="text-sm font-semibold text-charcoal-700 mb-3">Add Card</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input type="text" value={newCard.nickname} onChange={(e) => setNewCard((p) => ({ ...p, nickname: e.target.value }))}
                  placeholder="Card Nickname (e.g. HDFC Regalia)" className={inputClass} />
                <input type="text" value={newCard.lastFour} onChange={(e) => setNewCard((p) => ({ ...p, lastFour: e.target.value }))}
                  placeholder="Last 4 Digits" maxLength={4} className={inputClass} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input type="date" value={newCard.dueDate} onChange={(e) => setNewCard((p) => ({ ...p, dueDate: e.target.value }))}
                  className={inputClass} />
                <input type="text" value={newCard.bankName} onChange={(e) => setNewCard((p) => ({ ...p, bankName: e.target.value }))}
                  placeholder="Bank Name" className={inputClass} />
              </div>
              <button onClick={addCard}
                className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all"
              >Add Card</button>
            </div>
          </div>
        )}

        {/* Important Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Passport</label>
                <input type="text" name="passport" value={profile.documents.passport} onChange={handleDocumentChange}
                  placeholder="Passport number or note" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Visa</label>
                <input type="text" name="visa" value={profile.documents.visa} onChange={handleDocumentChange}
                  placeholder="Visa details" className={inputClass} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Insurance</label>
                <input type="text" name="insurance" value={profile.documents.insurance} onChange={handleDocumentChange}
                  placeholder="Insurance policy info" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tax Documents</label>
                <input type="text" name="taxDocuments" value={profile.documents.taxDocuments} onChange={handleDocumentChange}
                  placeholder="Tax document reference" className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Preferred Airline</label>
                <input type="text" name="preferredAirline" value={profile.preferences.preferredAirline} onChange={handlePreferenceChange}
                  placeholder="e.g. Emirates" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Preferred Hotel</label>
                <input type="text" name="preferredHotel" value={profile.preferences.preferredHotel} onChange={handlePreferenceChange}
                  placeholder="e.g. Marriott" className={inputClass} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Preferred Currency</label>
                <select name="preferredCurrency" value={profile.preferences.preferredCurrency} onChange={handlePreferenceChange}
                  className={inputClass + ' appearance-none bg-white'}>
                  <option value="">Select...</option>
                  <option value="USD">USD</option>
                  <option value="AED">AED</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Preferred Communication Method</label>
                <select name="preferredCommMethod" value={profile.preferences.preferredCommMethod} onChange={handlePreferenceChange}
                  className={inputClass + ' appearance-none bg-white'}>
                  <option value="">Select...</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
