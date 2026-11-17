import type { GameState } from '../../shared/minimax';
import {
  type Board,
  type Move,
  type Player,
  applyMove,
  checkWinner,
  getAdjacentBoxes,
  getBoxEdgeCount,
  getLegalMoves,
  getOpponent,
  getPlayerScore,
  isGameOver,
} from './engine';
export type Difficulty = 'easy' | 'medium' | 'hard';

// Calculates a move priority score for alpha-beta move ordering.
export function getMovePriority(board: Board, move: Move): number {
  const affected = getAdjacentBoxes(board.rows, board.cols, move);
  let boxesCompleted = 0;
  let givesAwayBoxes = 0;
  for (const [r, c] of affected) {
    const count = getBoxEdgeCount(board.hEdges, board.vEdges, r, c);
    if (count === 3) {
      // Drawing this 4th edge completes this box!
      boxesCompleted++;
    } else if (count === 2) {
      // Drawing this 3rd edge hands this box to the opponent!
      givesAwayBoxes++;
    }
  }
  if (boxesCompleted === 2) return 1000;
  if (boxesCompleted === 1) return 500;
  if (givesAwayBoxes === 0) return 100;
  if (givesAwayBoxes === 1) return 10;
  return 0;
}
/**
 * Returns legal moves sorted by heuristic priority.
 * Exploring capturing and safe moves first maximizes alpha-beta pruning.
 */
export function getOrderedLegalMoves(board: Board): Move[] {
  const legal = getLegalMoves(board);
  return legal.sort((a, b) => getMovePriority(board, b) - getMovePriority(board, a));
}
// Heuristic evaluation function for non-terminal positions.
export function evaluateBoard(board: Board, aiPlayer: Player): number {
  const opponent = getOpponent(aiPlayer);
  const myScore = getPlayerScore(board, aiPlayer);
  const oppScore = getPlayerScore(board, opponent);
  let score = (myScore - oppScore) * 100;
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (board.boxes[r][c] !== null) continue;
      const edgeCount = getBoxEdgeCount(board.hEdges, board.vEdges, r, c);
      if (edgeCount === 3) {
        // Immediate capture opportunity
        if (board.currentPlayer === aiPlayer) {
          score += 40;
        } else {
          score -= 40;
        }
      } else if (edgeCount === 2) {
        // 2 edges is volatile; approaching capture
        score -= 2;
      } else {
        // Safe, stable box
        score += 1;
      }
    }
  }
  return score;
}

// Minimax algorithm with alpha-beta pruning
export function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  alpha: number = -Infinity,
  beta: number = Infinity,
): { score: number; move: Move | null } {
  const result = checkWinner(board);
  const legalMoves = getOrderedLegalMoves(board);
  if (result.winner !== null || depth === 0 || legalMoves.length === 0) {
    if (result.winner !== null) {
      const myScore = getPlayerScore(board, aiPlayer);
      const oppScore = getPlayerScore(board, getOpponent(aiPlayer));
      if (result.winner === aiPlayer) {
        return { score: 10000 + (myScore - oppScore) * 100 + depth, move: null };
      }
      if (result.winner === 'draw') {
        return { score: 0, move: null };
      }
      return { score: -10000 - (oppScore - myScore) * 100 - depth, move: null };
    }
    return { score: evaluateBoard(board, aiPlayer), move: null };
  }
  const opponent = getOpponent(aiPlayer);
  const currentPlayer = isMaximizing ? aiPlayer : opponent;
  let bestMove: Move | null = null;
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of legalMoves) {
      const nextBoard = applyMove(board, move, currentPlayer);
      const nextIsMaximizing = nextBoard.currentPlayer === aiPlayer;
      const { score } = minimax(nextBoard, depth - 1, nextIsMaximizing, aiPlayer, alpha, beta);

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
      const nextIsMaximizing = nextBoard.currentPlayer === aiPlayer;
      const { score } = minimax(nextBoard, depth - 1, nextIsMaximizing, aiPlayer, alpha, beta);
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

// Computes the best move for the AI given the current board and difficulty.
export function getBestMove(
  board: Board,
  aiPlayer: Player,
  difficulty: Difficulty = 'hard',
): Move | null {
  const legalMoves = getOrderedLegalMoves(board);
  if (legalMoves.length === 0) {
    return null;
  }

  // Easy: 50% chance to pick a random legal move; otherwise depth 1 search
  if (difficulty === 'easy') {
    if (Math.random() < 0.5) {
      const randomIndex = Math.floor(Math.random() * legalMoves.length);
      return legalMoves[randomIndex];
    }
    return minimax(board, 1, true, aiPlayer).move ?? legalMoves[0];
  }
  // Medium: Depth 2 search (recognizes immediate captures and blocks/avoids giving away boxes)
  if (difficulty === 'medium') {
    return minimax(board, 2, true, aiPlayer).move ?? legalMoves[0];
  }
  // Hard: Depth 4 search (or complete endgame search when <= 10 moves remain)
  const remaining = legalMoves.length;
  const searchDepth = remaining <= 10 ? remaining : 4;
  return minimax(board, searchDepth, true, aiPlayer).move ?? legalMoves[0];
}
/**
 * GameState implementation for Dots and Boxes conforming to the shared minimax interface.
 */
export class DotsAndBoxesGameState implements GameState<Move> {
  board: Board;
  aiPlayer: Player;
  depth: number;
  constructor(board: Board, aiPlayer: Player, depth: number = 0) {
    this.board = board;
    this.aiPlayer = aiPlayer;
    this.depth = depth;
  }
  isTerminal(): boolean {
    return isGameOver(this.board);
  }
  legalMoves(): Move[] {
    return getOrderedLegalMoves(this.board);
  }
  applyMove(move: Move): DotsAndBoxesGameState {
    const nextBoard = applyMove(this.board, move, this.board.currentPlayer);
    return new DotsAndBoxesGameState(nextBoard, this.aiPlayer, this.depth + 1);
  }

  currentPlayerIsMaximizing(): boolean {
    return this.board.currentPlayer === this.aiPlayer;
  }
  evaluate(_maximizingPlayer?: boolean): number {
    const { winner } = checkWinner(this.board);
    const myScore = getPlayerScore(this.board, this.aiPlayer);
    const oppScore = getPlayerScore(this.board, getOpponent(this.aiPlayer));
    if (winner === this.aiPlayer) {
      return 10000 + (myScore - oppScore) * 100 - this.depth;
    }
    if (winner !== null && winner !== 'draw') {
      return -10000 - (oppScore - myScore) * 100 + this.depth;
    }
    if (winner === 'draw') {
      return 0;
    }
    return evaluateBoard(this.board, this.aiPlayer);
  }
}