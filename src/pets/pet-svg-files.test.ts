import { describe, expect, it } from "vitest";
import { PET_BREEDS } from "./pet-breeds";
import { createPetSvgFiles } from "./pet-svg-files";

describe("createPetSvgFiles", () => {
  it("makes a head, a paw and nothing else for every breed, and two paw prints", () => {
    expect(createPetSvgFiles()).toHaveLength(PET_BREEDS.length * 2 + 2);
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

  it("puts a colour in the paw prints, because no page gives them one", () => {
    const pawPrintFiles = createPetSvgFiles().filter((file) =>
      file.filePath.startsWith("paw-prints/"),
    );

    for (const file of pawPrintFiles) {
      expect(file.content).not.toContain("currentColor");
      expect(file.content).toContain("#8b7a68");
    }
  });

  it("moves the paws of a head down to the bottom of the picture", () => {
    const headFile = createPetSvgFiles().find((file) =>
      file.filePath.startsWith("heads/"),
    );

    expect(headFile?.content).toContain('transform="translate(0 22)"');
  });
});
