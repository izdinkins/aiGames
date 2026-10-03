import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { RetroGrid } from '@/components/ui/retro-grid'
import { useTilt } from '@/hooks/useTilt'
import { sound } from '@/lib/sound'
import RoomAmbience from '../components/RoomAmbience'
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

const HIGH_SCORES = [
  { name: 'AAA', score: 990000 },
  { name: 'CPU', score: 742000 },
  { name: 'YOU', score: 0 },
]

const IDLE_MS = 15000
const ATTRACT_CYCLE_MS = 4000

function SideArt({ label }: { label: string }) {
  return (
    <div className={styles.sideArt} aria-hidden="true">
      <span className={`${styles.sideArtLabel} ${styles.pressStart}`}>{label}</span>
      <div className={styles.speakerGrille}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={styles.speakerDot} />
        ))}
      </div>
    </div>
  )
}

function BaseVents() {
  return (
    <div className={styles.baseVents} aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={styles.baseVent} />
      ))}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const tilt = useTilt(5)
  const [credits, setCredits] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [warn, setWarn] = useState(false)
  const [coinPulse, setCoinPulse] = useState(0)
  const [attractMode, setAttractMode] = useState(false)
  const [attractPanel, setAttractPanel] = useState<'scores' | 'howto'>('scores')
  const warnTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (warnTimeoutRef.current !== null) window.clearTimeout(warnTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    let idleTimeout: number | null = null

    function resetIdle() {
      setAttractMode(false)
      if (idleTimeout !== null) window.clearTimeout(idleTimeout)
      idleTimeout = window.setTimeout(() => setAttractMode(true), IDLE_MS)
    }

    resetIdle()
    window.addEventListener('pointerdown', resetIdle)
    window.addEventListener('keydown', resetIdle)

    return () => {
      window.removeEventListener('pointerdown', resetIdle)
      window.removeEventListener('keydown', resetIdle)
      if (idleTimeout !== null) window.clearTimeout(idleTimeout)
    }
  }, [])

  useEffect(() => {
    if (!attractMode) return
    setAttractPanel('scores')
    const interval = window.setInterval(() => {
      setAttractPanel((p) => (p === 'scores' ? 'howto' : 'scores'))
    }, ATTRACT_CYCLE_MS)
    return () => window.clearInterval(interval)
  }, [attractMode])

  function handleSelect(game: GameEntry) {
    if (selectedKey === game.key) {
      sound.start()
      navigate(game.path)
      return
    }

    if (credits < 1) {
      sound.deny()
      setWarn(true)
      warnTimeoutRef.current = window.setTimeout(() => setWarn(false), 1400)
      return
    }

    sound.select()
    setCredits((c) => c - 1)
    setSelectedKey(game.key)
  }

  function handleInsertCoin() {
    sound.coin()
    setCredits((c) => c + 1)
    setCoinPulse((p) => p + 1)
  }

  const heading = warn ? 'INSERT COIN TO PLAY' : selectedKey ? 'PRESS START' : 'SELECT YOUR GAME'

  return (
    <div className="dark relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#171019,#0a070b_65%)] px-4 py-10">
      <RoomAmbience />

      <div ref={tilt.ref} style={tilt.style} className={styles.cabinet}>
        <div className={styles.marquee}>
          <div className={styles.bulbs} aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={styles.bulb} />
            ))}
          </div>
          <h1 className={`${styles.marqueeTitle} ${styles.pressStart}`}>AI ARCADE</h1>
          <p className={styles.marqueeSubtitle}>three games &middot; one opponent that never sleeps</p>
        </div>

        <div className={styles.cabinetBody}>
          <SideArt label="AI ARCADE" />

          <div className={styles.columnWrap}>
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

                {attractMode ? (
                  <div className={styles.screenContent}>
                    {attractPanel === 'scores' ? (
                      <div className={styles.attractPanel}>
                        <div className={`${styles.attractHeading} ${styles.pressStart}`}>HIGH SCORES</div>
                        {HIGH_SCORES.map((entry, i) => (
                          <div key={entry.name} className={styles.scoreRow}>
                            <span>
                              {i + 1}. {entry.name}
                            </span>
                            <span>{String(entry.score).padStart(7, '0')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.attractPanel}>
                        <div className={`${styles.attractHeading} ${styles.pressStart}`}>HOW TO PLAY</div>
                        <p className={styles.attractText}>INSERT COIN</p>
                        <p className={styles.attractText}>SELECT A GAME</p>
                        <p className={styles.attractText}>PRESS START</p>
                        <p className={styles.attractText}>BEAT THE AI</p>
                      </div>
                    )}
                    <div className={`${styles.attractHint} ${styles.pressStart}`}>PRESS ANY BUTTON</div>
                  </div>
                ) : (
                  <div className={styles.screenContent}>
                    <div
                      className={`${styles.screenHeading} ${styles.pressStart} ${warn ? styles.screenHeadingWarn : ''}`}
                    >
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
                            <span className={styles.tileTag}>{isSelected ? 'PRESS START' : ' '}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className={styles.statusRow}>
                      <span>CREDITS {String(credits).padStart(2, '0')}</span>
                      <span>OPPONENT: MINIMAX AI</span>
                    </div>
                  </div>
                )}
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
                <button
                  type="button"
                  onClick={handleInsertCoin}
                  className={styles.coinButton}
                  aria-label="Insert coin"
                >
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

          <SideArt label="VS AI" />
        </div>

        <div className={styles.base}>
          <BaseVents />
          <span className={styles.baseTrim}>EST. 2026</span>
          <BaseVents />
        </div>
      </div>

      <div className={styles.groundShadow} aria-hidden="true" />
    </div>
  )
}
