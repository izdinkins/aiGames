import { useEffect, useRef, useState, type FormEvent } from 'react'
import GameFrame from '@/components/GameFrame'
import WinCelebration from '@/components/WinCelebration'
import { addHighScore, getTopScores, qualifiesForHighScore } from '@/lib/highScores'
import { sound } from '@/lib/sound'
import { applyMove, checkWinner, createInitialBoard, type Board, type Player } from './engine'
import { getBestMove, type Difficulty } from './TicTacToeAi'
import styles from './TicTacToe.module.css'

const AI_MOVE_DELAY_MS = 500
const CELEBRATION_MS = 1600
const SAVED_FLASH_MS = 1800
const GAME_KEY = 'tic-tac-toe'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const DIFFICULTY_BASE: Record<Difficulty, number> = { easy: 100, medium: 300, hard: 900 }

function computeScore(difficulty: Difficulty, movesPlayed: number): number {
  const speedBonus = Math.max(0, 9 - movesPlayed) * 20
  return DIFFICULTY_BASE[difficulty] + speedBonus
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [difficulty, setDifficulty] = useState<Difficulty>('hard')
  const [aiThinking, setAiThinking] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const [pendingScore, setPendingScore] = useState<number | null>(null)
  const [initials, setInitials] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)
  const isFirstRender = useRef(true)

  const result = checkWinner(board)
  const gameOver = result.winner !== null

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!gameOver) return

    sound.start()

    if (result.winner === 'X') {
      const movesPlayed = board.filter((cell) => cell !== null).length
      const score = computeScore(difficulty, movesPlayed)
      setCelebrationKey((k) => k + 1)
      setShowCelebration(true)
      window.setTimeout(() => setShowCelebration(false), CELEBRATION_MS)
      if (qualifiesForHighScore(score, GAME_KEY)) {
        setPendingScore(score)
      }
    }
  }, [gameOver])

  useEffect(() => {
    if (gameOver || currentPlayer !== 'O') return

    setAiThinking(true)
    const timeout = window.setTimeout(() => {
      const move = getBestMove(board, 'O', difficulty)
      if (move !== null) {
        sound.click()
        setBoard(applyMove(board, move, 'O'))
        setCurrentPlayer('X')
      }
      setAiThinking(false)
    }, AI_MOVE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [board, currentPlayer, gameOver, difficulty])

  function handleCellClick(index: number) {
    if (gameOver || board[index] !== null || currentPlayer !== 'X' || aiThinking) return

    sound.click()
    setBoard(applyMove(board, index, 'X'))
    setCurrentPlayer('O')
  }

  function handleReset() {
    sound.click()
    setBoard(createInitialBoard())
    setCurrentPlayer('X')
    setAiThinking(false)
    setPendingScore(null)
    setInitials('')
  }

  function handleDifficultyChange(next: Difficulty) {
    if (next === difficulty) return
    sound.click()
    setDifficulty(next)
    setBoard(createInitialBoard())
    setCurrentPlayer('X')
    setAiThinking(false)
    setPendingScore(null)
    setInitials('')
  }

  function handleSubmitInitials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendingScore === null) return

    const clean = initials.trim().toUpperCase().slice(0, 3) || 'YOU'
    addHighScore({ initials: clean, score: pendingScore, game: GAME_KEY, date: new Date().toISOString() })
    sound.select()
    setPendingScore(null)
    setInitials('')
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), SAVED_FLASH_MS)
  }

  const statusText = gameOver
    ? result.winner === 'draw'
      ? 'DRAW GAME'
      : result.winner === 'X'
        ? 'YOU WIN!'
        : 'AI WINS!'
    : currentPlayer === 'X'
      ? 'YOUR TURN'
      : 'AI THINKING...'

  const statusClass = [
    styles.status,
    currentPlayer === 'O' && !gameOver ? styles.statusO : '',
    result.winner === 'O' ? styles.statusO : '',
    gameOver ? styles.statusWin : '',
  ]
    .filter(Boolean)
    .join(' ')

  const topScores = gameOver ? getTopScores(5) : []

  return (
    <GameFrame title="TIC TAC TOE" subtitle="YOU (X) VS THE MINIMAX AI (O)">
      <div className={styles.difficultyRow} role="group" aria-label="Difficulty">
        {DIFFICULTIES.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => handleDifficultyChange(level)}
            className={`${styles.difficultyButton} ${difficulty === level ? styles.difficultyButtonActive : ''}`}
          >
            {level.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={statusClass}>{statusText}</div>

      <div className={styles.boardWrap}>
        {showCelebration && <WinCelebration key={celebrationKey} />}
        <div className={styles.board}>
          {board.map((cell, index) => {
            const isWinningCell = result.line?.includes(index) ?? false
            return (
              <button
                key={index}
                type="button"
                disabled={cell !== null || gameOver || currentPlayer !== 'X' || aiThinking}
                onClick={() => handleCellClick(index)}
                className={[styles.cell, cell === 'O' ? styles.cellO : '', isWinningCell ? styles.cellWin : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`Cell ${index + 1}${cell ? `, ${cell}` : ', empty'}`}
              >
                {cell}
              </button>
            )
          })}
        </div>
      </div>

      {pendingScore !== null ? (
        <form onSubmit={handleSubmitInitials} className={styles.initialsForm}>
          <div className={styles.initialsPrompt}>NEW HIGH SCORE! {pendingScore}</div>
          <div className={styles.initialsRow}>
            <input
              id="tic-tac-toe-initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              placeholder="AAA"
              aria-label="Enter your initials"
              className={styles.initialsInput}
              autoFocus
            />
            <button type="submit" className={styles.resetButton}>
              SAVE
            </button>
          </div>
        </form>
      ) : (
        <>
          {savedFlash && <div className={styles.savedFlash}>SAVED!</div>}
          <button type="button" onClick={handleReset} className={styles.resetButton}>
            {gameOver ? 'PLAY AGAIN' : 'RESET'}
          </button>
        </>
      )}

      {gameOver && (
        <div className={styles.leaderboard}>
          <div className={`${styles.leaderboardHeading} ${styles.pressStart}`}>TOP SCORES</div>
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
    </GameFrame>
  )
}
