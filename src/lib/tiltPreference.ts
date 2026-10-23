const TILT_KEY = 'aiGames:tiltEnabled'

function prefersCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

export function isTiltEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(TILT_KEY)
  if (stored !== null) return stored === '1'
  // No explicit preference yet: default off for touch devices, on for mouse/trackpad.
  return !prefersCoarsePointer()
}

export function setTiltEnabled(value: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TILT_KEY, value ? '1' : '0')
}
