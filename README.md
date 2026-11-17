# Tango (LinkedIn-style puzzle)

A minimal browser version of the **Tango** puzzle on a 6×6 grid. This first version has **one hard-coded board**: no progress tracking, no timer.

## Rules

- Fill every cell with 🐱 or 🐶.
- No more than 2 identical symbols may be adjacent, in a row or a column.
- Every row and column contains exactly 3 of each symbol.
- `=` between two cells means they hold the **same** symbol; `×` means **different**.
- The puzzle has exactly one solution. (The "no two identical rows/columns" rule is intentionally **not** applied.)

## How to play

Click an empty cell to cycle: empty → 🐱 → 🐶 → empty. Grey cells are given and locked. Cells that break a rule turn red. A "Solved!" message appears when the grid is complete and valid.

## Tech

TypeScript + Vite, vanilla DOM, no runtime dependencies.

```
src/puzzle.ts   puzzle data (givens + edge hints), rule checking
src/main.ts     rendering and click handling
src/style.css   styling
```

## Develop

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

`vite.config.ts` uses `base: './'`, so the `dist/` folder works on GitHub Pages under `/<repo-name>/`.

## Roadmap

1. Generate all 11,222 valid boards and store them as static data
2. Solver + puzzle generator with unique-solution check
3. Progress tracking (`localStorage`) and timer
4. GitHub Pages deployment via GitHub Actions
