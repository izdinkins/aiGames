export interface GameState<Move> {
  isTerminal(): boolean;
  legalMoves(): Move[];
  applyMove(move: Move): GameState<Move>;
  evaluate(maximizingPlayer: boolean): number; // Heuristic score if not terminal/full-depth
  currentPlayerIsMaximizing(): boolean;
}

export interface SearchResult<Move> {
  score: number;
  move: Move | null;
}

/**
 * Generic Minimax algorithm with Alpha-Beta pruning.
 * Reusable across any 2-player turn-based zero-sum game implementing GameState<Move>.
 */
export function alphaBeta<Move>(
  state: GameState<Move>,
  depth: number,
  alpha: number = -Infinity,
  beta: number = Infinity,
): SearchResult<Move> {
  if (depth === 0 || state.isTerminal()) {
    return { score: state.evaluate(state.currentPlayerIsMaximizing()), move: null };
  }

  const maximizing = state.currentPlayerIsMaximizing();
  const moves = state.legalMoves();

  if (moves.length === 0) {
    return { score: state.evaluate(maximizing), move: null };
  }

  let bestMove: Move | null = null;
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const child = state.applyMove(move);
    const { score } = alphaBeta(child, depth - 1, alpha, beta);

    if (maximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) {
      break; // Alpha-beta pruning cutoff
    }
  }

  return { score: bestScore, move: bestMove };
}

