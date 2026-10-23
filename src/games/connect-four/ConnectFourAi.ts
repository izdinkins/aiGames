import type { GameState } from '../../shared/minimax';
import {
    type Board,
    COLS,
    type Player,
    ROWS,
    WINNING_LINES,
    applyMove,
    checkWinner,
    getLegalMoves,
    isGameOver,
} from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';
/**
 * Columns ordered by preference for move ordering in minimax. Center columns are prioritized to improve pruning efficiency.
 * Searching center columns first increases the likelihood of finding winning moves earlier, allowing for more effective alpha-beta pruning.
 */
export const COLUMN_SEARCH_ORDER = [3, 2, 4, 1, 5, 0, 6];

// Returns legal moves ordered by COLUMN_SEARCH_ORDER
export function getOrderedLegalMoves(board: Board): number[] {
    const legal = getLegalMoves(board);
    const legalSet = new Set(legal);
    return COLUMN_SEARCH_ORDER.filter((col) => legalSet.has(col));
}
/**
 * Heuristic evaluation function
 * Postive scores favor the AI player, negative scores favor the opponent
 */

export function evaluateBoard(board: Board, aiPlayer: Player): number {
    const opponent: Player = aiPlayer === 'R' ? 'Y' : 'R';
    let score = 0;

    const centerCol = Math.floor(COLS / 2);
    for (let row = 0; row < ROWS; row++) {
        if (board[row][centerCol] === aiPlayer) {
            score += 4;
        } else if (board[row][centerCol] === opponent) {
            score -= 4;
        }

        if (board[row][centerCol - 1] === aiPlayer) score += 1;
        else if (board[row][centerCol - 1] === opponent) score -= 1;

        if (board[row][centerCol + 1] === aiPlayer) score += 1;
        else if (board[row][centerCol + 1] === opponent) score -= 1;
    }

    for (const line of WINNING_LINES) {
        let aiCount = 0;
        let opponentCount = 0;
        let emptyCount = 0;

        for (const [r, c] of line) {
            const cell = board[r][c];
            if (cell === aiPlayer) {
                aiCount++;
            } else if (cell == opponent) {
                opponentCount++;
            } else {
                emptyCount++;
            }
        }

        if (aiCount > 0 && opponentCount > 0) {
            continue;
        }
        if (aiCount === 4) {
            score += 100000;
        } else if (aiCount === 3 && emptyCount === 1) {
            score += 50;
        } else if (aiCount === 2 && emptyCount === 2) {
            score += 10;
        }

        if (opponentCount === 4) {
            score -= 100000;
        } else if (opponentCount === 3 && emptyCount === 1) {
            score -= 80;
        } else if (opponentCount === 2 && emptyCount === 2) {
            score -= 10;
        }
    }

    return score;
}
/**
 * Minimax with alpha-beta pruning
 * Depth limited with heuristic evaluation at leaf nodes
 * Move ordering is used to improve pruning efficiency
 * Terminal states are weighted with remaining depth to prefer faster wins and slower losses 
 */ 

export function minimax(
    board: Board,
    depth: number,
    isMaximizing: boolean,
    aiPlayer: Player,
    alpha: number = -Infinity,
    beta: number = Infinity,
): { score: number; move: number | null } {
    const result = checkWinner(board);

    if (result.winner !== null) {
        if (result.winner === aiPlayer) {
            return { score: 100000 - depth, move: null };
        }
        if (result.winner === 'draw') {
            return { score: 0, move: null };
        }
        return { score: -100000 + depth, move: null };
    }

    if (depth === 0) {
        return { score: evaluateBoard(board, aiPlayer), move: null };
    }
    const legalMoves = getOrderedLegalMoves(board);
    if (legalMoves.length === 0) {
        return { score: 0, move: null };
    }

    const opponent: Player = aiPlayer === 'R' ? 'Y' : 'R';
    const currentPlayer: Player = isMaximizing ? aiPlayer : opponent;

    let bestMove: number | null = legalMoves[0];

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (const move of legalMoves) {
            const nextBoard = applyMove(board, move, currentPlayer);
            const { score } = minimax(nextBoard, depth - 1, false, aiPlayer, alpha, beta);
            if (score > maxScore) {
                maxScore = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, maxScore);
            if (beta <= alpha) {
                break; // Alpha-beta cutoff
            }
        }
        return { score: maxScore, move: bestMove };
    } else {
        let minScore = Infinity;
        for (const move of legalMoves) {
            const nextBoard = applyMove(board, move, currentPlayer);
            const { score } = minimax(nextBoard, depth - 1, true, aiPlayer, alpha, beta);
            if (score < minScore) {
                minScore = score;
                bestMove = move;
            }
            beta = Math.min(beta, minScore);
            if (beta <= alpha) {
                break; // Alpha-beta cutoff
            }
        }
        return { score: minScore, move: bestMove };
    }
}
// Computes the best move for the AI player given the current board state and difficulty level
export function getBestMove(
    board: Board, 
    aiPlayer: Player, 
    difficulty: Difficulty = 'hard', 
): number | null {
    const legalMoves = getLegalMoves(board);
    if (legalMoves.length === 0) {
        return null;
    }
    
    // Easy: Randomly choose a move 50% of the time, otherwise use minimax with depth 2
    if (difficulty === 'easy') {
        if (Math.random() < 0.5) {
            const randomIndex = Math.floor(Math.random() * legalMoves.length);
            return legalMoves[randomIndex];
        }
        return minimax(board, 2, true, aiPlayer).move ?? legalMoves[0];
    } 
    // Medium: Use minimax with depth 4
    if (difficulty === 'medium') {
        return minimax(board, 4, true, aiPlayer).move ?? legalMoves[0];
    }
    //Hard: Use minimax with depth 6
    return minimax(board, 6, true, aiPlayer).move ?? legalMoves[0];
}

export class ConnectFourGameState implements GameState<number> {
    board: Board;
    currentPlayer: Player;
    aiPlayer: Player;
    depth: number;

    constructor(board: Board, currentPlayer: Player, aiPlayer: Player, depth: number = 0) {
        this.board = board;
        this.currentPlayer = currentPlayer;
        this.aiPlayer = aiPlayer;
        this.depth = depth;
    }
    isTerminal(): boolean {
        return isGameOver(this.board);
    }
    legalMoves(): number[] {
        return getOrderedLegalMoves(this.board);
    }
    applyMove(move: number): ConnectFourGameState {
        const nextBoard = applyMove(this.board, move, this.currentPlayer);
        const nextPlayer: Player = this.currentPlayer === 'R' ? 'Y' : 'R';
        return new ConnectFourGameState(nextBoard, nextPlayer, this.aiPlayer, this.depth + 1);
    }
    currentPlayerIsMaximizing(): boolean {
        return this.currentPlayer === this.aiPlayer;
    }
    evaluate(): number {
        const { winner } = checkWinner(this.board);
        if (winner === this.aiPlayer) return 100000 - this.depth;
        if (winner !== null && winner !== 'draw') return -100000 + this.depth;
        if (winner === 'draw') return 0;
        return evaluateBoard(this.board, this.aiPlayer);
    }
}
