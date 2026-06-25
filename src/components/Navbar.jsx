import { useState, useEffect, useTransition } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const [, startTransition] = useTransition()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    startTransition(() => setOpen(false))
  }, [location.pathname])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold text-sm">N</span>
            </div>
            <span className="font-serif text-xl font-semibold text-charcoal-800">
              NRI<span className="text-primary-500">PA</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 hover:text-primary-500 ${
                  location.pathname === link.path
                    ? 'text-primary-500'
                    : 'text-charcoal-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="text-sm font-medium text-charcoal-600 hover:text-primary-500 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/consultation"
              className="bg-primary-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide hover:bg-primary-600 transition-all"
            >
              Book a Consultation Call
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-charcoal-50 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-charcoal-800 transition-all duration-300 ${open ? 'rotate-45 translate-y-1' : ''}`} />
              <span className={`block h-0.5 bg-charcoal-800 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-charcoal-800 transition-all duration-300 ${open ? '-rotate-45 -translate-y-1' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 overflow-hidden ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/95 backdrop-blur-md border-t border-charcoal-100 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-primary-500 bg-primary-50'
                  : 'text-charcoal-600 hover:bg-charcoal-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="block px-4 py-3 rounded-lg text-sm font-medium text-charcoal-600 hover:bg-charcoal-50"
          >
            Sign In
          </Link>
          <Link
            to="/consultation"
            className="block text-center bg-primary-500 text-white px-4 py-3 rounded-lg text-sm font-semibold mt-3 hover:bg-primary-600 transition-all"
          >
            Book a Consultation Call
          </Link>
        </div>
      </div>
    </nav>
  )
}
