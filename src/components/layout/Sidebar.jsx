import React, { useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, LayoutDashboard, FileText, AlertTriangle, Zap, MessageSquare, CheckSquare, Users, Briefcase, TrendingUp, Wrench, Package, BarChart3, Settings, LogOut, ChevronDown, Shield, Target, GitBranch, BookOpen, Truck, Brain } from 'lucide-react'
import { AuthContext } from '../../contexts/AuthContext'
import { PERMISSIONS, hasPermission, hasAnyPermission } from '../../utils/rbac'

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const [expandedMenu, setExpandedMenu] = useState(null)

  // Map menu items to their RBAC permission requirements
  const MODULE_PERMISSIONS = {
    '/': null, // Dashboard always visible
    '/documents': PERMISSIONS.documents.view,
    '/capa': PERMISSIONS.capa.view,
    '/deviations': PERMISSIONS.deviations.view,
    '/change-controls': PERMISSIONS.change_controls.view,
    '/complaints': PERMISSIONS.complaints.view,
    '/training': PERMISSIONS.training.view,
    '/audits': PERMISSIONS.audits.view,
    '/suppliers': PERMISSIONS.suppliers.view,
    '/risk': PERMISSIONS.risk.view,
    '/equipment': PERMISSIONS.equipment.view,
    '/production': PERMISSIONS.production.view,
    '/analytics': null, // visible to all
    '/admin': PERMISSIONS.admin.view,
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    {
      icon: FileText,
      label: 'Document Control',
      submenu: [
        { label: 'All Documents', href: '/documents' },
        { label: 'Create Document', href: '/documents/create' },
      ]
    },
    {
      label: 'Quality Events',
      icon: AlertTriangle,
      submenu: [
        { label: 'CAPA', href: '/capa' },
        { label: 'Deviations', href: '/deviations' },
        { label: 'Change Control', href: '/change-controls' },
        { label: 'Complaints', href: '/complaints' },
      ]
    },
    { icon: Shield, label: 'Audits', href: '/audits' },
    { icon: BookOpen, label: 'Training', href: '/training' },
    { icon: Truck, label: 'Suppliers', href: '/suppliers' },
    { icon: Target, label: 'Risk & Design', href: '/risk' },
    { icon: Wrench, label: 'Equipment', href: '/equipment' },
    { icon: Package, label: 'Production', href: '/production' },
    { icon: Brain, label: 'AI Analytics', href: '/analytics' },
    { icon: Users, label: 'Administration', href: '/admin' },
  ]

  // Determine if a menu item should be shown based on RBAC permissions
  const shouldShowMenu = (item) => {
    // Items with no permission requirement are always shown
    if (item.submenu) {
      // For submenu items, show if user has permission for ANY submenu item
      return item.submenu.some(sub => {
        const permission = MODULE_PERMISSIONS[sub.href]
        return permission === null || hasPermission(user, permission)
      })
    }

    // For regular items, check their main href
    const permission = MODULE_PERMISSIONS[item.href]
    return permission === null || hasPermission(user, permission)
  }

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 lg:hidden" style={{ backgroundColor: 'var(--modal-overlay)' }} onClick={() => setIsOpen(false)} />}
      <aside
        className={`fixed lg:static left-0 top-0 h-screen w-60 flex flex-col transform transition-all duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)' }}
      >
        {/* Logo */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>ARNI MEDICA</div>
              <div className="text-[10px] text-blue-400 tracking-widest font-semibold">AI-EQMS</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {menuItems.filter(shouldShowMenu).map((item, idx) => (
            <div key={idx}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-3 py-2 my-0.5 rounded-lg text-sm transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform ${expandedMenu === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMenu === item.label && (
                    <div className="ml-7 space-y-0.5 mb-1" style={{ borderLeft: '1px solid var(--border-color)' }}>
                      {item.submenu
                        .filter(sub => {
                          // Only show submenu items the user has permission for
                          const permission = MODULE_PERMISSIONS[sub.href]
                          return permission === null || hasPermission(user, permission)
                        })
                        .map((sub, i) => (
                          <Link
                            key={i}
                            to={sub.href}
                            className={`block px-3 py-1.5 text-xs rounded-r-lg transition-colors ${isActive(sub.href) ? 'text-blue-400 bg-blue-500/10' : ''}`}
                            style={!isActive(sub.href) ? { color: 'var(--text-muted)' } : {}}
                          >
                            {sub.label}
                          </Link>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 my-0.5 rounded-lg text-sm transition-colors ${isActive(item.href) ? 'bg-blue-600 text-white font-medium' : ''}`}
                  style={!isActive(item.href) ? { color: 'var(--text-secondary)' } : {}}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              {user?.first_name?.[0] || 'M'}{user?.last_name?.[0] || 'K'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.first_name ? `${user.first_name} ${user.last_name}` : 'MK Parvathaneni'}</div>
              <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || 'admin@arnimedica.com'}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
