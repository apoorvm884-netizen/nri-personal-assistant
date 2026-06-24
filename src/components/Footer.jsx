import { Link } from 'react-router-dom'

const footerLinks = {
  services: [
    { label: 'Virtual Assistance', path: '/services' },
    { label: 'Email Management', path: '/services' },
    { label: 'Calendar Management', path: '/services' },
    { label: 'Subscription Tracking', path: '/services' },
    { label: 'Task Management', path: '/services' },
  ],
  company: [
    { label: 'About Us', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/#faq' },
  ],
  portal: [
    { label: 'Client Portal', path: '/portal/login' },
    { label: 'Admin Panel', path: '/admin/login' },
    { label: 'Submit Request', path: '/portal/submit' },
    { label: 'Dashboard', path: '/portal/dashboard' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/contact' },
    { label: 'Terms of Service', path: '/contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-charcoal-800 text-white">
      <div className="max-w-7xl mx-auto section-padding py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">N</span>
              </div>
              <span className="font-serif text-xl font-semibold">
                NRI<span className="text-primary-400">PA</span>
              </span>
            </Link>
            <p className="text-charcoal-300 text-sm leading-relaxed mb-6">
              Premium personal assistance for busy NRIs. We handle the details so you can focus on what matters.
            </p>
            <div className="flex gap-3">
              {['T', 'L', 'I', 'F'].map((letter, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border border-charcoal-500 flex items-center justify-center text-xs text-charcoal-300 hover:border-primary-400 hover:text-primary-400 transition-colors cursor-pointer"
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 text-primary-400">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm text-charcoal-300 hover:text-white transition-colors duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 text-primary-400">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm text-charcoal-300 hover:text-white transition-colors duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 text-primary-400">Portal</h4>
            <ul className="space-y-3">
              {footerLinks.portal.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm text-charcoal-300 hover:text-white transition-colors duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 text-primary-400">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm text-charcoal-300 hover:text-white transition-colors duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-charcoal-400 text-xs">&copy; {new Date().getFullYear()} NRI Personal Assistant. All rights reserved.</p>
          <p className="text-charcoal-400 text-xs">Designed with care for the global Indian community.</p>
        </div>
      </div>
    </footer>
  )
}
