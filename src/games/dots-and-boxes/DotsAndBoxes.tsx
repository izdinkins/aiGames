import { useEffect, useState } from 'react'
import GameFrame from '@/components/GameFrame'
import WinCelebration from '@/components/WinCelebration'
import { DIFFICULTY_BASE, DifficultyPicker, HighScoreFooter, StatusLine, type Difficulty } from '@/components/AiGameUi'
import { qualifiesForHighScore } from '@/lib/highScores'
import { sound } from '@/lib/sound'
import {
  applyMoveWithDetails,
  checkWinner,
  createInitialBoard,
  getPlayerScore,
  isEdgeHorizontal,
  type Board,
  type Move,
  type Player,
} from './engine'
import { getBestMove } from './DotsAndBoxesAi'
import styles from './DotsAndBoxes.module.css'

const AI_MOVE_DELAY_MS = 550
const CELEBRATION_MS = 1600
const GAME_KEY = 'dots-and-boxes'
const BOXES_PER_SIDE = 3

const HUMAN: Player = 'player1'
const AI: Player = 'player2'

function edgeKey(move: Move): string {
  return `${isEdgeHorizontal(move.type) ? 'h' : 'v'}-${move.row}-${move.col}`
}

function newBoard(): Board {
  return createInitialBoard(BOXES_PER_SIDE, BOXES_PER_SIDE, HUMAN)
}

function computeScore(difficulty: Difficulty, margin: number): number {
  return DIFFICULTY_BASE[difficulty] + margin * 50
}

export default function DotsAndBoxes() {
  const [board, setBoard] = useState<Board>(newBoard)
  const [edgeOwners, setEdgeOwners] = useState<Record<string, Player>>({})
  const [lastEdge, setLastEdge] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const [pendingScore, setPendingScore] = useState<number | null>(null)

  const result = checkWinner(board)
  const gameOver = result.winner !== null
  const aiTurn = !gameOver && board.currentPlayer === AI
  const humanScore = getPlayerScore(board, HUMAN)
  const aiScore = getPlayerScore(board, AI)

  // Celebrate and check for a high score when the human wins.
  useEffect(() => {
    if (!gameOver) return
    sound.start()
    if (result.winner !== HUMAN) return

    const score = computeScore(difficulty, humanScore - aiScore)
    setCelebrationKey((k) => k + 1)
    setShowCelebration(true)
    const timeout = window.setTimeout(() => setShowCelebration(false), CELEBRATION_MS)
    if (qualifiesForHighScore(score, GAME_KEY)) setPendingScore(score)
    return () => window.clearTimeout(timeout)
  }, [gameOver])

  // AI moves after a short delay. Completing a box keeps the turn, so this re-runs until it's the human's go.
  useEffect(() => {
    if (!aiTurn) return
    const timeout = window.setTimeout(() => {
      const move = getBestMove(board, AI, difficulty)
      if (move) playMove(move, AI)
    }, AI_MOVE_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [board, aiTurn, difficulty])

  function playMove(move: Move, player: Player) {
    const { board: next, extraTurn } = applyMoveWithDetails(board, move, player)
    const key = edgeKey(move)
    sound[extraTurn ? 'select' : 'click']()
    setBoard(next)
    setEdgeOwners((owners) => ({ ...owners, [key]: player }))
    setLastEdge(key)
  }

  function handleEdgeClick(move: Move) {
    if (gameOver || board.currentPlayer !== HUMAN || edgeOwners[edgeKey(move)]) return
    playMove(move, HUMAN)
  }

  function resetGame() {
    setBoard(newBoard())
    setEdgeOwners({})
    setLastEdge(null)
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

  function renderEdge(move: Move, key: string) {
    const id = edgeKey(move)
    const owner = edgeOwners[id]
    const horizontal = isEdgeHorizontal(move.type)
    const barClass = [
      styles.edgeBar,
      owner === HUMAN ? styles.edgeBarDrawn : '',
      owner === AI ? styles.edgeBarAi : '',
      id === lastEdge ? styles.edgeBarLast : '',
    ]
      .filter(Boolean)
      .join(' ')
    return (
      <button
        key={key}
        type="button"
        className={horizontal ? styles.edgeH : styles.edgeV}
        onClick={() => handleEdgeClick(move)}
        disabled={Boolean(owner) || gameOver || board.currentPlayer !== HUMAN}
        aria-label={`${horizontal ? 'Horizontal' : 'Vertical'} edge row ${move.row + 1}, ${move.col + 1}`}
        aria-pressed={Boolean(owner)}
      >
        <span className={barClass} />
      </button>
    )
  }

  const size = BOXES_PER_SIDE + 1
  const cells = []
  for (let gr = 0; gr < 2 * size - 1; gr++) {
    for (let gc = 0; gc < 2 * size - 1; gc++) {
      const key = `${gr}-${gc}`
      if (gr % 2 === 0 && gc % 2 === 0) {
        cells.push(<div key={key} className={styles.dot} aria-hidden="true" />)
      } else if (gr % 2 === 0) {
        cells.push(renderEdge({ type: 'horizontal', row: gr / 2, col: (gc - 1) / 2 }, key))
      } else if (gc % 2 === 0) {
        cells.push(renderEdge({ type: 'vertical', row: (gr - 1) / 2, col: gc / 2 }, key))
      } else {
        const owner = board.boxes[(gr - 1) / 2][(gc - 1) / 2]
        const boxClass = [styles.box, owner === HUMAN ? styles.boxFilled : '', owner === AI ? styles.boxAi : '']
          .filter(Boolean)
          .join(' ')
        cells.push(
          <div key={key} className={boxClass} aria-hidden="true">
            {owner === HUMAN ? 'P' : owner === AI ? 'AI' : ''}
          </div>,
        )
      }
    }
  }

  const statusText = gameOver
    ? result.winner === 'draw'
      ? 'DRAW GAME'
      : result.winner === HUMAN
        ? 'YOU WIN!'
        : 'AI WINS!'
    : aiTurn
      ? 'AI THINKING...'
      : 'YOUR TURN'

  return (
    <GameFrame title="DOTS & BOXES" subtitle="YOU (CYAN) VS THE MINIMAX AI (ORANGE)">
      <DifficultyPicker value={difficulty} onChange={handleDifficultyChange} />

      <StatusLine ai={aiTurn || result.winner === AI} pulse={gameOver}>
        {statusText}
      </StatusLine>

      <div className={styles.scoreRow}>
        <span className={styles.scoreYou}>YOU {humanScore}</span>
        <span className={styles.scoreDivider}>—</span>
        <span className={styles.scoreAi}>AI {aiScore}</span>
      </div>

      <div className={styles.boardWrap}>
        {showCelebration && <WinCelebration key={celebrationKey} />}
        <div className={styles.grid}>{cells}</div>
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
