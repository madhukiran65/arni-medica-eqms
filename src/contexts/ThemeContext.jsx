import React, { createContext, useState, useEffect, useCallback } from 'react'

export const ThemeContext = createContext()

const THEME_KEY = 'arni_eqms_theme'

// Light theme colors
const lightTheme = {
  '--bg-primary': '#F8FAFC',
  '--bg-secondary': '#FFFFFF',
  '--bg-sidebar': '#FFFFFF',
  '--bg-input': '#F1F5F9',
  '--bg-card': '#FFFFFF',
  '--border-color': '#E2E8F0',
  '--text-primary': '#0F172A',
  '--text-secondary': '#475569',
  '--text-muted': '#94A3B8',
  '--text-heading': '#1E293B',
  '--scrollbar-thumb': '#CBD5E1',
  '--table-header-bg': '#F1F5F9',
  '--hover-bg': '#F1F5F9',
  '--modal-overlay': 'rgba(0, 0, 0, 0.3)',
}

// Dark theme colors (existing Arni Medica dark theme)
const darkTheme = {
  '--bg-primary': '#0B0F1A',
  '--bg-secondary': '#141B2D',
  '--bg-sidebar': '#0F172A',
  '--bg-input': '#1A2235',
  '--bg-card': '#141B2D',
  '--border-color': '#1F2A40',
  '--text-primary': '#F1F5F9',
  '--text-secondary': '#94A3B8',
  '--text-muted': '#64748B',
  '--text-heading': '#F8FAFC',
  '--scrollbar-thumb': '#334155',
  '--table-header-bg': 'rgba(30, 41, 59, 0.5)',
  '--hover-bg': 'rgba(30, 41, 59, 0.5)',
  '--modal-overlay': 'rgba(0, 0, 0, 0.6)',
}

function applyTheme(isDark) {
  const theme = isDark ? darkTheme : lightTheme
  const root = document.documentElement

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY)
    return stored ? stored === 'dark' : true // default dark
  })

  useEffect(() => {
    applyTheme(isDark)
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev)
  }, [])

  const setTheme = useCallback((mode) => {
    setIsDark(mode === 'dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
