import { ROLES, DEFAULT_PERMISSIONS } from '../../config/appConfig'

export default function UserRoles() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal-800">User Access Management</h1>
        <p className="text-charcoal-400 text-sm mt-1">Manage roles and permissions (future feature).</p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 p-6 md:p-8">
        <p className="text-sm text-charcoal-400 mb-6">
          This feature is coming soon. Role-based access control will allow Owners to manage permissions for Family Members, Assistants, and Viewers.
        </p>

        <div className="space-y-4">
          {ROLES.map((role) => {
            const perms = DEFAULT_PERMISSIONS[role] || {}
            return (
              <div key={role} className="p-5 rounded-xl bg-sage-50 border border-sage-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-charcoal-800">{role}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    role === 'Owner' ? 'bg-primary-100 text-primary-700' : 'bg-charcoal-100 text-charcoal-500'
                  }`}>
                    {role === 'Owner' ? 'Full Access' : 'Limited'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(perms).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${val ? 'bg-green-500' : 'bg-charcoal-200'}`} />
                      <span className="text-charcoal-500">{key.replace(/can/g, '').replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-amber-700">Role management UI will be available in a future update. For now, roles are defined in the data layer.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
