import { describe, it, expect } from 'vitest';
import {
    COLS,
    ROWS,
    applyMove,
    checkWinner,
    createInitialBoard,
    getLegalMoves,
    isGameOver,
    isValidMove,
    WINNING_LINES,
} from './engine';

describe('Connect Four Engine (engine.ts)', () => {
  it('creates an empty 6x7 board', () => {
    const board = createInitialBoard();
    expect(board.length).toBe(ROWS);
    expect(board[0].length).toBe(COLS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        expect(board[r][c]).toBeNull();
      }
    }
  });

  it('generates exactly 69 winning lines', () => {
    expect(WINNING_LINES.length).toBe(69);
  });

  it('returns all columns as legal moves on an empty board', () => {
    const board = createInitialBoard();
    expect(getLegalMoves(board)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('drops a piece to the bottom of the column', () => {
    const board = createInitialBoard();
    const next = applyMove(board, 3, 'R');
    expect(next[5][3]).toBe('R');
    expect(next[4][3]).toBeNull();
    // Verify pure function (no mutation)
    expect(board[5][3]).toBeNull();
  });

  it('stacks pieces in the same column', () => {
    let board = createInitialBoard();
    board = applyMove(board, 2, 'R');
    board = applyMove(board, 2, 'Y');
    expect(board[5][2]).toBe('R');
    expect(board[4][2]).toBe('Y');
    expect(board[3][2]).toBeNull();
  });

  it('disallows moves in a full column', () => {
    let board = createInitialBoard();
    for (let i = 0; i < ROWS; i++) {
      board = applyMove(board, 0, i % 2 === 0 ? 'R' : 'Y');
    }
    expect(isValidMove(board, 0)).toBe(false);
    expect(getLegalMoves(board)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(() => applyMove(board, 0, 'R')).toThrow();
  });

  it('detects a horizontal win', () => {
    let board = createInitialBoard();
    // Drop 4 Red pieces along row 5 (cols 1, 2, 3, 4)
    board = applyMove(board, 1, 'R');
    board = applyMove(board, 2, 'R');
    board = applyMove(board, 3, 'R');
    board = applyMove(board, 4, 'R');

    const result = checkWinner(board);
    expect(result.winner).toBe('R');
    expect(result.line).toEqual([
      [5, 1],
      [5, 2],
      [5, 3],
      [5, 4],
    ]);
    expect(isGameOver(board)).toBe(true);
  });

  it('detects a vertical win', () => {
    let board = createInitialBoard();
    // Drop 4 Yellow pieces in column 4
    board = applyMove(board, 4, 'Y');
    board = applyMove(board, 4, 'Y');
    board = applyMove(board, 4, 'Y');
    board = applyMove(board, 4, 'Y');

    const result = checkWinner(board);
    expect(result.winner).toBe('Y');
    expect(result.line).toEqual([
      [2, 4],
      [3, 4],
      [4, 4],
      [5, 4],
    ]);
  });

  it('detects a diagonal down-right win (\\)', () => {
    let board = createInitialBoard();
    // Col 0: R at row 5 (R)
    board = applyMove(board, 0, 'R');

    // Col 1: Y at row 5, R at row 4
    board = applyMove(board, 1, 'Y');
    board = applyMove(board, 1, 'R');

    // Col 2: Y at row 5, Y at row 4, R at row 3
    board = applyMove(board, 2, 'Y');
    board = applyMove(board, 2, 'Y');
    board = applyMove(board, 2, 'R');

    // Col 3: Y at row 5, Y at row 4, Y at row 3, R at row 2
    board = applyMove(board, 3, 'Y');
    board = applyMove(board, 3, 'Y');
    board = applyMove(board, 3, 'Y');
    board = applyMove(board, 3, 'R');

    const result = checkWinner(board);
    expect(result.winner).toBe('R');
  });

  it('detects a diagonal up-right win (/)', () => {
    let board = createInitialBoard();
    // Col 3: R at row 5
    board = applyMove(board, 3, 'R');

    // Col 2: Y at row 5, R at row 4
    board = applyMove(board, 2, 'Y');
    board = applyMove(board, 2, 'R');

    // Col 1: Y at row 5, Y at row 4, R at row 3
    board = applyMove(board, 1, 'Y');
    board = applyMove(board, 1, 'Y');
    board = applyMove(board, 1, 'R');

    // Col 0: Y at row 5, Y at row 4, Y at row 3, R at row 2
    board = applyMove(board, 0, 'Y');
    board = applyMove(board, 0, 'Y');
    board = applyMove(board, 0, 'Y');
    board = applyMove(board, 0, 'R');

    const result = checkWinner(board);
    expect(result.winner).toBe('R');
  });

  it('detects a draw when the board is completely filled without a winner', () => {
    let board = createInitialBoard();
    // Fill board with pattern that results in no 4 in a row:
    const pattern = [
      ['R', 'R', 'Y', 'Y', 'R', 'R', 'Y'],
      ['Y', 'Y', 'R', 'R', 'Y', 'Y', 'R'],
      ['R', 'R', 'Y', 'Y', 'R', 'R', 'Y'],
      ['Y', 'Y', 'R', 'R', 'Y', 'Y', 'R'],
      ['R', 'R', 'Y', 'Y', 'R', 'R', 'Y'],
      ['Y', 'Y', 'R', 'R', 'Y', 'Y', 'R'],
    ] as (('R' | 'Y')[])[];

    board = pattern;
    const result = checkWinner(board);
    expect(result.winner).toBe('draw');
    expect(isGameOver(board)).toBe(true);
  });
});

