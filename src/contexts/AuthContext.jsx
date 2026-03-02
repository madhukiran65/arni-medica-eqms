import React, { createContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

export const AuthContext = createContext(null)

// 21 CFR Part 11 — Failed login lockout
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState(null)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await authAPI.getCurrentUser()
      setUser(data)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('session_start')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const login = async (username, password) => {
    setLoginError(null)

    // Check lockout status
    const lockoutData = JSON.parse(localStorage.getItem('login_lockout') || '{}')
    if (lockoutData.lockedUntil && Date.now() < lockoutData.lockedUntil) {
      const remainMin = Math.ceil((lockoutData.lockedUntil - Date.now()) / 60000)
      const msg = `Account locked due to too many failed attempts. Try again in ${remainMin} minute(s).`
      setLoginError(msg)
      throw new Error(msg)
    }

    try {
      const { data } = await authAPI.login(username, password)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('session_start', Date.now().toString())
      // Clear failed attempts on success
      localStorage.removeItem('login_lockout')
      await fetchUser()
      return data
    } catch (err) {
      // Track failed attempts
      const attempts = (lockoutData.attempts || 0) + 1
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_DURATION_MS
        localStorage.setItem('login_lockout', JSON.stringify({ attempts, lockedUntil }))
        const msg = `Too many failed attempts. Account locked for 15 minutes.`
        setLoginError(msg)
        throw new Error(msg)
      } else {
        localStorage.setItem('login_lockout', JSON.stringify({ attempts }))
        const remaining = MAX_FAILED_ATTEMPTS - attempts
        const msg = err.response?.data?.detail || `Invalid credentials. ${remaining} attempt(s) remaining.`
        setLoginError(msg)
        throw new Error(msg)
      }
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('session_start')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAuthenticated: !!user,
      loginError
    }}>
      {children}
    </AuthContext.Provider>
  )
}
