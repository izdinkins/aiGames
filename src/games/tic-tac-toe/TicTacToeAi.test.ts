import { describe, it, expect } from 'vitest';
import { getBestMove, minimax } from './TicTacToeAi';
import {
  type Board,
  type Player,
  applyMove,
  checkWinner,
  createInitialBoard,
  getLegalMoves,
} from './engine';

describe('Tic Tac Toe AI (TicTacToeAi)', () => {
  it('takes an immediate winning move', () => {
    // AI is 'O'. 'O' has positions 0 and 1. Position 2 is open.
    const board: Board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null,
    ];
    const move = getBestMove(board, 'O', 'hard');
    expect(move).toBe(2);
  });

  it('blocks an immediate opponent win', () => {
    // AI is 'O'. 'X' has positions 0 and 1. AI must block at 2.
    const board: Board = [
      'X', 'X', null,
      'O', null, null,
      null, null, null,
    ];
    const move = getBestMove(board, 'O', 'hard');
    expect(move).toBe(2);
  });

  it('blocks a diagonal threat', () => {
    // AI is 'O'. 'X' has positions 0 and 4. Position 8 must be blocked.
    const board: Board = [
      'X', null, null,
      null, 'X', null,
      'O', null, null,
    ];
    const move = getBestMove(board, 'O', 'hard');
    expect(move).toBe(8);
  });

  it('prioritizes winning over blocking', () => {
    // AI ('O') can win at 2. Opponent ('X') can win at 5. AI should take the win at 2.
    const board: Board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null,
    ];
    const move = getBestMove(board, 'O', 'hard');
    expect(move).toBe(2);
  });

  it('returns null when no moves are left', () => {
    const fullBoard: Board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    expect(getBestMove(fullBoard, 'O', 'hard')).toBeNull();
  });

  it('never loses in Hard mode against random opponent play', () => {
    // Simulate 50 games where opponent ('X') plays random legal moves and AI ('O') plays 'hard'
    for (let game = 0; game < 50; game++) {
      let board = createInitialBoard();
      let current: Player = 'X';

      while (checkWinner(board).winner === null) {
        if (current === 'X') {
          const legal = getLegalMoves(board);
          const randomMove = legal[Math.floor(Math.random() * legal.length)];
          board = applyMove(board, randomMove, 'X');
          current = 'O';
        } else {
          const aiMove = getBestMove(board, 'O', 'hard');
          expect(aiMove).not.toBeNull();
          board = applyMove(board, aiMove!, 'O');
          current = 'X';
        }
      }

      const { winner } = checkWinner(board);
      // AI ('O') must NEVER lose
      expect(winner).not.toBe('X');
    }
  });

  it('evaluates terminal states correctly', () => {
    const winBoard: Board = [
      'O', 'O', 'O',
      'X', 'X', null,
      null, null, null,
    ];
    const winResult = minimax(winBoard, 5, true, 'O');
    expect(winResult.score).toBe(10 - 5); // 5

    const lossBoard: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ];
    const lossResult = minimax(lossBoard, 4, false, 'O');
    expect(lossResult.score).toBe(-10 + 4); // -6
  });
});

