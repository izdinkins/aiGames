import { describe, it, expect } from 'vitest';
import {
  createInitialBoard,
  getLegalMoves,
  applyMove,
  checkWinner,
  isGameOver,
  type Board,
} from './engine';

describe('Tic Tac Toe Engine', () => {
  it('creates an empty board with 9 empty cells', () => {
    const board = createInitialBoard();
    expect(board).toHaveLength(9);
    expect(board.every((cell) => cell === null)).toBe(true);
    expect(getLegalMoves(board)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('applies a move correctly', () => {
    const board = createInitialBoard();
    const nextBoard = applyMove(board, 4, 'X');
    expect(nextBoard[4]).toBe('X');
    expect(board[4]).toBe(null); // original board remains unchanged (immutability)
    expect(getLegalMoves(nextBoard)).not.toContain(4);
  });

  it('throws error when placing piece on occupied cell or out of bounds', () => {
    const board = applyMove(createInitialBoard(), 0, 'X');
    expect(() => applyMove(board, 0, 'O')).toThrow();
    expect(() => applyMove(board, 9, 'O')).toThrow();
    expect(() => applyMove(board, -1, 'O')).toThrow();
  });

  it('detects a row win', () => {
    const board: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ];
    const result = checkWinner(board);
    expect(result.winner).toBe('X');
    expect(result.line).toEqual([0, 1, 2]);
    expect(isGameOver(board)).toBe(true);
  });

  it('detects a column win', () => {
    const board: Board = [
      'O', 'X', null,
      'O', 'X', null,
      'O', null, null,
    ];
    const result = checkWinner(board);
    expect(result.winner).toBe('O');
    expect(result.line).toEqual([0, 3, 6]);
  });

  it('detects a diagonal win', () => {
    const board: Board = [
      'X', 'O', null,
      'O', 'X', null,
      null, null, 'X',
    ];
    const result = checkWinner(board);
    expect(result.winner).toBe('X');
    expect(result.line).toEqual([0, 4, 8]);
  });

  it('detects a draw', () => {
    const board: Board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    const result = checkWinner(board);
    expect(result.winner).toBe('draw');
    expect(isGameOver(board)).toBe(true);
  });

  it('returns null winner when game is ongoing', () => {
    const board: Board = [
      'X', 'O', null,
      null, null, null,
      null, null, null,
    ];
    const result = checkWinner(board);
    expect(result.winner).toBeNull();
    expect(isGameOver(board)).toBe(false);
  });
});

