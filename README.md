# aiGames — Guide

A website hosting small board games — **Tic Tac Toe**, **Connect 4**, and **Dots and Boxes** — each playable against an AI opponent you write yourself using classic search algorithms (minimax + alpha-beta pruning). No ML libraries, no backend: everything runs client-side in TypeScript.

This guide is the plan to follow while building. Work through it phase by phase; don't skip ahead to Connect 4/Dots and Boxes until Tic Tac Toe is fully working, since every later game reuses the same pattern.

---

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript | Catches game-state bugs (wrong player, invalid move) at compile time — valuable once minimax recursion gets involved. |
| UI | React (Vite) | Fast dev server, component-per-game maps cleanly to the architecture below. |
| AI logic | Plain TypeScript, no libraries | The point of the project is writing minimax yourself. |
| State | React state/hooks per game; no global store needed | Each game is self-contained — a shared store would be an unused abstraction. |
| Styling | Plain CSS or CSS modules | Keep it simple; this isn't the hard part of the project. |
| Deployment | Static hosting (GitHub Pages / Vercel / Netlify) | No backend means no server to run or pay for. |
| Tests | Vitest | Pairs with Vite; use it to test AI logic in isolation from the UI. |

Run everything with `npm create vite@latest aigames -- --template react-ts`.

---

## 2. Project structure

Each game is a **self-contained module**: a pure game-logic file (state, moves, win detection) + a pure AI file (minimax over that state) + one UI component. This keeps games decoupled — adding game #4 later never touches game #1–3's code.

```
src/
  games/
    tic-tac-toe/
      engine.ts       # state shape, applyMove, getLegalMoves, checkWinner
      ai.ts           # minimax using engine.ts
      TicTacToe.tsx   # UI component
      engine.test.ts
      ai.test.ts
    connect-four/
      engine.ts
      ai.ts
      ConnectFour.tsx
      engine.test.ts
      ai.test.ts
    dots-and-boxes/
      engine.ts
      ai.ts
      DotsAndBoxes.tsx
      engine.test.ts
      ai.test.ts
  shared/
    minimax.ts        # generic alpha-beta search, reused by all three ai.ts files
    GameShell.tsx      # common layout: title, difficulty selector, reset button, status text
  App.tsx              # routes/links between the three games
  main.tsx
```

### Why a shared `minimax.ts`

Tic Tac Toe, Connect 4, and Dots and Boxes all reduce to the same search shape: given a state, try legal moves, recurse, pick the best score. Write the generic algorithm once against a small interface, and each game supplies only what's game-specific.

```typescript
// shared/minimax.ts
export interface GameState<Move> {
  isTerminal(): boolean;
  legalMoves(): Move[];
  applyMove(move: Move): GameState<Move>;
  evaluate(maximizingPlayer: boolean): number; // heuristic score if not terminal/full-depth
  currentPlayerIsMaximizing(): boolean;
}

export function alphaBeta<Move>(
  state: GameState<Move>,
  depth: number,
  alpha: number,
  beta: number,
): { score: number; move: Move | null } {
  if (depth === 0 || state.isTerminal()) {
    return { score: state.evaluate(state.currentPlayerIsMaximizing()), move: null };
  }

  const maximizing = state.currentPlayerIsMaximizing();
  let bestMove: Move | null = null;
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const move of state.legalMoves()) {
    const child = state.applyMove(move);
    const { score } = alphaBeta(child, depth - 1, alpha, beta);

    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
    if (maximizing) alpha = Math.max(alpha, bestScore);
    else beta = Math.min(beta, bestScore);
    if (beta <= alpha) break; // prune
  }

  return { score: bestScore, move: bestMove };
}
```

Each game's `ai.ts` just implements `GameState<Move>` around its own board representation and calls `alphaBeta(state, depth, -Infinity, Infinity)`.

---

## 3. Game-by-game AI notes

### Tic Tac Toe — full minimax, no depth limit

State space is tiny (≤9!/(no. of symmetric reductions), well under 10,000 reachable states), so search the whole tree every move — no heuristic evaluation function needed, no depth limit. `evaluate()` only needs to return +1 / -1 / 0 at terminal states.

This makes Tic Tac Toe **unbeatable** by construction — good, that's the expected result. Difficulty levels come later from randomness (see §4), not from weakening the search.

### Connect 4 — depth-limited alpha-beta + heuristic evaluation

Connect 4's full game tree (~4×10^12 states) is too large to search exhaustively in a browser. You need:

1. **Depth limit** (e.g. 4–6 ply for "hard" difficulty, tunable — see §4).
2. **A heuristic `evaluate()`** for non-terminal states at the depth cutoff: count windows of 4 (horizontal/vertical/diagonal) and score by how many are open for each player, weighting center-column control higher (center columns participate in more winning lines).
3. **Move ordering**: try center columns before edge columns. This isn't optional polish — it's what makes alpha-beta pruning actually cut the tree, since better moves tried first prune more branches.
4. Optional once the above works: a **transposition table** (`Map<string, result>` keyed by a serialized board) to avoid re-searching identical positions reached via different move orders.

Represent the board as a `number[6][7]` (0 = empty, 1 = player, 2 = AI) to start — readable and enough for reasonable depths. If depth-6 search is too slow once profiled, switch to bitboards (two `bigint` masks) rather than optimizing prematurely.

### Dots and Boxes — alpha-beta with a chain-aware heuristic

The tricky part isn't the search, it's the **evaluation function**: Dots and Boxes has a "double-cross" strategy (sacrifice a short chain to force your opponent to open a long chain for you) that a naive "count boxes claimed so far" heuristic won't discover unless the search is deep enough to see the sacrifice pay off. For a first pass:

1. State = set of drawn edges + box ownership; a move = drawing one edge.
2. `evaluate()` = (your boxes claimed) − (opponent's boxes claimed), plus a small bonus for *not* being the one who draws the 3rd edge of a box (since that hands the opponent a free box).
3. Depth limit scaled to grid size — a 3×3 box grid (24 edges) is search-feasible fairly deep; a 5×5 grid needs a shallower limit or the move-ordering/pruning above to matter more.

Don't try to hand-code full chain-rule strategy up front — get minimax working with the simple heuristic first, play against it, and only add chain-awareness to `evaluate()` if it's losing in ways that look exploitable.

---

## 4. Difficulty levels

Don't build a separate weaker AI — reuse the same minimax with one parameter:

- **Easy**: shallow depth (or for Tic Tac Toe, occasionally pick a random legal move instead of the best one, e.g. 40% of the time).
- **Medium**: moderate depth, no randomness.
- **Hard**: max feasible depth for the game, no randomness.

This keeps one AI implementation per game instead of three, and reuses everything from §3.

---

## 5. UI plan

- `App.tsx` is a simple menu: three links/cards, one per game.
- Each game component (`TicTacToe.tsx`, etc.) owns its own board state via `useState`, calls into its `ai.ts` for the AI's move (on a slight `setTimeout` delay so the AI's move doesn't feel instant), and renders via a shared `GameShell` for consistent layout (title, difficulty dropdown, status line, reset button).
- Keep the AI call **off the main render path** — compute the move in a `useEffect` triggered by "it's now the AI's turn," not inline during render.
- For Connect 4 at higher depths, if the UI ever noticeably freezes, move `ai.ts`'s search into a Web Worker so it doesn't block the UI thread. Don't do this preemptively — only if you actually observe jank.

---

## 6. Build order (milestones)

Work in this order — each milestone is playable end-to-end before moving on:

1. **Tic Tac Toe engine** (`engine.ts` + `engine.test.ts`): board state, legal moves, win/draw detection. No AI yet — human vs human locally.
2. **Tic Tac Toe AI**: implement `shared/minimax.ts` generically against this game first (simplest case to get the interface right), wire up human vs AI.
3. **Tic Tac Toe UI + difficulty levels**: full playable game, deployed.
4. **Connect 4 engine**: board, legal moves (drop into column), win detection (4-in-a-row in any direction).
5. **Connect 4 AI**: reuse `shared/minimax.ts`; add heuristic `evaluate()`, depth limit, move ordering. Profile before adding a transposition table.
6. **Connect 4 UI**, deployed alongside Tic Tac Toe.
7. **Dots and Boxes engine**: edges/boxes state, legal moves, box-completion + extra-turn rule.
8. **Dots and Boxes AI**: reuse `shared/minimax.ts`; heuristic per §3.
9. **Dots and Boxes UI**, deployed.
10. **Polish pass**: shared nav/menu page, consistent styling, README with rules + how the AI works for each game.

Resist adding a 4th game or a backend until all three of these are done — scope creep here is the main risk to actually finishing.

---

## 7. Testing strategy

- `engine.test.ts` per game: pure logic, no AI — test win detection, illegal-move rejection, draw detection. Fast and exhaustive (easy to enumerate small cases for Tic Tac Toe).
- `ai.test.ts` per game: assert the AI takes an obvious winning move when one is available, and blocks an obvious opponent win — cheap sanity checks that catch minimax sign/whose-turn-it-is bugs, which are the most common bug class in this kind of code.
- For Tic Tac Toe specifically, you can assert the AI never loses across many simulated games (it's small enough to check exhaustively) — that's a strong correctness signal for `shared/minimax.ts` before trusting it in Connect 4.

---

## 8. Deployment

Static build (`npm run build`) → GitHub Pages or Vercel. No environment variables, no server, no database — the whole point of the in-browser architecture in §1.
