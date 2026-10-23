export const ROWS = 6;
export const COLS = 7;

export type Player = 'R' | 'Y';
export type Cell = Player | null;
export type Board = Cell[][];

export type Coord = [number, number];
export type WinningLine = [Coord, Coord, Coord, Coord];

export interface GameResult {
    winner: Player | 'draw' | null;
    line?: WinningLine;
}
/**
 * Precomputes all 69 winning lines of the board
 * 24 Horizontal
 * 21 vertical
 * 12 diagonal down right
 * 12 diagnoanl up right 
 */
export function generatedWinningLines(): WinningLine[] {
    const lines: WinningLine[] = [];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            lines.push([
                [row, col],
                [row, col + 1],
                [row, col + 2],
                [row, col + 3],
            ])
        }
    }
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col < COLS; col++) {
            lines.push([
                [row, col],
                [row + 1, col],
                [row + 2, col],
                [row + 3, col],
            ])
        }
    }
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            lines.push([
                [row, col],
                [row + 1, col + 1],
                [row + 2, col + 2],
                [row + 3, col + 3],
            ])
        }
    }
    for (let row = 3; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            lines.push([
                [row, col],
                [row - 1, col + 1],
                [row - 2, col + 2],
                [row - 3, col + 3],
            ])
        }
    }
    return lines;
}
export const WINNING_LINES: WinningLine[] = generatedWinningLines();

export function createInitialBoard(): Board {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}
export function cloneBoard(board: Board): Board {
    return board.map((row) => [...row]);
}
export function getLegalMoves(board: Board): number[] {
    const legalMoves: number[] = [];
    for (let col = 0; col < COLS; col++) {
        if (board[0][col] === null) {
            legalMoves.push(col);
        }
    }
    return legalMoves;
}
export function isValidMove(board: Board, col: number): boolean {
    return col >= 0 && col < COLS && board[0][col] === null;
}
/**
 * Applies a move to the board for the given player in the specified column.
 * The piece lands in the lowest empty row of that column
 * Throws an error if the column is full or invalid
 */
export function applyMove(board: Board, col: number, player: Player): Board {
    if (col < 0 || col >= COLS) {
        throw new Error(`Invalid column: ${col}`);
    }
    if (board[0][col] !== null) {
        throw new Error(`Column ${col} is full`);
    }

    const nextBoard = cloneBoard(board);
    for (let row = ROWS - 1; row >= 0; row--) {
        if (nextBoard[row][col] === null) {
            nextBoard[row][col] = player;
            return nextBoard;
        }
    }
    throw new Error(`Column ${col} is full`);
}
export function checkWinner(board: Board): GameResult {
    for (const line of WINNING_LINES) {
        const [[r0, c0], [r1, c1], [r2, c2], [r3, c3]] = line;
        const first = board[r0][c0];
        if (
            first !== null &&
            board[r1][c1] === first &&
            board[r2][c2] === first &&
            board[r3][c3] === first
        ) {
            return { winner: first, line };
        }
    }

    if (getLegalMoves(board).length === 0) {
        return { winner: 'draw' };
    }
    return { winner: null };
}
export function isGameOver(board: Board): boolean {
    return checkWinner(board).winner !== null;
}