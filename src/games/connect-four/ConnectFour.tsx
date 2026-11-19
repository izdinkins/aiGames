import { useEffect, useState } from 'react'
import GameFrame from '@/components/GameFrame'
import WinCelebration from '@/components/WinCelebration'
import { DIFFICULTY_BASE, DifficultyPicker, HighScoreFooter, StatusLine, type Difficulty } from '@/components/AiGameUi'
import { qualifiesForHighScore } from '@/lib/highScores'
import { sound } from '@/lib/sound'
import { applyMove, checkWinner, COLS, createInitialBoard, ROWS, type Board, type Player } from './engine'
import { getBestMove } from './ConnectFourAi'
import styles from './ConnectFour.module.css'

const AI_MOVE_DELAY_MS = 450
const CELEBRATION_MS = 1600
const GAME_KEY = 'connect-four'

const HUMAN: Player = 'R'
const AI: Player = 'Y'

function computeScore(difficulty: Difficulty, movesPlayed: number): number {
  const speedBonus = Math.max(0, ROWS * COLS - movesPlayed) * 10
  return DIFFICULTY_BASE[difficulty] + speedBonus
}

export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>(HUMAN)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const [pendingScore, setPendingScore] = useState<number | null>(null)

  const result = checkWinner(board)
  const gameOver = result.winner !== null
  const aiTurn = !gameOver && currentPlayer === AI

  // Celebrate and check for a high score when the human wins.
  useEffect(() => {
    if (!gameOver) return
    sound.start()
    if (result.winner !== HUMAN) return

    const movesPlayed = board.flat().filter((cell) => cell !== null).length
    const score = computeScore(difficulty, movesPlayed)
    setCelebrationKey((k) => k + 1)
    setShowCelebration(true)
    const timeout = window.setTimeout(() => setShowCelebration(false), CELEBRATION_MS)
    if (qualifiesForHighScore(score, GAME_KEY)) setPendingScore(score)
    return () => window.clearTimeout(timeout)
  }, [gameOver])

  // AI takes its turn after a short delay.
  useEffect(() => {
    if (!aiTurn) return
    const timeout = window.setTimeout(() => {
      const col = getBestMove(board, AI, difficulty)
      if (col !== null) dropDisc(col, AI)
    }, AI_MOVE_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [board, aiTurn, difficulty])

  function dropDisc(col: number, player: Player) {
    const next = applyMove(board, col, player)
    const row = next.findIndex((r, i) => r[col] !== board[i][col])
    sound.click()
    setBoard(next)
    setLastMove([row, col])
    setCurrentPlayer(player === HUMAN ? AI : HUMAN)
  }

  function handleColumnClick(col: number) {
    if (gameOver || currentPlayer !== HUMAN || board[0][col] !== null) return
    dropDisc(col, HUMAN)
  }

  function resetGame() {
    setBoard(createInitialBoard())
    setCurrentPlayer(HUMAN)
    setLastMove(null)
    setPendingScore(null)
    setShowCelebration(false)
  }

  function handleReset() {
    sound.click()
    resetGame()
  }

  function handleDifficultyChange(next: Difficulty) {
    if (next === difficulty) return
    sound.click()
    setDifficulty(next)
    resetGame()
  }

  const winningCells = new Set(result.line?.map(([r, c]) => `${r}-${c}`) ?? [])

  const statusText = gameOver
    ? result.winner === 'draw'
      ? 'DRAW GAME'
      : result.winner === HUMAN
        ? 'YOU WIN!'
        : 'AI WINS!'
    : currentPlayer === HUMAN
      ? 'YOUR TURN'
      : 'AI THINKING...'

  return (
    <GameFrame title="CONNECT FOUR" subtitle="YOU (RED) VS THE MINIMAX AI (YELLOW)">
      <DifficultyPicker value={difficulty} onChange={handleDifficultyChange} />

      <StatusLine ai={aiTurn || result.winner === AI} pulse={gameOver}>
        {statusText}
      </StatusLine>

      <div className={styles.boardWrap}>
        {showCelebration && <WinCelebration key={celebrationKey} />}
        <div className={styles.board}>
          {Array.from({ length: COLS }).map((_, col) => {
            const disabled = gameOver || currentPlayer !== HUMAN || board[0][col] !== null
            return (
              <button
                key={col}
                type="button"
                disabled={disabled}
                onClick={() => handleColumnClick(col)}
                className={styles.column}
                aria-label={`Drop disc in column ${col + 1}`}
              >
                {board.map((row, rowIndex) => {
                  const disc = row[col]
                  const isWin = winningCells.has(`${rowIndex}-${col}`)
                  const isLast = lastMove?.[0] === rowIndex && lastMove?.[1] === col
                  return (
                    <span
                      key={rowIndex}
                      className={[
                        styles.cell,
                        disc === 'R' ? styles.cellRed : disc === 'Y' ? styles.cellYellow : '',
                        isLast && !isWin ? styles.cellLast : '',
                        isWin ? styles.cellWin : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  )
                })}
              </button>
            )
          })}
        </div>
      </div>

      <HighScoreFooter
        gameKey={GAME_KEY}
        gameOver={gameOver}
        pendingScore={pendingScore}
        onScoreSaved={() => setPendingScore(null)}
        onReset={handleReset}
      />
    </GameFrame>
  )
}
