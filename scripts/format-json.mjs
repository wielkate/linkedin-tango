// Writes a JSON array with one element per line, so a diff shows which board changed
// and a reader can find board N on line N + 1.
export function formatAsJsonWithOneElementPerLine(elements) {
  const lines = elements.map((element) => `  ${JSON.stringify(element)}`);
  return `[\n${lines.join(",\n")}\n]\n`;
}
