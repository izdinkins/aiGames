import { useEffect, useState } from 'react'
import { sound } from '@/lib/sound'
import styles from './SoundToggle.module.css'

export default function SoundToggle() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(sound.isMuted())
  }, [])

  function handleClick() {
    setMuted(sound.toggleMuted())
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.toggle}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      aria-pressed={muted}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          <line x1="16" y1="9" x2="21" y2="15" />
          <line x1="21" y1="9" x2="16" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          <path d="M16.2 8.5a5 5 0 0 1 0 7" />
          <path d="M18.6 6a8.5 8.5 0 0 1 0 12" />
        </svg>
      )}
      <span className={styles.label}>{muted ? 'SOUND OFF' : 'SOUND ON'}</span>
    </button>
  )
}
