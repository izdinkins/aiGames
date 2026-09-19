import { Link } from 'react-router-dom'

// Placeholder page: engine.ts/ai.ts for this game haven't been built yet.
export default function ConnectFour() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-8">
      <h1 className="text-2xl font-semibold text-slate-800">Connect Four</h1>
      <p className="text-slate-500">Coming soon.</p>
      <Link to="/" className="text-slate-700 underline">
        Back to games
      </Link>
    </div>
  )
}
