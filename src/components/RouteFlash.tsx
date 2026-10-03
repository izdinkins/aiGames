import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './RouteFlash.module.css'

export default function RouteFlash() {
  const location = useLocation()
  const [flashing, setFlashing] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setFlashing(true)
    const timeout = window.setTimeout(() => setFlashing(false), 420)
    return () => window.clearTimeout(timeout)
  }, [location.pathname])

  if (!flashing) return null

  return <div className={styles.flash} aria-hidden="true" />
}
