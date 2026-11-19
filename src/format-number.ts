const NON_BREAKING_SPACE = '\u00A0';

// 1000 -> "1 000", 11222 -> "11 222". The space does not break across lines.
export function formatNumberWithSpaces(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, NON_BREAKING_SPACE);
}
