import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RetroGrid } from '@/components/ui/retro-grid'
import homeStyles from '../pages/Home.module.css'
import styles from './GameFrame.module.css'
import RoomAmbience from './RoomAmbience'

interface GameFrameProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function GameFrame({ title, subtitle, children }: GameFrameProps) {
  return (
    <div className="dark relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#171019,#0a070b_65%)] px-4 py-10">
      <RoomAmbience />
      <div className={styles.frame}>
        <div className={homeStyles.bezel}>
          <span className={`${homeStyles.screw} ${homeStyles.screwTl}`} />
          <span className={`${homeStyles.screw} ${homeStyles.screwTr}`} />
          <span className={`${homeStyles.screw} ${homeStyles.screwBl}`} />
          <span className={`${homeStyles.screw} ${homeStyles.screwBr}`} />

          <div className={homeStyles.screen}>
            <RetroGrid
              className="absolute inset-0"
              angle={60}
              cellSize={36}
              opacity={0.55}
              lightLineColor="#63ffe4"
              darkLineColor="#63ffe4"
            />
            <div className={homeStyles.screenVignette} aria-hidden="true" />
            <div className={homeStyles.scanlines} aria-hidden="true" />

            <div className={homeStyles.screenContent}>
              <h1 className={`${styles.title} ${homeStyles.pressStart}`}>{title}</h1>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              <div className={styles.body}>{children}</div>
            </div>
          </div>
        </div>
      </div>

      <Link to="/" className={styles.backButton}>
        &larr; BACK TO ARCADE
      </Link>
    </div>
  )
}
