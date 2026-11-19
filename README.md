# Tango (LinkedIn-style puzzle)

A minimal browser version of the **Tango** puzzle on a 6×6 grid. This first version has
**hard-coded boards in three difficulty levels** (easy, medium, hard).

## Rules

- Fill every cell with 🐱 or 🐶.
- No more than 2 identical symbols may be adjacent, in a row or a column.
- Every row and column contains exactly 3 of each symbol.
- `=` between two cells means they hold the **same** symbol; `×` means **different**.
- The puzzle has exactly one solution.
- The "no two identical rows/columns" rule of the original game is intentionally **not** applied.

## How to play

Pick a difficulty above the board (easy has the most clues, hard the fewest). Click a cell to cycle: empty → 🐱 → 🐶 → empty. A stopwatch runs from the moment a board opens and stops when it is solved ("Solved in 1 min 23 sec"). The 💡 button fills in one correct cell and locks it, ⓘ explains the rules, and the progress bar shows the board number and how many levels you have solved (kept in the browser's `localStorage`). Undo takes back the last move and Reset clears the board. Grey cells are given and locked. Cells that
break a rule turn red after one second without a new move. A "Solved!" message appears when the grid is complete and valid.

## Tech stack

- **Node.js 26**: the JavaScript runtime that runs the development tools (Vite, TypeScript)
  on your computer; the game itself runs in the browser.
- **npm**: the package manager that comes with Node.js and installs the tools listed in
  `package.json`.
- **TypeScript**: JavaScript with static types, so mistakes such as a misspelled property
  are caught by the compiler before the game runs.
- **Vite**: a development server that reloads the page when you save a file, and a build tool
  that bundles the project into static files.
- **Vanilla DOM**: the page is built with the browser's own DOM API, with no UI framework.

## Getting started

### 1. Install Node.js and npm

npm is installed together with Node.js. The project needs **Node 26**.

- **Installer:** download Node.js 26 from <https://nodejs.org> and run it.
- **Version manager (recommended):** [nvm](https://github.com/nvm-sh/nvm) on macOS/Linux or
  [nvm-windows](https://github.com/coreybutler/nvm-windows) on Windows lets you switch Node
  versions per project:

  ```bash
  nvm install 26
  nvm use 26
  ```

Check the installation:

```bash
node --version   # must print v26.x.x
npm --version
```

Node 26 is enforced in three places, so a wrong version is caught early:

- `package.json` → `"engines": { "node": "26.x" }` declares the required version.
- `.npmrc` → `engine-strict=true` makes `npm install` fail on any other version.
- `.nvmrc` → tells nvm which version to use (`nvm use` without arguments).

### 2. Install the dependencies and start the game

```bash
npm install
npm run dev
```

Then open the address Vite prints (by default <http://localhost:5173>).

### 3. Commands

| Command | What it does | When to use it |
| --- | --- | --- |
| `npm install` | Downloads every dependency listed in `package.json` into `node_modules/` and updates `package-lock.json` if needed. | Once after cloning, and after changing dependencies. |
| `npm ci` | Installs exactly the versions in `package-lock.json`, deletes `node_modules/` first and never modifies the lock file. | Clean, reproducible installs (also the right choice when the lock file is read-only). |
| `npm run dev` | Starts the Vite development server with hot reload: the page updates whenever you save a source file. Stop it with `Ctrl+C`. | While developing. |
| `npm run build` | First runs `tsc --noEmit` (type-checks all code and writes no files, so type errors stop the build), then `vite build` (bundles the game into static files in `dist/`). | Before publishing, and to check that the types are correct. |
| `npm run preview` | Serves the already built `dist/` folder locally (by default <http://localhost:4173>), exactly as a static host would. | After `npm run build`, to test the production build. |

## Run in WebStorm

1. Open the project folder in WebStorm.
2. Make sure WebStorm uses Node 26: **Settings → Languages & Frameworks → Node.js → Node interpreter**.
3. Run `npm install` once (WebStorm offers this in a banner when it opens `package.json`).
4. Pick the **dev** run configuration in the run widget at the top right and press ▶.

The **dev** configuration is shared through the repository in `.run/dev.run.xml`; it runs `npm run dev`; every saved change appears in the browser (styles update in place, code changes reload the page).

## Project structure

```
linkedin-tango/
├── .run/
│   └── dev.run.xml       WebStorm run configuration that starts `npm run dev`
├── src/
│   ├── controls.css      styling of the difficulty and undo/reset buttons
│   ├── difficulty.ts     difficulty picker buttons
│   ├── board.ts          board model: types, constants and small helpers
│   ├── main.ts           entry point: game state, click handling, status message
│   ├── puzzle.ts         loads and types the puzzles from puzzles.json
│   ├── puzzles.json      the hard-coded puzzles per difficulty: given cells and edge hints
│   ├── hint.ts           picks a cell for the hint button
│   ├── panel.css         styling of the timer, progress bar and info dialog
│   ├── progress.ts       solved levels (localStorage) and the progress bar
│   ├── stopwatch.ts      stopwatch and duration formatting
│   ├── history.ts        change history used by the undo button
│   ├── error-highlight.css  1-second CSS delay before rule violations turn red
│   ├── render.ts         builds the DOM for the board and positions the hints
│   ├── rules.ts          rule checking: which cells break a rule, is the board solved
│   └── style.css         styling
├── .gitattributes        marks package-lock.json as a generated file
├── .gitignore            files Git ignores: node_modules, dist, .idea/
├── .npmrc                npm settings: enforce the Node version
├── .nvmrc                Node version for nvm (26)
├── CLAUDE.md             code style rules (also read by Claude Code)
├── README.md             this file
├── index.html            the page: loads src/main.ts and holds #board and #status
├── package-lock.json     exact dependency versions, generated by npm (do not edit)
├── package.json          project metadata, npm scripts, Node version, dependencies
├── tsconfig.json         TypeScript compiler settings (strict mode)
└── vite.config.ts        Vite configuration (see below)
```

### `vite.config.ts`

Vite reads this file whenever you run `npm run dev`, `npm run build` or `npm run preview`.
It contains one setting, `base: './'`, which makes every asset URL in the built `index.html`
relative (`./assets/...`) instead of absolute (`/assets/...`).

GitHub Pages serves a project site from `https://<user>.github.io/<repo-name>/`. With absolute
URLs the browser would look for the files at `https://<user>.github.io/assets/...` and fail.
With a relative base, the same `dist/` folder works under any path. Everything else uses
Vite's defaults (dev server on port 5173, build output in `dist/`).

### Generated files

`package-lock.json` is generated by npm. Do not edit it by hand: change `package.json` and run
`npm install`, and the changes will be written to the lock file. Git cannot store a read-only
flag, so the file is marked as generated in `.gitattributes` (GitHub collapses it in diffs).
To protect your own copy, make it read-only, and make it writable again when you add a
dependency:

```bash
chmod 444 package-lock.json   # read-only
chmod 644 package-lock.json   # writable again
```

## Code style

The rules are in [CLAUDE.md](CLAUDE.md): braces on every loop and condition, no one-line
conditions, meaningful names, small single-purpose functions, and named conditions.

## Roadmap

1. Generate all 11,222 valid boards and store them as static data
2. Solver + puzzle generator with unique-solution check
3. Progress tracking (`localStorage`) and timer
4. GitHub Pages deployment via GitHub Actions

# Git workflow

- Keep a linear history: pull with `git pull --rebase`, never create merge commits
