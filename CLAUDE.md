# Code style

Rules for all code in this repository (TypeScript, CSS, config files). Follow them when
writing new code and when touching existing code.

## 1. Use meaningful names, no abbreviations

A name says what the thing is. Do not shorten it, and do not use one-letter names.

| Bad      | Good                    |
| -------- | ----------------------- |
| `r`, `c` | `row`, `column`         |
| `vals`   | `values`                |
| `e`      | `edgeHint`              |
| `b`      | `board`                 |
| `bad`    | `cellKeysBreakingRules` |

`bad` is the typical mistake: it does not say what is bad. Name the thing and the reason
(`cellKeysBreakingRules`, `isEdgeHintBroken`).

## 2. Follow the Single Responsibility Principle

- One function does one thing, and its name says what.
- When a function needs a comment to explain a block, extract that block into a function
  whose name is the comment.
- Keep the code self-explanatory: a reader should understand it by reading the names,
  without reading the implementation of every helper.
- The same applies to files: rules, rendering, data and wiring live in separate files.

## 3. Extract conditions into a named function or value

Do not write a complex expression inside `if`. Give the condition a name.

```ts
// Bad
if (firstValue !== null && secondValue !== null && firstValue === secondValue) {
  ...
}

// Good
const areBothCellsFilled = firstValue !== null && secondValue !== null;
const haveSameValue = firstValue === secondValue;

if (areBothCellsFilled && haveSameValue) {
  ...
}
```

When the condition is reused or needs several lines, make it a function
(`edgeHint.isBrokenOn(board)`).

## 4. Use a class only for things that hold state over time

Use a class only for things that hold state over time (game, history, stopwatch, UI widgets).
Keep rule checks, hints and other calculations as pure functions.

# Git workflow

- Keep a linear history: pull with `git pull --rebase`, never create merge commits

# Files

## Classes live in their own files

Put each class in a separate file named after it (`stopwatch.ts`, `board-menu.ts`,
`clue-index.mjs`). Do not hide a class in a file that does something else.

## JSON data files

Format JSON files that hold a long array with **one element per line**, so a diff shows
which element changed and element N is on line N + 1. `scripts/format-json.mjs` does this
for the generated files in `src/data/`; use it (or the same layout) for any new data file.
