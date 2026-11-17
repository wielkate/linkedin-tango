import { CAT, DOG, type EdgeHint, type GivenCell } from './board';

// One hard-coded puzzle with a unique solution (generated offline).
// Rows and columns are counted from 0, starting at the top-left cell.

export const givenCells: GivenCell[] = [
  { row: 1, column: 0, value: DOG },
  { row: 1, column: 3, value: DOG },
  { row: 3, column: 1, value: CAT },
];

export const edgeHints: EdgeHint[] = [
  {
    first: { row: 0, column: 5 },
    second: { row: 1, column: 5 },
    type: 'different',
  },
  {
    first: { row: 2, column: 3 },
    second: { row: 2, column: 4 },
    type: 'same',
  },
  {
    first: { row: 2, column: 5 },
    second: { row: 3, column: 5 },
    type: 'same',
  },
  {
    first: { row: 3, column: 2 },
    second: { row: 4, column: 2 },
    type: 'different',
  },
  {
    first: { row: 4, column: 1 },
    second: { row: 4, column: 2 },
    type: 'different',
  },
  {
    first: { row: 4, column: 1 },
    second: { row: 5, column: 1 },
    type: 'different',
  },
  {
    first: { row: 4, column: 3 },
    second: { row: 4, column: 4 },
    type: 'same',
  },
  {
    first: { row: 4, column: 3 },
    second: { row: 5, column: 3 },
    type: 'different',
  },
];
