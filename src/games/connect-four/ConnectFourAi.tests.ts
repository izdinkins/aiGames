import { describe, it, expect } from 'vitest';
import {
    ConnectFourGameState,
    evaluateBoard,
    getBestMove,
    minimax
}
    from './ConnectFourAi';

import {
    type Board,
    applyMove,
    createInitialBoard,
}
    from './engine';

import { alphaBeta } from '../../shared/minimax';

describe('Connect Four AI (ConnectFourAi)', () => {
    it('takes an immediate horizontal winning move', () => {
        let board: Board = createInitialBoard();
        board = applyMove(board, 1, 'Y');
        board = applyMove(board, 2, 'Y');
        board = applyMove(board, 3, 'Y');

        const move = getBestMove(board, 'Y', 'hard');
        expect([0, 4]).toContain(move);
    });

    it('takes an immediate vertical winning move', () => {
        let board: Board = createInitialBoard();
        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');

        const move = getBestMove(board, 'Y', 'hard');
        expect(move).toBe(3);
    });

    it('blocks an immediate horizontal winning move', () => {
        let board: Board = createInitialBoard();
        board = applyMove(board, 0, 'R');
        board = applyMove(board, 1, 'R');
        board = applyMove(board, 2, 'R');

        const move = getBestMove(board, 'Y', 'hard');
        expect(move).toBe(3);
    });

    it('blocks an opponent horizontal win when one side is blocked', () => {
        let board: Board = createInitialBoard();
        board = applyMove(board, 1, 'Y');
        board = applyMove(board, 2, 'R');
        board = applyMove(board, 3, 'R');
        board = applyMove(board, 4, 'R');

        const move = getBestMove(board, 'Y', 'hard');
        expect(move).toBe(5);
    });

    it('blocks an immediate opponent vertical win', () => {
        // Opponent is 'R'. 'R' has 3 stacked pieces in column 4. AI is 'Y'.
        let board: Board = createInitialBoard();
        board = applyMove(board, 4, 'R');
        board = applyMove(board, 4, 'R');
        board = applyMove(board, 4, 'R');

        const move = getBestMove(board, 'Y', 'hard');
        expect(move).toBe(4);
    });

    it('prioritizes winning over blocking', () => {
        // AI ('Y') has 3 in col 3. Opponent ('R') has 3 in col 2.
        // AI can win this turn at col 3. AI must take the win instead of blocking.
        let board: Board = createInitialBoard();
        board = applyMove(board, 2, 'R');
        board = applyMove(board, 2, 'R');
        board = applyMove(board, 2, 'R');

        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');

        const move = getBestMove(board, 'Y', 'hard');
        expect(move).toBe(3);
    });

    it('prefers center column on an empty board', () => {
        const board = createInitialBoard();
        const move = getBestMove(board, 'R', 'hard');
        expect(move).toBe(3);
    });

    it('returns null on a full board', () => {
        const pattern = [
            ['R', 'R', 'Y', 'Y', 'R', 'R', 'Y'],
            ['Y', 'Y', 'R', 'R', 'Y', 'Y', 'R'],
            ['R', 'R', 'Y', 'Y', 'R', 'R', 'Y'],
            ['Y', 'Y', 'R', 'R', 'Y', 'Y', 'R'],
            ['R', 'R', 'Y', 'Y', 'R', 'R', 'Y'],
            ['Y', 'Y', 'R', 'R', 'Y', 'Y', 'R'],
        ] as (('R' | 'Y')[])[];

        expect(getBestMove(pattern, 'R', 'hard')).toBeNull();
    });

    it('evaluates board heuristics with center preference and threats', () => {
        let board = createInitialBoard();
        // Piece in center
        board = applyMove(board, 3, 'Y');
        const scoreY = evaluateBoard(board, 'Y');
        const scoreR = evaluateBoard(board, 'R');
        expect(scoreY).toBeGreaterThan(0);
        expect(scoreR).toBeLessThan(0);
    });

    it('integrates seamlessly with generic shared alphaBeta algorithm', () => {
        let board = createInitialBoard();
        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');

        const state = new ConnectFourGameState(board, 'Y', 'Y');
        const result = alphaBeta(state, 2);
        expect(result.move).toBe(3);
    });

    it('evaluates terminal scores directly with minimax', () => {
        let board = createInitialBoard();
        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');
        board = applyMove(board, 3, 'Y');

        const winResult = minimax(board, 4, true, 'Y');
        expect(winResult.score).toBe(100000 + 4);

        const lossResult = minimax(board, 3, false, 'R');
        expect(lossResult.score).toBe(-100000 - 3);
    });
});