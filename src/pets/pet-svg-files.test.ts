import { describe, expect, it } from "vitest";
import { PET_BREEDS } from "./pet-breeds";
import { createPetSvgFiles } from "./pet-svg-files";

describe("createPetSvgFiles", () => {
  it("makes a head, a paw and nothing else for every breed", () => {
    expect(createPetSvgFiles()).toHaveLength(PET_BREEDS.length * 2);
  });

  it("gives every file its own path", () => {
    const filePaths = createPetSvgFiles().map((file) => file.filePath);

    expect(new Set(filePaths).size).toBe(filePaths.length);
  });

  it("names files after the breed", () => {
    const filePaths = createPetSvgFiles().map((file) => file.filePath);

    expect(filePaths).toContain("heads/scottish-fold.svg");
    expect(filePaths).toContain("paws/golden-retriever.svg");
  });

  it("makes every file an image that opens on its own, with a size", () => {
    for (const file of createPetSvgFiles()) {
      expect(file.content.startsWith("<svg width=")).toBe(true);
      expect(file.content).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(file.content.endsWith("</svg>\n")).toBe(true);
    }
  });

  it("moves the paws of a head down to the bottom of the picture", () => {
    const headFile = createPetSvgFiles().find((file) =>
      file.filePath.startsWith("heads/"),
    );

    expect(headFile?.content).toContain('transform="translate(0 22)"');
  });
});
