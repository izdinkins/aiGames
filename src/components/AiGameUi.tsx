import { useState, type FormEvent, type ReactNode } from 'react'
import { addHighScore, getTopScores } from '@/lib/highScores'
import { sound } from '@/lib/sound'
import styles from './AiGameUi.module.css'

export type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const SAVED_FLASH_MS = 1800

export const DIFFICULTY_BASE: Record<Difficulty, number> = { easy: 100, medium: 300, hard: 900 }

export function DifficultyPicker({
  value,
  onChange,
}: {
  value: Difficulty
  onChange: (next: Difficulty) => void
}) {
  return (
    <div className={styles.difficultyRow} role="group" aria-label="Difficulty">
      {DIFFICULTIES.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`${styles.difficultyButton} ${value === level ? styles.difficultyButtonActive : ''}`}
          aria-pressed={value === level}
        >
          {level.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function StatusLine({
  children,
  ai = false,
  pulse = false,
}: {
  children: ReactNode
  ai?: boolean
  pulse?: boolean
}) {
  const className = [styles.status, ai ? styles.statusAi : '', pulse ? styles.statusPulse : '']
    .filter(Boolean)
    .join(' ')
  return (
    <div className={className} role="status">
      {children}
    </div>
  )
}

/**
 * Footer shared by the AI games: the initials form when a new high score is pending,
 * otherwise the reset button, plus this game's leaderboard once the game is over.
 */
export function HighScoreFooter({
  gameKey,
  gameOver,
  pendingScore,
  onScoreSaved,
  onReset,
}: {
  gameKey: string
  gameOver: boolean
  pendingScore: number | null
  onScoreSaved: () => void
  onReset: () => void
}) {
  const [initials, setInitials] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendingScore === null) return

    const clean = initials.trim().toUpperCase().slice(0, 3) || 'YOU'
    addHighScore({ initials: clean, score: pendingScore, game: gameKey, date: new Date().toISOString() })
    sound.select()
    setInitials('')
    onScoreSaved()
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), SAVED_FLASH_MS)
  }

  const topScores = gameOver ? getTopScores(5, gameKey) : []

  return (
    <>
      {pendingScore !== null ? (
        <form onSubmit={handleSubmit} className={styles.initialsForm}>
          <div className={styles.initialsPrompt}>NEW HIGH SCORE! {pendingScore}</div>
          <div className={styles.initialsRow}>
            <input
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              placeholder="AAA"
              aria-label="Enter your initials"
              className={styles.initialsInput}
              autoFocus
            />
            <button type="submit" className={styles.button}>
              SAVE
            </button>
          </div>
        </form>
      ) : (
        <>
          {savedFlash && <div className={styles.savedFlash}>SAVED!</div>}
          <button
            type="button"
            onClick={() => {
              setInitials('')
              onReset()
            }}
            className={styles.button}
          >
            {gameOver ? 'PLAY AGAIN' : 'RESET'}
          </button>
        </>
      )}

      {gameOver && (
        <div className={styles.leaderboard}>
          <div className={styles.leaderboardHeading}>TOP SCORES</div>
          {topScores.length > 0 ? (
            topScores.map((entry, i) => (
              <div key={`${entry.initials}-${entry.date}`} className={styles.leaderboardRow}>
                <span>
                  {i + 1}. {entry.initials}
                </span>
                <span>{String(entry.score).padStart(7, '0')}</span>
              </div>
            ))
          ) : (
            <p className={styles.leaderboardEmpty}>NO SCORES YET</p>
          )}
        </div>
      )}
    </>
  )
}
