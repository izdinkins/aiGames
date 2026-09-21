export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];
export type WinningLine = [number, number, number];

export interface GameResult {
  winner: Player | 'draw' | null;
  line?: WinningLine;
}

export const WINNING_COMBOS: WinningLine[] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Returns a new empty 3x3 Tic Tac Toe board (9 null cells).
 */
export function createInitialBoard(): Board {
  return Array(9).fill(null);
}

/**
 * Returns an array of indices corresponding to open cells.
 */
export function getLegalMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Checks if there is a winner or a draw on the given board.
 */
export function checkWinner(board: Board): GameResult {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (getLegalMoves(board).length === 0) {
    return { winner: 'draw' };
  }

  return { winner: null };
}

/**
 * Returns true if the game is finished (win or draw).
 */
export function isGameOver(board: Board): boolean {
  return checkWinner(board).winner !== null;
}

/**
 * Pure function to apply a move to the board.
 * Throws an Error if the index is out of bounds or already occupied.
 */
export function applyMove(board: Board, index: number, player: Player): Board {
  if (index < 0 || index >= board.length) {
    throw new Error(`Invalid move: index ${index} is out of bounds.`);
  }
  if (board[index] !== null) {
    throw new Error(`Invalid move: cell ${index} is already occupied.`);
  }

  const nextBoard = [...board];
  nextBoard[index] = player;
  return nextBoard;
}

