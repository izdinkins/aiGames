import { useEffect, useRef, useState, type CSSProperties } from 'react'

const REST_TRANSFORM = 'perspective(1200px) rotateX(0deg) rotateY(0deg)'

export function useTilt(maxDegrees = 6, enabled = true) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({ transform: REST_TRANSFORM })

  useEffect(() => {
    if (!enabled) {
      setStyle({ transform: REST_TRANSFORM })
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function handleMove(event: MouseEvent) {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      const clampedX = Math.max(-1, Math.min(1, dx))
      const clampedY = Math.max(-1, Math.min(1, dy))
      setStyle({
        transform: `perspective(1200px) rotateX(${(-clampedY * maxDegrees).toFixed(2)}deg) rotateY(${(clampedX * maxDegrees).toFixed(2)}deg)`,
      })
    }

    function handleLeave() {
      setStyle({ transform: REST_TRANSFORM })
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [maxDegrees, enabled])

  return { ref, style }
}
