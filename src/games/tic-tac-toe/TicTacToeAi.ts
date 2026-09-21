import { alphaBeta, type GameState } from '../../shared/minimax';
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
 * State wrapper for Tic Tac Toe conforming to the generic GameState<Move> interface.
 */
export class TicTacToeGameState implements GameState<number> {
  public readonly board: Board;
  public readonly currentPlayer: Player;
  public readonly aiPlayer: Player;
  public readonly depth: number;

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

  applyMove(move: number): GameState<number> {
    const nextBoard = applyMove(this.board, move, this.currentPlayer);
    const nextPlayer: Player = this.currentPlayer === 'X' ? 'O' : 'X';
    return new TicTacToeGameState(nextBoard, nextPlayer, this.aiPlayer, this.depth + 1);
  }

  currentPlayerIsMaximizing(): boolean {
    return this.currentPlayer === this.aiPlayer;
  }

  evaluate(_maximizingPlayer: boolean): number {
    const { winner } = checkWinner(this.board);

    if (winner === this.aiPlayer) {
      // AI won: sooner is better
      return 10 - this.depth;
    }
    if (winner !== null && winner !== 'draw') {
      // Opponent won: later is better
      return -10 + this.depth;
    }
    // Draw or non-terminal
    return 0;
  }
}

/**
 * Computes the best move for the AI given the current board, player, and difficulty level.
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
    const state = new TicTacToeGameState(board, aiPlayer, aiPlayer, 0);
    const result = alphaBeta(state, 1);
    return result.move ?? legalMoves[0];
  }

  // Medium: Depth 2 search (recognizes immediate wins and blocks immediate losses)
  if (difficulty === 'medium') {
    const state = new TicTacToeGameState(board, aiPlayer, aiPlayer, 0);
    const result = alphaBeta(state, 2);
    return result.move ?? legalMoves[0];
  }

  // Hard: Full depth-9 search (unbeatable)
  const state = new TicTacToeGameState(board, aiPlayer, aiPlayer, 0);
  const result = alphaBeta(state, 9);
  return result.move ?? legalMoves[0];
}

