import { defineConfig } from 'vite';

// Vite reads this file whenever you run `npm run dev`, `npm run build` or `npm run preview`.
//
// `base: './'` makes every asset URL in the built index.html relative (./assets/...)
// instead of absolute (/assets/...). GitHub Pages serves a project site from
// https://<user>.github.io/<repo-name>/, so absolute URLs would point to the wrong place
// and fail to load. With a relative base, the same dist/ folder works under any path.
//
// Every other setting uses Vite's defaults (dev server on port 5173, build output in dist/).
export default defineConfig({
  base: './',
});
