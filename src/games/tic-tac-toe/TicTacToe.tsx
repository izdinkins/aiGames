import { useState } from 'react'
import { Link } from 'react-router-dom'

type Cell = 'X' | 'O' | null

// Placeholder UI shell: local click state only, two human players.
// Win detection and the AI opponent get wired in once engine.ts/ai.ts exist.
export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')

  function handleCellClick(index: number) {
    if (board[index] !== null) return

    const nextBoard = [...board]
    nextBoard[index] = currentPlayer
    setBoard(nextBoard)
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
  }

  function handleReset() {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-8">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-800">Tic Tac Toe</h1>
        <p className="text-slate-500">Turn: {currentPlayer}</p>

        <div className="grid grid-cols-3 gap-2">
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleCellClick(index)}
              className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 text-3xl font-bold text-slate-800 transition hover:bg-slate-200"
            >
              {cell}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-700"
        >
          Reset
        </button>
      </div>

      <Link to="/" className="text-slate-700 underline">
        Back to games
      </Link>
    </div>
  )
}
