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
 // getScores,
  isBoxCompleted,
  isGameOver,
  isValidMove,
}
  from './engine';

describe('Dots and Boxes Engine (engine.ts)', () => {
  it('creates an initial 3x3 board with correct dimensions and properties', () => {
    expect(DEFAULT_GRID_SIZE).toBe(3);
    const board: Board = createInitialBoard();
    expect(board.rows).toBe(DEFAULT_ROWS);
    expect(board.cols).toBe(DEFAULT_COLS);
    expect(board.currentPlayer).toBe('player1');

    // Horizontal edges: (rows + 1) x cols = 4 x 3
    expect(board.hEdges).toHaveLength(4);
    board.hEdges.forEach((row) => {
      expect(row).toHaveLength(3);
      expect(row.every((edge) => edge === false)).toBe(true);
    });

    // Vertical edges: rows x (cols + 1) = 3 x 4
    expect(board.vEdges).toHaveLength(3);
    board.vEdges.forEach((row) => {
      expect(row).toHaveLength(4);
      expect(row.every((edge) => edge === false)).toBe(true);
    });

    // Boxes: rows x cols = 3 x 3
    expect(board.boxes).toHaveLength(3);
    board.boxes.forEach((row) => {
      expect(row).toHaveLength(3);
      expect(row.every((box) => box === null)).toBe(true);
    });
  });
  it('supports custom dimensions and custom starting player', () => {
    const board = createInitialBoard(2, 2, 'red');
    expect(board.rows).toBe(2);
    expect(board.cols).toBe(2);
    expect(board.currentPlayer).toBe('red');
    expect(board.hEdges).toHaveLength(3);
    expect(board.vEdges).toHaveLength(2);
    expect(board.boxes).toHaveLength(2);
  });

  it('returns all 24 legal moves on an empty 3x3 board', () => {
    const board = createInitialBoard();
    const moves = getLegalMoves(board);
    // (4 * 3) horizontal + (3 * 4) vertical = 24
    expect(moves).toHaveLength(24);
    const hMoves = moves.filter((m) => m.type === 'horizontal');
    const vMoves = moves.filter((m) => m.type === 'vertical');
    expect(hMoves).toHaveLength(12);
    expect(vMoves).toHaveLength(12);
  });

  it('correctly reports opponent for different player types', () => {
    expect(getOpponent('player1')).toBe('player2');
    expect(getOpponent('player2')).toBe('player1');
    expect(getOpponent('red')).toBe('blue');
    expect(getOpponent('blue')).toBe('red');
    expect(getOpponent('A')).toBe('B');
    expect(getOpponent('B')).toBe('A');
  });

  it('validates legal and illegal moves', () => {
    const board = createInitialBoard();
    const validH: Move = { type: 'horizontal', row: 0, col: 0 };
    const validV: Move = { type: 'vertical', row: 0, col: 0 };
    expect(isValidMove(board, validH)).toBe(true);
    expect(isValidMove(board, validV)).toBe(true);

    // Out of bounds
    expect(isValidMove(board, { type: 'horizontal', row: 4, col: 0 })).toBe(false);
    expect(isValidMove(board, { type: 'horizontal', row: 0, col: 3 })).toBe(false);
    expect(isValidMove(board, { type: 'vertical', row: 3, col: 0 })).toBe(false);
    expect(isValidMove(board, { type: 'vertical', row: 0, col: 4 })).toBe(false);
    expect(isValidMove(board, { type: 'horizontal', row: -1, col: 0 })).toBe(false);

    // After drawing, move is no longer valid
    const nextBoard = applyMove(board, validH);
    expect(isValidMove(nextBoard, validH)).toBe(false);
  });

  it('applies moves immutably and toggles player turn when no box is completed', () => {
    const board = createInitialBoard();
    const move: Move = { type: 'horizontal', row: 0, col: 0 };
    const nextBoard = applyMove(board, move, 'player1');

    // Original board unchanged
    expect(board.hEdges[0][0]).toBe(false);
    expect(board.currentPlayer).toBe('player1');

    // Next board updated
    expect(nextBoard.hEdges[0][0]).toBe(true);
    expect(nextBoard.currentPlayer).toBe('player2');
  });

  it('throws an error when applying an invalid move', () => {
    const board = createInitialBoard();
    const move: Move = { type: 'horizontal', row: 0, col: 0 };
    const nextBoard = applyMove(board, move);

    // Cannot draw same edge twice
    expect(() => applyMove(nextBoard, move)).toThrow();

    // Cannot draw out of bounds
    expect(() => applyMove(board, { type: 'horizontal', row: 99, col: 99 })).toThrow();
  });

  it('correctly identifies adjacent boxes for edges', () => {

    // Top-left horizontal edge (0, 0) has only box (0, 0) below it
    const topH: Move = { type: 'horizontal', row: 0, col: 0 };
    expect(getAdjacentBoxes(3, 3, topH)).toEqual([[0, 0]]);

    // Internal horizontal edge (1, 0) borders box (0, 0) above and (1, 0) below
    const internalH: Move = { type: 'horizontal', row: 1, col: 0 };
    expect(getAdjacentBoxes(3, 3, internalH)).toEqual([
      [0, 0],
      [1, 0],
    ]);

    // Bottom horizontal edge (3, 0) borders box (2, 0) above
    const bottomH: Move = { type: 'horizontal', row: 3, col: 0 };
    expect(getAdjacentBoxes(3, 3, bottomH)).toEqual([[2, 0]]);
    
    // Left vertical edge (0, 0) borders box (0, 0) to the right
    const leftV: Move = { type: 'vertical', row: 0, col: 0 };
    expect(getAdjacentBoxes(3, 3, leftV)).toEqual([[0, 0]]);
    
    // Internal vertical edge (0, 1) borders box (0, 0) to the left and (0, 1) to the right
    const internalV: Move = { type: 'vertical', row: 0, col: 1 };
    expect(getAdjacentBoxes(3, 3, internalV)).toEqual([
      [0, 0],
      [0, 1],
    ]);

    // Right vertical edge (0, 3) borders box (0, 2) to the left
    const rightV: Move = { type: 'vertical', row: 0, col: 3 };
    expect(getAdjacentBoxes(3, 3, rightV)).toEqual([[0, 2]]);
  });

  it('tracks box edge count and completion status accurately', () => {
    let board = createInitialBoard();
    expect(getBoxEdgeCount(board.hEdges, board.vEdges, 0, 0)).toBe(0);
    expect(isBoxCompleted(board.hEdges, board.vEdges, 0, 0)).toBe(false);

    // Add top edge
    board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
    expect(getBoxEdgeCount(board.hEdges, board.vEdges, 0, 0)).toBe(1);
    // Add left edge
    board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
    expect(getBoxEdgeCount(board.hEdges, board.vEdges, 0, 0)).toBe(2);
    // Add right edge
    board = applyMove(board, { type: 'vertical', row: 0, col: 1 });
    expect(getBoxEdgeCount(board.hEdges, board.vEdges, 0, 0)).toBe(3);
    expect(isBoxCompleted(board.hEdges, board.vEdges, 0, 0)).toBe(false);
    // Add bottom edge to complete the box
    board = applyMove(board, { type: 'horizontal', row: 1, col: 0 });
    expect(getBoxEdgeCount(board.hEdges, board.vEdges, 0, 0)).toBe(4);
    expect(isBoxCompleted(board.hEdges, board.vEdges, 0, 0)).toBe(true);
  });
  it('awards completed box and grants an extra turn to the completing player', () => {
    let board = createInitialBoard();
    
    // Draw 3 sides of box (0, 0)
    board = applyMove(board, { type: 'horizontal', row: 0, col: 0 }); // player1
    board = applyMove(board, { type: 'vertical', row: 0, col: 0 });   // player2
    board = applyMove(board, { type: 'vertical', row: 0, col: 1 });   // player1
    // It is now player2's turn
    expect(board.currentPlayer).toBe('player2');
    expect(board.boxes[0][0]).toBeNull();

    // player2 completes box (0, 0)
    const result = applyMoveWithDetails(board, { type: 'horizontal', row: 1, col: 0 }, 'player2');
    expect(result.completedBoxes).toEqual([[0, 0]]);
    expect(result.extraTurn).toBe(true);
    const nextBoard = result.board;
    expect(nextBoard.boxes[0][0]).toBe('player2');
    
    // player2 keeps the turn!
    expect(nextBoard.currentPlayer).toBe('player2');
    expect(getPlayerScore(nextBoard, 'player2')).toBe(1);
    expect(getPlayerScore(nextBoard, 'player1')).toBe(0);
  });
  it('awards two boxes simultaneously when a shared edge completes both', () => {
    let board = createInitialBoard();
    // Prepare box (0, 0): top (0, 0), left (0, 0), right (0, 1)
    board = applyMove(board, { type: 'horizontal', row: 0, col: 0 });
    board = applyMove(board, { type: 'vertical', row: 0, col: 0 });
    board = applyMove(board, { type: 'vertical', row: 0, col: 1 });
    
    // Prepare box (1, 0): bottom (2, 0), left (1, 0), right (1, 1)
    board = applyMove(board, { type: 'horizontal', row: 2, col: 0 });
    board = applyMove(board, { type: 'vertical', row: 1, col: 0 });
    board = applyMove(board, { type: 'vertical', row: 1, col: 1 });
    
    // Edge { type: 'horizontal', row: 1, col: 0 } is the shared edge between (0, 0) and (1, 0)
    const details = applyMoveWithDetails(board, { type: 'horizontal', row: 1, col: 0 }, 'player1');
    expect(details.completedBoxes).toHaveLength(2);
    expect(details.completedBoxes).toContainEqual([0, 0]);
    expect(details.completedBoxes).toContainEqual([1, 0]);
    expect(details.extraTurn).toBe(true);
    
    expect(details.board.boxes[0][0]).toBe('player1');
    expect(details.board.boxes[1][0]).toBe('player1');
    expect(getPlayerScore(details.board, 'player1')).toBe(2);
    expect(details.board.currentPlayer).toBe('player1');
  });

  it('deep clones the board independently', () => {
    const board = createInitialBoard();
    const clone = cloneBoard(board);
    clone.hEdges[0][0] = true;
    clone.boxes[0][0] = 'player1';
    expect(board.hEdges[0][0]).toBe(false);
    expect(board.boxes[0][0]).toBeNull();
  });
  
  it('reports game ongoing while boxes and moves remain', () => {
    const board = createInitialBoard();
    const result = checkWinner(board);
    expect(result.winner).toBeNull();
    expect(isGameOver(board)).toBe(false);
  });
  
  it('determines the winner when all edges are drawn and all boxes claimed', () => {
    // 1x1 board (1 box, 4 edges)
    let board = createInitialBoard(1, 1, 'player1');
    board = applyMove(board, { type: 'horizontal', row: 0, col: 0 }); // player1 -> player2
    board = applyMove(board, { type: 'vertical', row: 0, col: 0 });   // player2 -> player1
    board = applyMove(board, { type: 'vertical', row: 0, col: 1 });   // player1 -> player2
    board = applyMove(board, { type: 'horizontal', row: 1, col: 0 }); // player2 completes box!
    
    expect(isGameOver(board)).toBe(true);
    const result = checkWinner(board);
    expect(result.winner).toBe('player2');
    expect(result.scores['player2']).toBe(1);
  });

  it('detects a draw when final scores are tied', () => {
    // 1x2 board (2 boxes: (0,0) and (0,1), 7 total edges)
    // Box (0,0): h(0,0), h(1,0), v(0,0), v(0,1)
    // Box (0,1): h(0,1), h(1,1), v(0,1), v(0,2)
    let board = createInitialBoard(1, 2, 'player1');
    
    // Draw non-completing edges:
    board = applyMove(board, { type: 'horizontal', row: 0, col: 0 }, 'player1');
    board = applyMove(board, { type: 'vertical', row: 0, col: 0 }, 'player2');
    board = applyMove(board, { type: 'horizontal', row: 0, col: 1 }, 'player1');
    board = applyMove(board, { type: 'vertical', row: 0, col: 2 }, 'player2');
    board = applyMove(board, { type: 'vertical', row: 0, col: 1 }, 'player1');
    
    // Both boxes now have 3 edges:
    // Box (0,0) needs h(1,0)
    // Box (0,1) needs h(1,1)
    // player2 completes box (0,0)
    board = applyMove(board, { type: 'horizontal', row: 1, col: 0 }, 'player2');
    
    // player2 gets extra turn, completes box (0,1) by playing with player1? Wait:
    // Let player1 complete box (0,1)
    board = applyMove(board, { type: 'horizontal', row: 1, col: 1 }, 'player1');
    
    expect(isGameOver(board)).toBe(true);
    const result = checkWinner(board);
    expect(result.scores['player1']).toBe(1);
    expect(result.scores['player2']).toBe(1);
    expect(result.winner).toBe('draw');
  });

  it('checks areMovesEqual utility function', () => {
    expect(areMovesEqual({ type: 'horizontal', row: 1, col: 2 }, { type: 'H', row: 1, col: 2 })).toBe(true);
    expect(areMovesEqual({ type: 'vertical', row: 0, col: 1 }, { type: 'V', row: 0, col: 1 })).toBe(true);
    expect(areMovesEqual({ type: 'horizontal', row: 1, col: 2 }, { type: 'vertical', row: 1, col: 2 })).toBe(false);
    expect(areMovesEqual({ type: 'horizontal', row: 1, col: 2 }, { type: 'horizontal', row: 1, col: 3 })).toBe(false);
  });
});

