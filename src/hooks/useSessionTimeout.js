/**
 * useSessionTimeout — 21 CFR Part 11 Compliance
 *
 * Implements idle timeout and absolute session timeout:
 * - Idle timeout: auto-logout after 15 min of inactivity (configurable)
 * - Absolute timeout: force re-auth after 8 hours regardless of activity
 * - Warning shown 2 min before idle timeout
 * - Events tracked: mouse, keyboard, scroll, touch
 *
 * Per FDA 21 CFR Part 11 §11.10(d): Controls for systems to limit access
 * to authorized individuals, including automatic timeout/logout.
 */
import { useEffect, useRef, useCallback, useState } from 'react'

const IDLE_TIMEOUT_MS = 15 * 60 * 1000       // 15 minutes
const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000 // 8 hours
const WARNING_BEFORE_MS = 2 * 60 * 1000       // Show warning 2 min before idle timeout

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

export default function useSessionTimeout(logout, isAuthenticated) {
  const idleTimerRef = useRef(null)
  const warningTimerRef = useRef(null)
  const absoluteTimerRef = useRef(null)
  const [showWarning, setShowWarning] = useState(false)

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current)
    setShowWarning(false)
  }, [])

  const handleLogout = useCallback(() => {
    clearAllTimers()
    localStorage.removeItem('session_start')
    logout()
  }, [clearAllTimers, logout])

  const resetIdleTimer = useCallback(() => {
    if (!isAuthenticated) return
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    setShowWarning(false)

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS)

    // Set logout timer
    idleTimerRef.current = setTimeout(() => {
      console.warn('[Session] Idle timeout — auto-logout (21 CFR Part 11)')
      handleLogout()
    }, IDLE_TIMEOUT_MS)
  }, [isAuthenticated, handleLogout])

  // Extend session (dismiss warning)
  const extendSession = useCallback(() => {
    resetIdleTimer()
  }, [resetIdleTimer])

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers()
      return
    }

    // Set absolute session timeout
    const sessionStart = localStorage.getItem('session_start')
    if (!sessionStart) {
      localStorage.setItem('session_start', Date.now().toString())
    } else {
      const elapsed = Date.now() - parseInt(sessionStart, 10)
      if (elapsed >= ABSOLUTE_TIMEOUT_MS) {
        console.warn('[Session] Absolute timeout exceeded — forcing re-auth')
        handleLogout()
        return
      }
      const remaining = ABSOLUTE_TIMEOUT_MS - elapsed
      absoluteTimerRef.current = setTimeout(() => {
        console.warn('[Session] Absolute session timeout — auto-logout (21 CFR Part 11)')
        handleLogout()
      }, remaining)
    }

    // Start idle timer
    resetIdleTimer()

    // Attach activity listeners
    const handleActivity = () => resetIdleTimer()
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      clearAllTimers()
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [isAuthenticated, resetIdleTimer, clearAllTimers, handleLogout])

  return { showWarning, extendSession, timeoutMinutes: IDLE_TIMEOUT_MS / 60000 }
}
