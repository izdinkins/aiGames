import { useState } from 'react'
import GameFrame from '@/components/GameFrame'
import styles from './DotsAndBoxes.module.css'

const SIZE = 4 // dots per side
const N = SIZE - 1 // boxes per side

function emptyH(): boolean[][] {
  return Array.from({ length: SIZE }, () => Array(N).fill(false))
}

function emptyV(): boolean[][] {
  return Array.from({ length: N }, () => Array(SIZE).fill(false))
}

export default function DotsAndBoxes() {
  const [hEdges, setHEdges] = useState<boolean[][]>(emptyH)
  const [vEdges, setVEdges] = useState<boolean[][]>(emptyV)

  function toggleH(row: number, col: number) {
    setHEdges((prev) => prev.map((r, ri) => (ri === row ? r.map((v, ci) => (ci === col ? !v : v)) : r)))
  }

  function toggleV(row: number, col: number) {
    setVEdges((prev) => prev.map((r, ri) => (ri === row ? r.map((v, ci) => (ci === col ? !v : v)) : r)))
  }

  function isBoxFilled(row: number, col: number) {
    return hEdges[row][col] && hEdges[row + 1][col] && vEdges[row][col] && vEdges[row][col + 1]
  }

  function handleClear() {
    setHEdges(emptyH())
    setVEdges(emptyV())
  }

  const cells = []
  for (let gr = 0; gr < 2 * SIZE - 1; gr++) {
    for (let gc = 0; gc < 2 * SIZE - 1; gc++) {
      const key = `${gr}-${gc}`
      if (gr % 2 === 0 && gc % 2 === 0) {
        cells.push(<div key={key} className={styles.dot} aria-hidden="true" />)
      } else if (gr % 2 === 0 && gc % 2 === 1) {
        const row = gr / 2
        const col = (gc - 1) / 2
        const drawn = hEdges[row][col]
        cells.push(
          <button
            key={key}
            type="button"
            className={styles.edgeH}
            onClick={() => toggleH(row, col)}
            aria-label={`Horizontal edge row ${row + 1}, ${col + 1}`}
            aria-pressed={drawn}
          >
            <span className={`${styles.edgeBar} ${drawn ? styles.edgeBarDrawn : ''}`} />
          </button>,
        )
      } else if (gr % 2 === 1 && gc % 2 === 0) {
        const row = (gr - 1) / 2
        const col = gc / 2
        const drawn = vEdges[row][col]
        cells.push(
          <button
            key={key}
            type="button"
            className={styles.edgeV}
            onClick={() => toggleV(row, col)}
            aria-label={`Vertical edge row ${row + 1}, ${col + 1}`}
            aria-pressed={drawn}
          >
            <span className={`${styles.edgeBar} ${drawn ? styles.edgeBarDrawn : ''}`} />
          </button>,
        )
      } else {
        const row = (gr - 1) / 2
        const col = (gc - 1) / 2
        const filled = isBoxFilled(row, col)
        cells.push(<div key={key} className={`${styles.box} ${filled ? styles.boxFilled : ''}`} aria-hidden="true" />)
      }
    }
  }

  return (
    <GameFrame title="DOTS & BOXES" subtitle="PLAYABLE PREVIEW — AI OPPONENT COMING SOON">
      <div className={styles.grid}>{cells}</div>

      <div className={styles.controls}>
        <span className={styles.hint}>CLICK AN EDGE TO DRAW IT</span>
        <button type="button" onClick={handleClear} className={styles.clearButton}>
          CLEAR BOARD
        </button>
      </div>
    </GameFrame>
  )
}
