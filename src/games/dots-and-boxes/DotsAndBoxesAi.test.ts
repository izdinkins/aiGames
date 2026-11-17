import { describe, expect, it } from 'vitest';
import { alphaBeta } from '../../shared/minimax';
import {
    DotsAndBoxesGameState,
    evaluateBoard,
    getBestMove,
    getMovePriority,
    getOrderedLegalMoves,
    minimax,
} from './DotsAndBoxesAi';
import {
    type Move,
    applyMove,
    areMovesEqual,
    createInitialBoard,
    getLegalMoves,
    getPlayerScore,
} from './engine';

describe('Dots and Boxes AI (DotsAndBoxesAi)', () => {
    it('takes an immediate box-completing move when available', () => {
        let board = createInitialBoard();
        // Prepare box (0, 0) with 3 edges
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 }, 'player1');
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 }, 'player2');
        board = applyMove(board, { type: 'vertical', row: 0, col: 1 }, 'player1');

        // Expected winning edge to complete box (0, 0): horizontal edge at (1, 0)
        const expectedMove: Move = { type: 'horizontal', row: 1, col: 0 };
        const move = getBestMove(board, 'player2', 'hard');
        expect(move).not.toBeNull();
        expect(areMovesEqual(move!, expectedMove)).toBe(true);
    });

    it('completes two boxes simultaneously when a shared edge completes both', () => {
        let board = createInitialBoard();

        // Set up box (0, 0): top, left, right
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 1 });

        // Set up box (1, 0): bottom, left, right
        board = applyMove(board, { type: 'horizontal', row: 2, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 1, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 1, col: 1 });

        // Shared edge between (0, 0) and (1, 0) is horizontal (1, 0)
        const sharedEdge: Move = { type: 'horizontal', row: 1, col: 0 };
        const move = getBestMove(board, 'player1', 'hard');

        expect(move).not.toBeNull();
        expect(areMovesEqual(move!, sharedEdge)).toBe(true);
    });

    it('does not give away a free box when safe moves are available', () => {
        let board = createInitialBoard();

        // Give box (0, 0) exactly 2 edges: top and left
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 });

        // AI is to move. Playing right edge (0, 1) or bottom edge (1, 0) of box (0, 0)
        // would give box (0, 0) 3 edges (a free box for opponent).
        // Meanwhile, the rest of the board (e.g. at (2, 2)) has completely untouched boxes.
        const aiMove = getBestMove(board, 'player1', 'hard');
        expect(aiMove).not.toBeNull();

        // The chosen move should NOT leave box (0, 0) with 3 edges
        const dangerousMoves: Move[] = [
            { type: 'horizontal', row: 1, col: 0 },
            { type: 'vertical', row: 0, col: 1 },
        ];
        const isDangerous = dangerousMoves.some((m) => areMovesEqual(aiMove!, m));
        expect(isDangerous).toBe(false);
    });

    it('prioritizes completing a box over playing a neutral move', () => {
        let board = createInitialBoard();
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 1 });
        board = applyMove(board, { type: 'horizontal', row: 1, col: 0 });

        const move = getBestMove(board, 'player2', 'hard');
        expect(move).not.toBeNull();
        expect(areMovesEqual(move!, { type: 'horizontal', row: 1, col: 0 })).toBe(true);
    });

    it('returns null on a completely full board', () => {
        let board = createInitialBoard(1, 1);
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 1 });
        board = applyMove(board, { type: 'horizontal', row: 1, col: 0 });
        expect(getLegalMoves(board)).toHaveLength(0);
        expect(getBestMove(board, 'player1', 'hard')).toBeNull();
    });

    it('heavily prioritizes capturing moves in getMovePriority and getOrderedLegalMoves', () => {
        let board = createInitialBoard();

        // Box (0, 0) has 3 edges
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 1 });

        const completingMove: Move = { type: 'horizontal', row: 1, col: 0 };
        const neutralMove: Move = { type: 'horizontal', row: 3, col: 2 };

        expect(getMovePriority(board, completingMove)).toBeGreaterThan(getMovePriority(board, neutralMove));

        const ordered = getOrderedLegalMoves(board);
        expect(areMovesEqual(ordered[0], completingMove)).toBe(true);
    });

    it('evaluates board heuristic favorably when AI has captured more boxes', () => {
        let board = createInitialBoard();
        board.boxes[0][0] = 'player1';
        board.currentPlayer = 'player1';

        const p1Eval = evaluateBoard(board, 'player1');
        const p2Eval = evaluateBoard(board, 'player2');

        expect(p1Eval).toBeGreaterThan(0);
        expect(p2Eval).toBeLessThan(0);
    });

    it('scores terminal states properly in minimax', () => {
        // 1x1 board where player1 wins
        let board = createInitialBoard(1, 1, 'player1');
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 1 });
        board = applyMove(board, { type: 'horizontal', row: 1, col: 0 }, 'player1');

        const winResult = minimax(board, 3, true, 'player1');
        expect(winResult.score).toBeGreaterThan(10000);
        expect(winResult.move).toBeNull();

        const lossResult = minimax(board, 3, true, 'player2');
        expect(lossResult.score).toBeLessThan(-10000);
        expect(lossResult.move).toBeNull();
    });

    it('works with the generic alphaBeta search in DotsAndBoxesGameState', () => {

        let board = createInitialBoard();
        // Prepare box (0, 0) with 3 edges
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 1 });

        const state = new DotsAndBoxesGameState(board, 'player2');
        expect(state.isTerminal()).toBe(false);
        expect(state.currentPlayerIsMaximizing()).toBe(true);

        const result = alphaBeta(state, 2);
        expect(result.move).not.toBeNull();
        expect(areMovesEqual(result.move!, { type: 'horizontal', row: 1, col: 0 })).toBe(true);
    });

    it('Easy difficulty returns a legal move', () => {
        const board = createInitialBoard();
        const move = getBestMove(board, 'player1', 'easy');
        expect(move).not.toBeNull();
        const legal = getLegalMoves(board);
        expect(legal.some((m) => areMovesEqual(m, move!))).toBe(true);
    });

    it('Medium difficulty takes immediate winning captures', () => {
        let board = createInitialBoard();
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
        board = applyMove(board, { type: 'vertical', row: 0, col: 1 });

        const move = getBestMove(board, 'player2', 'medium');
        expect(move).not.toBeNull();
        expect(areMovesEqual(move!, { type: 'horizontal', row: 1, col: 0 })).toBe(true);
    });
    it('simulates chain captures using minimax and extra turns', () => {
        // 1x2 board with 2 boxes: (0, 0) and (0, 1)
        // Edges around (0, 0): top (0,0), left (0,0), right (0,1), bottom (1,0)
        // Edges around (0, 1): top (0,1), left (0,1), right (0,2), bottom (1,1)
        let board = createInitialBoard(1, 2, 'player1');
        // Pre-draw 5 edges, leaving both boxes with 3 edges!
        board = applyMove(board, { type: 'horizontal', row: 0, col: 0 }, 'player1');
        board = applyMove(board, { type: 'vertical', row: 0, col: 0 }, 'player2');
        board = applyMove(board, { type: 'horizontal', row: 0, col: 1 }, 'player1');
        board = applyMove(board, { type: 'vertical', row: 0, col: 2 }, 'player2');
        board = applyMove(board, { type: 'horizontal', row: 1, col: 0 }, 'player1');
        // Remaining open edges:
        // { type: 'vertical', row: 0, col: 1 } (completes both boxes!)
        // { type: 'horizontal', row: 1, col: 1 }
        // AI ('player2') to move.
        board.currentPlayer = 'player2';
        const move = getBestMove(board, 'player2', 'hard');
        expect(move).not.toBeNull();
        // Applying this move should give player2 box (0,0) and an extra turn
        const next = applyMove(board, move!, 'player2');
        expect(getPlayerScore(next, 'player2')).toBeGreaterThanOrEqual(1);
    });
});