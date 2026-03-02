import React, { useContext } from 'react'
import { Menu, Bell, User, Settings } from 'lucide-react'
import { AuthContext } from '../../contexts/AuthContext'

export default function Header({ onMenuClick }) {
  const { user } = useContext(AuthContext)

  return (
    <header className="bg-eqms-card border-b border-eqms-border px-6 py-4 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-slate-200"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-200 transition-colors">
          <Bell size={20} />
        </button>
        
        <button className="text-slate-400 hover:text-slate-200 transition-colors">
          <Settings size={20} />
        </button>

        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-semibold">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>

        <div className="text-sm">
          <p className="font-medium text-slate-100">{user?.name || user?.email}</p>
          <p className="text-xs text-slate-500">Admin</p>
        </div>
      </div>
    </header>
  )
}
