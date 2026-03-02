import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from '../common/MobileNav'
import { useIsMobile } from '../../hooks/useMediaQuery'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen text-theme-primary" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {!isMobile && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  )
}
