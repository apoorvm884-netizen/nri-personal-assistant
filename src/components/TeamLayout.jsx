import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

const navItems = [
  {
    label: 'Dashboard',
    path: '/team/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Active Requests',
    path: '/team/requests',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
]

export default function TeamLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logout } = useAdmin()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-charcoal-50/50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-charcoal-800 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center justify-between px-5 h-16 md:h-20 border-b border-charcoal-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-primary-800 font-serif font-bold text-sm">T</span>
            </div>
            <div>
              <span className="font-serif text-base font-semibold text-white">Team Portal</span>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">NRI PA</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-charcoal-700">
            <svg className="w-4 h-4 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-accent-500/10 text-accent-400' : 'text-charcoal-300 hover:bg-charcoal-700 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-charcoal-700 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-primary-800 text-xs font-bold">
              {admin?.name?.[0] || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.name || 'Team Member'}</p>
              <p className="text-xs text-charcoal-400 truncate">{admin?.role || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-charcoal-100 h-16 md:h-20 flex items-center px-4 md:px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-charcoal-50 mr-3">
            <svg className="w-5 h-5 text-charcoal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs font-medium text-charcoal-500">System Online</span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
