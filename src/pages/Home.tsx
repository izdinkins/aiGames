import { Grid3x3, Circle, Square } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RetroGrid } from '@/components/ui/retro-grid'

interface GameEntry {
  name: string
  path: string
  icon: typeof Grid3x3
  available: boolean
}

const games: GameEntry[] = [
  { name: 'Tic Tac Toe', path: '/tic-tac-toe', icon: Grid3x3, available: true },
  { name: 'Connect Four', path: '/connect-four', icon: Circle, available: true },
  { name: 'Dots and Boxes', path: '/dots-and-boxes', icon: Square, available: true },
]

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center gap-8 overflow-hidden bg-slate-50 p-8">
      <RetroGrid
        angle={65}
        cellSize={60}
        opacity={0.4}
        lightLineColor="#94a3b8"
        darkLineColor="#475569"
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <h1 className="mt-8 text-3xl font-semibold text-slate-800">aiGames</h1>
        <p className="text-slate-500">Pick a game to play against the AI</p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {games.map((game) => {
            const Icon = game.icon
            return (
              <Link
                key={game.path}
                to={game.path}
                className="flex w-48 flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Icon className="h-12 w-12 text-slate-700" strokeWidth={1.5} />
                <span className="font-medium text-slate-800">{game.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
