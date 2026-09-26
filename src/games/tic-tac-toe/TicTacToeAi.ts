import {
  type Board,
  type Player,
  applyMove,
  checkWinner,
  getLegalMoves,
  isGameOver,
} from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Self-contained Minimax algorithm with Alpha-Beta pruning specifically for Tic Tac Toe.
 * Evaluates terminal states and returns the best score and move index.
 */
export function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  alpha: number = -Infinity,
  beta: number = Infinity,
): { score: number; move: number | null } {
  const result = checkWinner(board);

  if (result.winner !== null) {
    if (result.winner === aiPlayer) {
      // AI won: sooner is better
      return { score: 10 - depth, move: null };
    }
    if (result.winner === 'draw') {
      return { score: 0, move: null };
    }
    // Opponent won: later is better
    return { score: -10 + depth, move: null };
  }

  if (depth === 0) {
    return { score: 0, move: null };
  }

  const legalMoves = getLegalMoves(board);
  if (legalMoves.length === 0) {
    return { score: 0, move: null };
  }

  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';
  const currentPlayer: Player = isMaximizing ? aiPlayer : opponent;

  let bestMove: number | null = null;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of legalMoves) {
      const nextBoard = applyMove(board, move, currentPlayer);
      const { score } = minimax(nextBoard, depth - 1, false, aiPlayer, alpha, beta);
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, maxScore);
      if (beta <= alpha) {
        break; // Alpha-beta cutoff
      }
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of legalMoves) {
      const nextBoard = applyMove(board, move, currentPlayer);
      const { score } = minimax(nextBoard, depth - 1, true, aiPlayer, alpha, beta);
      if (score < minScore) {
        minScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, minScore);
      if (beta <= alpha) {
        break; // Alpha-beta cutoff
      }
    }
    return { score: minScore, move: bestMove };
  }
}

/**
 * Computes the best move for the AI given the current board, AI player, and difficulty level.
 */
export function getBestMove(
  board: Board,
  aiPlayer: Player,
  difficulty: Difficulty = 'hard',
): number | null {
  const legalMoves = getLegalMoves(board);
  if (legalMoves.length === 0) {
    return null;
  }

  // Easy: 60% chance to make a random legal move; otherwise depth-1 search
  if (difficulty === 'easy') {
    if (Math.random() < 0.6) {
      const randomIndex = Math.floor(Math.random() * legalMoves.length);
      return legalMoves[randomIndex];
    }
    return minimax(board, 1, true, aiPlayer).move ?? legalMoves[0];
  }

  // Medium: Depth 2 search (recognizes immediate wins and blocks immediate losses)
  if (difficulty === 'medium') {
    return minimax(board, 2, true, aiPlayer).move ?? legalMoves[0];
  }

  // Hard: Full depth-9 search (mathematically unbeatable)
  return minimax(board, 9, true, aiPlayer).move ?? legalMoves[0];
}

/**
 * Optional State wrapper for Tic Tac Toe if needed for generic interfaces.
 */
export class TicTacToeGameState {
  board: Board;
  currentPlayer: Player;
  aiPlayer: Player
  depth: number;
  constructor(
    board: Board,
    currentPlayer: Player,
    aiPlayer: Player,
    depth: number = 0,
  ) {
    this.board = board;
    this.currentPlayer = currentPlayer;
    this.aiPlayer = aiPlayer;
    this.depth = depth;
  }

  isTerminal(): boolean {
    return isGameOver(this.board);
  }

  legalMoves(): number[] {
    return getLegalMoves(this.board);
  }

  applyMove(move: number): TicTacToeGameState {
    const nextBoard = applyMove(this.board, move, this.currentPlayer);
    const nextPlayer: Player = this.currentPlayer === 'X' ? 'O' : 'X';
    return new TicTacToeGameState(nextBoard, nextPlayer, this.aiPlayer, this.depth + 1);
  }

  currentPlayerIsMaximizing(): boolean {
    return this.currentPlayer === this.aiPlayer;
  }

  evaluate(): number {
    const { winner } = checkWinner(this.board);
    if (winner === this.aiPlayer) return 10 - this.depth;
    if (winner !== null && winner !== 'draw') return -10 + this.depth;
    return 0;
  }
}
