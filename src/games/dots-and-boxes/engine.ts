export type player = 'player 1' | 'player 2' | 'red' | 'blue' | 'A' | 'B';
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

export function createIntitialBoard(
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