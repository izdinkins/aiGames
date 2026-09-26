import { useState } from 'react'
import GameFrame from '@/components/GameFrame'
import styles from './ConnectFour.module.css'

type Disc = 'red' | 'yellow' | null

const ROWS = 6
const COLS = 7

function emptyGrid(): Disc[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export default function ConnectFour() {
  const [grid, setGrid] = useState<Disc[][]>(emptyGrid)
  const [current, setCurrent] = useState<'red' | 'yellow'>('red')

  function dropDisc(col: number) {
    const nextGrid = grid.map((row) => [...row])
    for (let row = ROWS - 1; row >= 0; row--) {
      if (nextGrid[row][col] === null) {
        nextGrid[row][col] = current
        setGrid(nextGrid)
        setCurrent(current === 'red' ? 'yellow' : 'red')
        return
      }
    }
  }

  function handleClear() {
    setGrid(emptyGrid())
    setCurrent('red')
  }

  return (
    <GameFrame title="CONNECT FOUR" subtitle="PLAYABLE PREVIEW — AI OPPONENT COMING SOON">
      <div className={styles.board}>
        {Array.from({ length: COLS }).map((_, col) => {
          const isFull = grid[0][col] !== null
          return (
            <button
              key={col}
              type="button"
              disabled={isFull}
              onClick={() => dropDisc(col)}
              className={styles.column}
              aria-label={`Drop disc in column ${col + 1}`}
            >
              {grid.map((row, rowIndex) => {
                const disc = row[col]
                return (
                  <span
                    key={rowIndex}
                    className={[styles.cell, disc === 'red' ? styles.cellRed : disc === 'yellow' ? styles.cellYellow : '']
                      .filter(Boolean)
                      .join(' ')}
                  />
                )
              })}
            </button>
          )
        })}
      </div>

      <div className={styles.controls}>
        <span className={styles.turnLabel}>
          NEXT
          <span
            className={styles.turnDot}
            style={{ background: current === 'red' ? '#e0474f' : '#f0c33f' }}
            aria-hidden="true"
          />
        </span>
        <button type="button" onClick={handleClear} className={styles.clearButton}>
          CLEAR BOARD
        </button>
      </div>
    </GameFrame>
  )
}
