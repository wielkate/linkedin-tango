import { describe, expect, it } from "vitest";
import { drawPetHead, drawReachingPaw } from "./pet-artwork";
import { CAT_BREEDS, DOG_BREEDS, PET_BREEDS } from "./pet-breeds";

describe("pet breeds", () => {
  it("has several breeds of cats and of dogs", () => {
    expect(CAT_BREEDS.length).toBeGreaterThanOrEqual(4);
    expect(DOG_BREEDS.length).toBeGreaterThanOrEqual(4);
  });

  it("gives every breed its own name", () => {
    const names = PET_BREEDS.map((breed) => breed.name);

    expect(new Set(names).size).toBe(names.length);
  });
});

describe("drawPetHead", () => {
  it.each(PET_BREEDS.map((breed) => [breed.name, breed] as const))(
    "draws a %s with eyes that can look around and paws on the edge",
    (_name, breed) => {
      const svg = drawPetHead(breed);

      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg.endsWith("</svg>")).toBe(true);
      expect(svg).toContain('class="pet-pupils"');
      expect(svg).toContain('class="pet-paws"');
    },
  );

  it("draws a cat with slit pupils and a dog with round pupils", () => {
    expect(drawPetHead(CAT_BREEDS[0])).toContain("<ellipse cx=\"70\" cy=\"80\" rx=\"3.5\"");
    expect(drawPetHead(DOG_BREEDS[0])).toContain("<circle cx=\"74\" cy=\"76\" r=\"5.5\"");
  });

  it("gives a dog a tongue and a cat whiskers", () => {
    expect(drawPetHead(DOG_BREEDS[0])).toContain("#ef7f8f");
    expect(drawPetHead(CAT_BREEDS[0])).toContain("M76 106 L36 98");
    expect(drawPetHead(DOG_BREEDS[0])).not.toContain("M76 106 L36 98");
  });

  it("gives the Scottish Fold small folded ears and grey fur", () => {
    const scottishFold = CAT_BREEDS.find(
      (breed) => breed.name === "Scottish Fold",
    );

    expect(scottishFold?.earShape).toBe("folded");
    expect(scottishFold && drawPetHead(scottishFold)).toContain("M42 50 Q46 26");
    expect(scottishFold?.palette.fur).toBe("#9ba1aa");
  });

  it("makes a pug's floppy ears shorter than a beagle's", () => {
    const beagle = DOG_BREEDS.find((breed) => breed.name === "Beagle");
    const pug = DOG_BREEDS.find((breed) => breed.name === "Pug");

    expect(beagle && drawPetHead(beagle)).toContain('ry="42"');
    expect(pug && drawPetHead(pug)).toContain('ry="29.4"');
  });
});

describe("drawReachingPaw", () => {
  it.each(PET_BREEDS.map((breed) => [breed.name, breed] as const))(
    "draws a waving %s paw with four toes and a pad",
    (_name, breed) => {
      const svg = drawReachingPaw(breed);

      expect(svg).toContain('class="pet-arm"');
      expect(svg.match(/<ellipse/g)).toHaveLength(5);
      expect(svg).toContain(breed.palette.padColor);
    },
  );
});
