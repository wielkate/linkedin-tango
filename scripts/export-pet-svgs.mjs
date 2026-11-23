// Writes every animal picture as a separate .svg file into example/pets/, so the pictures
// can be looked at without starting the game: `npm run export:pet-svgs`.
// Vite loads the TypeScript source, so the files always match what the game draws.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const OUTPUT_FOLDER = "example/pets";

const server = await createServer({
  appType: "custom",
  server: { middlewareMode: true },
  logLevel: "error",
});

try {
  const { createPetSvgFiles } = await server.ssrLoadModule(
    "/src/pets/pet-svg-files.ts",
  );

  for (const svgFile of createPetSvgFiles()) {
    const outputPath = path.join(OUTPUT_FOLDER, svgFile.filePath);

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, svgFile.content);
  }
} finally {
  await server.close();
}
