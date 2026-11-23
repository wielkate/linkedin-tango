import { configDefaults, defineConfig } from "vitest/config";
import { offlinePlugin } from "./vite-plugins/offline-plugin";

// Vite reads this file whenever you run `npm run dev`, `npm run build` or `npm run preview`.
//
// `base: './'` makes every asset URL in the built index.html relative (./assets/...)
// instead of absolute (/assets/...). GitHub Pages serves a project site from
// https://<user>.github.io/<repo-name>/, so absolute URLs would point to the wrong place
// and fail to load. With a relative base, the same dist/ folder works under any path.
//
// `offlinePlugin()` writes dist/service-worker.js after every build, so the game also works
// without a network once it has been opened once (see "Offline play" in the README).
//
// Every other setting uses Vite's defaults (dev server on port 5173, build output in dist/).
//
// Vitest (`npm test`) reads the `test` block. Coverage counts every file in src/ except the ones
// that need a browser (DOM classes, sound, animation), the entry point, generated data and the
// tests themselves. `npm run test:coverage` fails when coverage drops below 90%.
export default defineConfig({
  base: "./",
  plugins: [offlinePlugin()],
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/test-support/**",
        "src/data/**",
        "src/main.ts",
        "src/board-menu/board-menu.ts",
        "src/board-menu/menu-drawer.ts",
        "src/effects/**",
        "src/pets/pet-element.ts",
        "src/pets/pet-peek.ts",
        "src/pets/visit-scheduler.ts",
        "src/pets/wait.ts",
        "src/offline/register-service-worker.ts",
        "src/hints/hint-note-view.ts",
        "src/ui/board-view.ts",
        "src/ui/difficulty-picker.ts",
        "src/ui/draw-attention.ts",
        "src/ui/game-page.ts",
        "src/ui/info-dialog.ts",
        "src/ui/required-element.ts",
        "src/ui/timer-display.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 90,
      },
    },
  },
});
