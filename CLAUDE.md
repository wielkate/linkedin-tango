# Code style

Rules for all code in this repository (TypeScript, CSS, config files). Follow them when
writing new code and when touching existing code.

## 1. Always use braces for loops and conditions

Use braces even when the body is a single statement.

```ts
// Bad
for (const hint of hints) check(hint);
if (isLocked) return;

// Good
for (const hint of hints) {
  check(hint);
}

if (isLocked) {
  return;
}
```

## 2. Never put a condition and its action on one line

The body always goes on its own lines, inside braces.

```ts
// Bad
if (condition) action;
if (condition) { action; }

// Good
if (condition) {
  action;
}
```

## 3. Use meaningful names, no abbreviations

A name says what the thing is. Do not shorten it, and do not use one-letter names.

| Bad            | Good                      |
| -------------- | ------------------------- |
| `r`, `c`       | `row`, `column`           |
| `vals`         | `values`                  |
| `e`            | `edgeHint`                |
| `b`            | `board`                   |
| `bad`          | `cellKeysBreakingRules`   |

`bad` is the typical mistake: it does not say what is bad. Name the thing and the reason
(`cellKeysBreakingRules`, `isEdgeHintBroken`).

## 4. Follow the Single Responsibility Principle

- One function does one thing, and its name says what.
- When a function needs a comment to explain a block, extract that block into a function
  whose name is the comment.
- Keep the code self-explanatory: a reader should understand it by reading the names,
  without reading the implementation of every helper.
- The same applies to files: rules, rendering, data and wiring live in separate files.

## 5. Extract conditions into a named function or value

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
(`isEdgeHintBroken(board, edgeHint)`).
