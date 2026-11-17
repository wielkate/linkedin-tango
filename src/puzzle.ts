// 0 = first symbol (CAT), 1 = second symbol (DOG). null = empty.
export type Cell = 0 | 1 | null;
export type Edge = { r1: number; c1: number; r2: number; c2: number; type: '=' | 'x' };

export const SIZE = 6;
export const SYMBOLS = ['🐱', '🐶'] as const;

// One hard-coded puzzle with a unique solution (generated offline).
export const givens: [number, number, 0 | 1][] = [[1, 0, 1], [1, 3, 1], [3, 1, 0]];

export const edges: Edge[] = (
  [
    [0, 5, 1, 5, 'x'], [2, 3, 2, 4, '='], [2, 5, 3, 5, '='], [3, 2, 4, 2, 'x'],
    [4, 1, 4, 2, 'x'], [4, 1, 5, 1, 'x'], [4, 3, 4, 4, '='], [4, 3, 5, 3, 'x'],
  ] as [number, number, number, number, '=' | 'x'][]
).map(([r1, c1, r2, c2, type]) => ({ r1, c1, r2, c2, type }));

/** Returns the set of "r,c" keys that violate a rule (only checks filled cells). */
export function findErrors(b: Cell[][]): Set<string> {
  const bad = new Set<string>();
  const line = (cells: [number, number][]) => {
    const vals = cells.map(([r, c]) => b[r][c]);
    for (const s of [0, 1]) {
      if (vals.filter(v => v === s).length > SIZE / 2) cells.forEach(([r, c]) => b[r][c] === s && bad.add(`${r},${c}`));
    }
    for (let i = 0; i + 2 < SIZE; i++) {
      if (vals[i] !== null && vals[i] === vals[i + 1] && vals[i] === vals[i + 2]) {
        for (let k = 0; k < 3; k++) bad.add(`${cells[i + k][0]},${cells[i + k][1]}`);
      }
    }
  };
  for (let i = 0; i < SIZE; i++) {
    line(Array.from({ length: SIZE }, (_, j) => [i, j] as [number, number]));
    line(Array.from({ length: SIZE }, (_, j) => [j, i] as [number, number]));
  }
  for (const e of edges) {
    const a = b[e.r1][e.c1], c = b[e.r2][e.c2];
    if (a !== null && c !== null && (a === c) !== (e.type === '=')) {
      bad.add(`${e.r1},${e.c1}`); bad.add(`${e.r2},${e.c2}`);
    }
  }
  return bad;
}

export function isSolved(b: Cell[][]): boolean {
  return b.every(row => row.every(v => v !== null)) && findErrors(b).size === 0;
}
