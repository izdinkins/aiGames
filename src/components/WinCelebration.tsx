import { useState, type CSSProperties } from 'react'
import styles from './WinCelebration.module.css'

const COLORS = ['#63ffe4', '#ffb648', '#ff5f76', '#f0c33f']
const PARTICLE_COUNT = 28

interface Particle {
  id: number
  angle: number
  distance: number
  color: string
  delay: number
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (i / PARTICLE_COUNT) * 360 + (Math.random() * 20 - 10),
    distance: 60 + Math.random() * 70,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 150,
  }))
}

export default function WinCelebration() {
  const [particles] = useState(generateParticles)

  return (
    <div className={styles.burst} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={
            {
              '--angle': `${p.angle}deg`,
              '--distance': `${p.distance}px`,
              '--delay': `${p.delay}ms`,
              background: p.color,
              color: p.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
