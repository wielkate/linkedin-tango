import './style.css';
import { Cell, SIZE, SYMBOLS, edges, findErrors, givens, isSolved } from './puzzle';

const board: Cell[][] = Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null));
const locked = new Set<string>();
for (const [r, c, v] of givens) { board[r][c] = v; locked.add(`${r},${c}`); }

const boardEl = document.getElementById('board')!;
const statusEl = document.getElementById('status')!;

function render() {
  const errors = findErrors(board);
  boardEl.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const key = `${r},${c}`;
      const el = document.createElement('button');
      el.className = 'cell' + (locked.has(key) ? ' locked' : '') + (errors.has(key) ? ' error' : '');
      el.textContent = board[r][c] === null ? '' : SYMBOLS[board[r][c]!];
      el.tabIndex = locked.has(key) ? -1 : 0;
      el.onclick = () => {
        if (locked.has(key)) return;
        const v = board[r][c];
        board[r][c] = v === null ? 0 : v === 0 ? 1 : null;
        render();
      };
      el.style.gridRow = String(r + 1);
      el.style.gridColumn = String(c + 1);
      boardEl.appendChild(el);
    }
  }
  // Edge markers, positioned on the boundary between two cells.
  for (const e of edges) {
    const m = document.createElement('div');
    m.className = 'edge';
    m.textContent = e.type === '=' ? '=' : '×';
    m.style.left = `calc(${((e.c1 + e.c2 + 1) / 2) / SIZE * 100}%)`;
    m.style.top = `calc(${((e.r1 + e.r2 + 1) / 2) / SIZE * 100}%)`;
    boardEl.appendChild(m);
  }
  statusEl.textContent = isSolved(board) ? '🎉 Solved!' : '';
}

render();
