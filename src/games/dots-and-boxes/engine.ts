export type Player = 'player1' | 'player2' | 'red' | 'blue' | 'A' | 'B';
export type EdgeType = 'horizontal' | 'vertical' | 'H' | 'V';

export interface Move {
  type: EdgeType
  row: number;
  col: number;
}

export type Edge = Move;

export interface Board {
  rows: number;
  cols: number;
  hEdges: boolean[][];
  vEdges: boolean[][];
  boxes: (Player | null)[][];
  currentPlayer: Player;
}

export interface GameResult {
  winner: Player | 'draw' | null;
  scores: Record<string, number>;
}

export interface ApplyMoveDetails {
  board: Board;
  completedBoxes: Array<[number, number]>;
  extraTurn: boolean;
}

export const DEFAULT_GRID_SIZE = 3;
export const DEFAULT_ROWS = 3;
export const DEFAULT_COLS = 3;
export const DEFAULT_DOTS_SIZE = 4;

// Returns the opponent player
export function getOpponent(player: Player): Player {
  switch (player) {
    case 'player1':
      return 'player2';
    case 'player2':
      return 'player1';
    case 'red':
      return 'blue';
    case 'blue':
      return 'red';
    case 'A':
      return 'B';
    case 'B':
      return 'A';
    default:
      return player === 'player1' ? 'player2' : 'player1';
  }
}

// Normalizes edge type to horizontal or vertical
export function normalizeEdgeType(type: EdgeType): 'horizontal' | 'vertical' {
  if (type === 'H' || type === 'horizontal') return 'horizontal';
  return 'vertical';
}

export function isEdgeHorizontal(type: EdgeType): boolean {
  return type === 'H' || type === 'horizontal';
}

export function isEdgeVertical(type: EdgeType): boolean {
  return type === 'V' || type === 'vertical';
}

export function areMovesEqual(a: Move, b: Move): boolean {
  return normalizeEdgeType(a.type) === normalizeEdgeType(b.type) && a.row === b.row && a.col === b.col;
}

// Creates a new empty board
export function createInitialBoard(
  rows: number = DEFAULT_ROWS,
  cols: number = DEFAULT_COLS,
  firstPlayer: Player = 'player1',
): Board {
  const hEdges: boolean[][] = Array.from({ length: rows + 1 }, () => Array(cols).fill(false));
  const vEdges: boolean[][] = Array.from({ length: rows }, () => Array(cols + 1).fill(false));
  const boxes: (Player | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  return {
    rows, cols, hEdges, vEdges, boxes, currentPlayer: firstPlayer,
  };
}

// Creates a copy of the board
export function cloneBoard(board: Board): Board {
  return {
    rows: board.rows,
    cols: board.cols,
    hEdges: board.hEdges.map((row) => [...row]),
    vEdges: board.vEdges.map((row) => [...row]),
    boxes: board.boxes.map((row) => [...row]),
    currentPlayer: board.currentPlayer,
  };
}

// Checks whether rows and cols has all 4 edges drawn
export function isBoxCompleted(
  hEdges: boolean[][],
  vEdges: boolean[][],
  row: number,
  col: number,
): boolean {
  return hEdges[row][col] && hEdges[row + 1][col] && vEdges[row][col] && vEdges[row][col + 1];
}

// Counts how many edges are currently drawn around box (row, col). Returns 0..4.
export function getBoxEdgeCount(
  hEdges: boolean[][],
  vEdges: boolean[][],
  row: number,
  col: number,
): number {
  let count = 0;
  if (hEdges[row][col]) count++;
  if (hEdges[row + 1][col]) count++;
  if (vEdges[row][col]) count++;
  if (vEdges[row][col + 1]) count++;
  return count;
}

// Returns the coordinates of the 1 or 2 boxes adjacent to this edge.
export function getAdjacentBoxes(
  rows: number,
  cols: number,
  move: Move,
): Array<[number, number]> {
  const boxes: Array<[number, number]> = [];
  if (isEdgeHorizontal(move.type)) {
    if (move.row - 1 >= 0 && move.col >= 0 && move.col < cols) {
      boxes.push([move.row - 1, move.col]);
    }
    if (move.row < rows && move.col >= 0 && move.col < cols) {
      boxes.push([move.row, move.col]);
    }
  } else if (isEdgeVertical(move.type)) {
    if (move.col - 1 >= 0 && move.row >= 0 && move.row < rows) {
      boxes.push([move.row, move.col - 1]);
    }
    if (move.col < cols && move.row >= 0 && move.row < rows) {
      boxes.push([move.row, move.col]);
    }
  }
  return boxes;
}

// Validates whether a move can be placed on the board.
export function isValidMove(board: Board, move: Move): boolean {
  if (isEdgeHorizontal(move.type)) {
    if (move.row < 0 || move.row > board.rows || move.col < 0 || move.col >= board.cols) {
      return false;
    }
    return !board.hEdges[move.row][move.col];
  } else if (isEdgeVertical(move.type)) {
    if (move.row < 0 || move.row >= board.rows || move.col < 0 || move.col > board.cols) {
      return false;
    }
    return !board.vEdges[move.row][move.col];
  }
  return false;
}

// Returns all open edges as legal moves.
export function getLegalMoves(board: Board): Move[] {
  const moves: Move[] = [];
  // Horizontal edges: (rows + 1) x cols
  for (let r = 0; r <= board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (!board.hEdges[r][c]) {
        moves.push({ type: 'horizontal', row: r, col: c });
      }
    }
  }
  // Vertical edges: rows x (cols + 1)
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c <= board.cols; c++) {
      if (!board.vEdges[r][c]) {
        moves.push({ type: 'vertical', row: r, col: c });
      }
    }
  }
  return moves;
}

// Computes scores
export function getScores(board: Board): Record<string, number> {
  const scores: Record<string, number> = {};
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const owner = board.boxes[r][c];
      if (owner !== null) {
        scores[owner] = (scores[owner] ?? 0) + 1;
      }
    }
  }
  return scores;
}
/**
 * Returns the score for a specific player.
 */
export function getPlayerScore(board: Board, player: Player): number {
  return getScores(board)[player] ?? 0;
}

export function applyMoveWithDetails(
  board: Board,
  move: Move,
  player?: Player,
): ApplyMoveDetails {
  if (!isValidMove(board, move)) {
    throw new Error(`Invalid move: [${move.type}] at row ${move.row}, col ${move.col}`);
  }
  const currentPlayer = player ?? board.currentPlayer;
  const nextBoard = cloneBoard(board);
  const isH = isEdgeHorizontal(move.type);
  if (isH) {
    nextBoard.hEdges[move.row][move.col] = true;
  } else {
    nextBoard.vEdges[move.row][move.col] = true;
  }
  const affected = getAdjacentBoxes(board.rows, board.cols, move);
  const completedBoxes: Array<[number, number]> = [];
  for (const [r, c] of affected) {
    if (board.boxes[r][c] === null && isBoxCompleted(nextBoard.hEdges, nextBoard.vEdges, r, c)) {
      nextBoard.boxes[r][c] = currentPlayer;
      completedBoxes.push([r, c]);
    }
  }
  const extraTurn = completedBoxes.length > 0;
  nextBoard.currentPlayer = extraTurn ? currentPlayer : getOpponent(currentPlayer);

  return {
    board: nextBoard,
    completedBoxes,
    extraTurn,
  };
}

export function applyMove(board: Board, move: Move, player?: Player): Board {
  return applyMoveWithDetails(board, move, player).board;
}
/**
 * Checks if the game has ended and returns the winner or draw.
 */
export function checkWinner(board: Board): GameResult {
  const scores = getScores(board);
  const totalBoxes = board.rows * board.cols;
  const claimedBoxes = Object.values(scores).reduce((sum, s) => sum + s, 0);
  // If there are still boxes to be claimed and moves left, the game is ongoing
  if (claimedBoxes < totalBoxes && getLegalMoves(board).length > 0) {
    return { winner: null, scores };
  }
  const playerKeys = Object.keys(scores);
  if (playerKeys.length === 0) {
    return { winner: 'draw', scores };
  }
  if (playerKeys.length === 1) {
    return { winner: playerKeys[0] as Player, scores };
  }
  if (playerKeys.length === 2) {
    const [first, second] = playerKeys;
    const score1 = scores[first];
    const score2 = scores[second];
    if (score1 > score2) return { winner: first as Player, scores };
    if (score2 > score1) return { winner: second as Player, scores };
    return { winner: 'draw', scores };
  }
  // Fallback for general player comparisons
  let maxScore = -1;
  let topPlayer: Player | null = null;
  let isTie = false;
  for (const [p, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topPlayer = p as Player;
      isTie = false;
    } else if (score === maxScore) {
      isTie = true;
    }
  }
  if (isTie) {
    return { winner: 'draw', scores };
  }
  return { winner: topPlayer, scores };
}
/**
 * Returns true if the game is finished (all boxes completed or no legal moves).
 */
export function isGameOver(board: Board): boolean {
  return checkWinner(board).winner !== null;
}