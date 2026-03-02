import { useState, useEffect } from 'react'

/**
 * Hook to detect media query matches
 * @param {string} query - Media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} True if media query matches
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * Hook to detect mobile devices (max-width: 768px)
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')

/**
 * Hook to detect tablet devices (max-width: 1024px)
 */
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)')

/**
 * Hook to detect small screens (max-width: 640px)
 */
export const useIsSmall = () => useMediaQuery('(max-width: 640px)')

/**
 * Hook to detect large screens (min-width: 1280px)
 */
export const useIsLarge = () => useMediaQuery('(min-width: 1280px)')
