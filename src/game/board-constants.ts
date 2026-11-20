export const BOARD_SIZE = 6;
export const SYMBOLS_PER_LINE = BOARD_SIZE / 2;
export const MAX_ADJACENT_IDENTICAL = 2;
// Three identical symbols in a row break the rules, so this is the shortest forbidden streak.
export const FORBIDDEN_STREAK_LENGTH = MAX_ADJACENT_IDENTICAL + 1;
