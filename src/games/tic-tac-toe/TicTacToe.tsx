import { useEffect, useRef, useState } from 'react'
import GameFrame from '@/components/GameFrame'
import { sound } from '@/lib/sound'
import { applyMove, checkWinner, createInitialBoard, type Board, type Player } from './engine'
import { getBestMove, type Difficulty } from './TicTacToeAi'
import styles from './TicTacToe.module.css'

const AI_MOVE_DELAY_MS = 500

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [difficulty, setDifficulty] = useState<Difficulty>('hard')
  const [aiThinking, setAiThinking] = useState(false)
  const isFirstRender = useRef(true)

  const result = checkWinner(board)
  const gameOver = result.winner !== null

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (gameOver) sound.start()
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
  }

  function handleDifficultyChange(next: Difficulty) {
    if (next === difficulty) return
    sound.click()
    setDifficulty(next)
    setBoard(createInitialBoard())
    setCurrentPlayer('X')
    setAiThinking(false)
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

      <button type="button" onClick={handleReset} className={styles.resetButton}>
        {gameOver ? 'PLAY AGAIN' : 'RESET'}
      </button>
    </GameFrame>
  )
}
