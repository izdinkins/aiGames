import { useState } from 'react'
import GameFrame from '@/components/GameFrame'
import styles from './TicTacToe.module.css'

type Cell = 'X' | 'O' | null
type Player = 'X' | 'O'

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function getWinner(board: Cell[]): { player: Player; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a] as Player, line }
    }
  }
  return null
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')

  const result = getWinner(board)
  const isDraw = !result && board.every((cell) => cell !== null)
  const gameOver = result !== null || isDraw

  function handleCellClick(index: number) {
    if (board[index] !== null || gameOver) return

    const nextBoard = [...board]
    nextBoard[index] = currentPlayer
    setBoard(nextBoard)
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
  }

  function handleReset() {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
  }

  const statusText = result ? `${result.player} WINS!` : isDraw ? 'DRAW GAME' : `TURN: ${currentPlayer}`
  const statusClass = [
    styles.status,
    currentPlayer === 'O' && !result ? styles.statusO : '',
    result?.player === 'O' ? styles.statusO : '',
    gameOver ? styles.statusWin : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <GameFrame title="TIC TAC TOE" subtitle="TWO PLAYER — AI OPPONENT COMING SOON">
      <div className={statusClass}>{statusText}</div>

      <div className={styles.board}>
        {board.map((cell, index) => {
          const isWinningCell = result?.line.includes(index) ?? false
          return (
            <button
              key={index}
              type="button"
              disabled={cell !== null || gameOver}
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
