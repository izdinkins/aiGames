export interface HighScoreEntry {
  initials: string
  score: number
  game: string
  date: string
}

const STORAGE_KEY = 'aiGames:highScores'
const MAX_ENTRIES = 10

function readAll(): HighScoreEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(entries: HighScoreEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function getHighScores(game?: string): HighScoreEntry[] {
  const all = readAll().sort((a, b) => b.score - a.score)
  return game ? all.filter((e) => e.game === game) : all
}

export function getTopScores(limit = 3, game?: string): HighScoreEntry[] {
  return getHighScores(game).slice(0, limit)
}

export function qualifiesForHighScore(score: number, game: string): boolean {
  const scores = getHighScores(game)
  if (scores.length < MAX_ENTRIES) return true
  return score > scores[scores.length - 1].score
}

export function addHighScore(entry: HighScoreEntry) {
  const all = readAll()
  all.push(entry)
  all.sort((a, b) => b.score - a.score)
  writeAll(all.slice(0, MAX_ENTRIES))
}
