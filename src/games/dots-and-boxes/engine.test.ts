import { describe, expect, it } from 'vitest';
import {
    type Board,
    type Move,
    applyMove,
    applyMoveWithDetails,
    areMovesEqual,
    checkWinner,
    cloneBoard,
    createInitialBoard,
    DEFAULT_COLS,
    DEFAULT_GRID_SIZE,
    DEFAULT_ROWS,
    getAdjacentBoxes,
    getBoxEdgeCount,
    getLegalMoves,
    getOpponent,
    getPlayerScore,
    getScores,
    isBoxCompleted,
    isGameOver,
    isValidMove,
}
    from './engine';