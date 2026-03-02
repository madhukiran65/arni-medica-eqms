import { useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, FileText, AlertTriangle, BookOpen, Settings, Brain } from 'lucide-react'

/**
 * Mobile bottom navigation bar
 * Only visible on screens smaller than 768px (md breakpoint)
 */
export default function MobileNav() {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
    { path: '/documents', icon: FileText, label: 'Docs', id: 'nav-docs' },
    { path: '/capa', icon: AlertTriangle, label: 'CAPA', id: 'nav-capa' },
    { path: '/training', icon: BookOpen, label: 'Training', id: 'nav-training' },
    { path: '/analytics', icon: Brain, label: 'Analytics', id: 'nav-analytics' },
    { path: '/admin', icon: Settings, label: 'Admin', id: 'nav-admin' },
  ]

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-eqms-card border-t border-eqms-border flex justify-around items-center h-16 z-40 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.path)
        return (
          <Link
            key={item.path}
            to={item.path}
            id={item.id}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 transition-colors ${
              active ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-0.5 truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
