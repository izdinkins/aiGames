import { useEffect, useRef, useState } from 'react'
import homeStyles from '../pages/Home.module.css'
import styles from './BootSequence.module.css'

const SESSION_KEY = 'aiGames:booted'
const LINE_STAGGER_MS = 130

const BOOT_LINES = [
  'AI ARCADE SYSTEM v1.0',
  'MEMORY CHECK.......... OK',
  'LOADING MINIMAX ENGINE.......... OK',
  'WARMING UP CRT.......... OK',
  '',
  'INSERT COIN TO CONTINUE',
]

type Phase = 'scene' | 'ignite' | 'zoom'

function shouldPlayBoot() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (window.sessionStorage.getItem(SESSION_KEY)) return false
  return true
}

function SideArt({ label }: { label: string }) {
  return (
    <div className={homeStyles.sideArt} aria-hidden="true">
      <span className={`${homeStyles.sideArtLabel} ${homeStyles.pressStart}`}>{label}</span>
      <div className={homeStyles.speakerGrille}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={homeStyles.speakerDot} />
        ))}
      </div>
    </div>
  )
}

function BaseVents() {
  return (
    <div className={homeStyles.baseVents} aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={homeStyles.baseVent} />
      ))}
    </div>
  )
}

export default function BootSequence() {
  const [active] = useState(shouldPlayBoot)
  const [phase, setPhase] = useState<Phase>('scene')
  const [revealing, setRevealing] = useState(false)
  const [done, setDone] = useState(false)
  const timeouts = useRef<number[]>([])

  useEffect(() => {
    if (!active) return

    const sceneDuration = BOOT_LINES.length * LINE_STAGGER_MS + 550
    const igniteDuration = 460
    const zoomDuration = 680
    const revealDuration = 500

    timeouts.current.push(
      window.setTimeout(() => setPhase('ignite'), sceneDuration),
      window.setTimeout(() => setPhase('zoom'), sceneDuration + igniteDuration),
      window.setTimeout(() => setRevealing(true), sceneDuration + igniteDuration + zoomDuration - 150),
      window.setTimeout(() => {
        window.sessionStorage.setItem(SESSION_KEY, '1')
        setDone(true)
      }, sceneDuration + igniteDuration + zoomDuration - 150 + revealDuration),
    )

    return () => {
      timeouts.current.forEach((id) => window.clearTimeout(id))
    }
  }, [active])

  if (!active || done) return null

  const showTerminal = phase === 'scene'
  const isZooming = phase === 'zoom'
  const isIgniting = phase === 'ignite' || phase === 'zoom'

  return (
    <div
      className={`${styles.overlay} ${revealing ? styles.overlayReveal : ''}`}
      role="status"
      aria-label="AI Arcade is loading"
    >
      <div className={`${styles.zoomWrapper} ${isZooming ? styles.zoomWrapperPlay : ''}`}>
        <div className={homeStyles.cabinet}>
          <div className={homeStyles.marquee}>
            <div className={homeStyles.bulbs} aria-hidden="true">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className={homeStyles.bulb} />
              ))}
            </div>
            <h1 className={`${homeStyles.marqueeTitle} ${homeStyles.pressStart}`}>AI ARCADE</h1>
            <p className={homeStyles.marqueeSubtitle}>three games &middot; one opponent that never sleeps</p>
          </div>

          <div className={homeStyles.cabinetBody}>
            <SideArt label="AI ARCADE" />

            <div className={homeStyles.columnWrap}>
              <div className={homeStyles.bezel}>
                <span className={`${homeStyles.screw} ${homeStyles.screwTl}`} />
                <span className={`${homeStyles.screw} ${homeStyles.screwTr}`} />
                <span className={`${homeStyles.screw} ${homeStyles.screwBl}`} />
                <span className={`${homeStyles.screw} ${homeStyles.screwBr}`} />

                <div className={homeStyles.screen}>
                  <div className={styles.staticGrid} aria-hidden="true" />
                  <div className={homeStyles.screenVignette} aria-hidden="true" />
                  <div className={homeStyles.scanlines} aria-hidden="true" />

                  <div className={homeStyles.screenContent}>
                    <div className={`${styles.terminal} ${showTerminal ? '' : styles.terminalHidden}`}>
                      {BOOT_LINES.map((line, i) => (
                        <div key={i} className={styles.line} style={{ animationDelay: `${i * LINE_STAGGER_MS}ms` }}>
                          {line || ' '}
                          {i === BOOT_LINES.length - 1 ? <span className={styles.cursor} aria-hidden="true" /> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`${styles.igniteLine} ${isIgniting ? styles.igniteLinePlay : ''}`}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className={homeStyles.panel} aria-hidden="true">
                <div className={homeStyles.stick}>
                  <div className={homeStyles.stickBall} />
                  <div className={homeStyles.stickShaft} />
                  <div className={homeStyles.stickBase} />
                </div>

                <div className={homeStyles.buttons}>
                  <div className={`${homeStyles.arcadeBtn} ${homeStyles.arcadeBtnRed} ${homeStyles.pressStart}`}>
                    TTT
                  </div>
                  <div className={`${homeStyles.arcadeBtn} ${homeStyles.arcadeBtnYellow} ${homeStyles.pressStart}`}>
                    C4
                  </div>
                  <div className={`${homeStyles.arcadeBtn} ${homeStyles.arcadeBtnBlue} ${homeStyles.pressStart}`}>
                    D&amp;B
                  </div>
                </div>

                <div className={homeStyles.coinDoor}>
                  <div className={homeStyles.coinButton}>
                    <span className={homeStyles.coinSlot} />
                    INSERT COIN
                  </div>
                  <span className={homeStyles.creditReadout}>CREDIT&nbsp;00</span>
                </div>
              </div>
            </div>

            <SideArt label="VS AI" />
          </div>

          <div className={homeStyles.base}>
            <BaseVents />
            <span className={homeStyles.baseTrim}>EST. 2026</span>
            <BaseVents />
          </div>
        </div>

        <div className={homeStyles.groundShadow} aria-hidden="true" />
      </div>
    </div>
  )
}
