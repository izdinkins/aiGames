import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { RetroGrid } from '@/components/ui/retro-grid'
import styles from './Home.module.css'
import { ConnectFourIcon, DotsAndBoxesIcon, TicTacToeIcon } from './home-icons'

type ButtonColor = 'red' | 'yellow' | 'blue'

interface GameEntry {
  key: string
  name: string
  path: string
  btn: ButtonColor
  Icon: () => ReactElement
}

const games: GameEntry[] = [
  { key: 'tic-tac-toe', name: 'Tic Tac Toe', path: '/tic-tac-toe', btn: 'red', Icon: TicTacToeIcon },
  { key: 'connect-four', name: 'Connect Four', path: '/connect-four', btn: 'yellow', Icon: ConnectFourIcon },
  { key: 'dots-and-boxes', name: 'Dots & Boxes', path: '/dots-and-boxes', btn: 'blue', Icon: DotsAndBoxesIcon },
]

const BUTTON_CLASS: Record<ButtonColor, string> = {
  red: styles.arcadeBtnRed,
  yellow: styles.arcadeBtnYellow,
  blue: styles.arcadeBtnBlue,
}

export default function Home() {
  const navigate = useNavigate()
  const [credits, setCredits] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [warn, setWarn] = useState(false)
  const [coinPulse, setCoinPulse] = useState(0)
  const warnTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (warnTimeoutRef.current !== null) window.clearTimeout(warnTimeoutRef.current)
    }
  }, [])

  function handleSelect(game: GameEntry) {
    if (selectedKey === game.key) {
      navigate(game.path)
      return
    }

    if (credits < 1) {
      setWarn(true)
      warnTimeoutRef.current = window.setTimeout(() => setWarn(false), 1400)
      return
    }

    setCredits((c) => c - 1)
    setSelectedKey(game.key)
  }

  function handleInsertCoin() {
    setCredits((c) => c + 1)
    setCoinPulse((p) => p + 1)
  }

  const heading = warn ? 'INSERT COIN TO PLAY' : selectedKey ? 'PRESS START' : 'SELECT YOUR GAME'

  return (
    <div className="dark relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#171019,#0a070b_65%)] px-4 py-10">
      <div className={styles.cabinet}>
        <div className={styles.marquee}>
          <div className={styles.bulbs} aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={styles.bulb} />
            ))}
          </div>
          <h1 className={`${styles.marqueeTitle} ${styles.pressStart}`}>AI ARCADE</h1>
          <p className={styles.marqueeSubtitle}>three games &middot; one opponent that never sleeps</p>
        </div>

        <div className={styles.bezel}>
          <span className={`${styles.screw} ${styles.screwTl}`} />
          <span className={`${styles.screw} ${styles.screwTr}`} />
          <span className={`${styles.screw} ${styles.screwBl}`} />
          <span className={`${styles.screw} ${styles.screwBr}`} />

          <div className={styles.screen}>
            <RetroGrid
              className="absolute inset-0"
              angle={60}
              cellSize={36}
              opacity={0.9}
              lightLineColor="#63ffe4"
              darkLineColor="#63ffe4"
            />
            <div className={styles.screenVignette} aria-hidden="true" />
            <div className={styles.scanlines} aria-hidden="true" />

            <div className={styles.screenContent}>
              <div className={`${styles.screenHeading} ${styles.pressStart} ${warn ? styles.screenHeadingWarn : ''}`}>
                {heading}
              </div>

              <div className={styles.games}>
                {games.map((game) => {
                  const isSelected = selectedKey === game.key
                  return (
                    <button
                      key={game.key}
                      type="button"
                      onClick={() => handleSelect(game)}
                      className={`${styles.gameTile} ${isSelected ? styles.gameTileSelected : ''}`}
                    >
                      <game.Icon />
                      <span className={`${styles.tileName} ${styles.pressStart}`}>{game.name}</span>
                      <span className={styles.tileTag}>{isSelected ? 'PRESS START' : ' '}</span>
                    </button>
                  )
                })}
              </div>

              <div className={styles.statusRow}>
                <span>CREDITS {String(credits).padStart(2, '0')}</span>
                <span>OPPONENT: MINIMAX AI</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.stick} aria-hidden="true">
            <div className={styles.stickBall} />
            <div className={styles.stickShaft} />
            <div className={styles.stickBase} />
          </div>

          <div className={styles.buttons} role="group" aria-label="Select a game">
            {games.map((game) => (
              <button
                key={game.key}
                type="button"
                onClick={() => handleSelect(game)}
                className={`${styles.arcadeBtn} ${BUTTON_CLASS[game.btn]} ${styles.pressStart}`}
                aria-label={`Select ${game.name}`}
              >
                {game.btn === 'red' ? 'TTT' : game.btn === 'yellow' ? 'C4' : 'D&B'}
              </button>
            ))}
          </div>

          <div className={styles.coinDoor}>
            <button type="button" onClick={handleInsertCoin} className={styles.coinButton} aria-label="Insert coin">
              <span className={styles.coinSlot} aria-hidden="true" />
              INSERT COIN
            </button>
            <span className={styles.creditReadout}>CREDIT&nbsp;{String(credits).padStart(2, '0')}</span>
            {coinPulse > 0 && (
              <span key={coinPulse} className={`${styles.coinFlash} ${styles.coinFlashPlay}`} aria-hidden="true">
                +1
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
