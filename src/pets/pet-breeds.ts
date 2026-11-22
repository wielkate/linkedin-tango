import type { PetBreed } from "./pet-breed";

const DARK_OUTLINE = "#3b2a2a";

function drawTabbyStripes(color: string): string {
  return `<g stroke="${color}" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M100 32 L100 50"/><path d="M84 35 L87 50"/><path d="M116 35 L113 50"/>
    <path d="M34 84 L50 88"/><path d="M34 96 L50 98"/>
    <path d="M166 84 L150 88"/><path d="M166 96 L150 98"/>
  </g>`;
}

function drawWhiteBlaze(color: string): string {
  return `<path d="M100 38 L111 80 Q118 108 100 126 Q82 108 89 80 Z" fill="${color}"/>`;
}

function drawDarkMask(color: string, radiusX: number, radiusY: number): string {
  return `<ellipse cx="100" cy="98" rx="${radiusX}" ry="${radiusY}" fill="${color}"/>`;
}

const HUSKY_MASK = `<path d="M100 56 Q58 58 54 98 Q54 138 100 138 Q146 138 146 98 Q142 58 100 56 Z" fill="#ffffff"/>
  <ellipse cx="74" cy="56" rx="9" ry="5" fill="#5c6570"/>
  <ellipse cx="126" cy="56" rx="9" ry="5" fill="#5c6570"/>`;

const DALMATIAN_SPOTS = `<g fill="#2b2b2b">
  <circle cx="70" cy="46" r="7"/><circle cx="128" cy="42" r="9"/>
  <circle cx="152" cy="76" r="6"/><circle cx="50" cy="68" r="5"/>
  <circle cx="108" cy="56" r="4"/><circle cx="100" cy="132" r="5"/>
</g>`;

export const CAT_BREEDS: PetBreed[] = [
  {
    name: "Tabby cat",
    species: "cat",
    earShape: "pointed",
    earScale: 1,
    palette: {
      fur: "#b08d62",
      earOuter: "#b08d62",
      earInner: "#e8a9a0",
      muzzle: "#efe3cf",
      nose: "#d98585",
      pawColor: "#b08d62",
      padColor: "#e8a9a0",
      eyeColor: "#7bb661",
      whiskerColor: DARK_OUTLINE,
    },
    markings: drawTabbyStripes("#6e5436"),
  },
  {
    name: "Ginger cat",
    species: "cat",
    earShape: "pointed",
    earScale: 1,
    palette: {
      fur: "#e8923f",
      earOuter: "#e8923f",
      earInner: "#f6bfa5",
      muzzle: "#fbe3c4",
      nose: "#e07a7a",
      pawColor: "#e8923f",
      padColor: "#f2a9a0",
      eyeColor: "#d9a520",
      whiskerColor: DARK_OUTLINE,
    },
    markings: drawTabbyStripes("#b8651f"),
  },
  {
    name: "Black cat",
    species: "cat",
    earShape: "pointed",
    earScale: 1,
    palette: {
      fur: "#2b2b33",
      earOuter: "#2b2b33",
      earInner: "#6b4b57",
      muzzle: "#3a3a44",
      nose: "#b86f7a",
      pawColor: "#2b2b33",
      padColor: "#b86f7a",
      eyeColor: "#d6c22a",
      whiskerColor: "#f0f0f0",
    },
    markings: "",
  },
  {
    name: "Siamese cat",
    species: "cat",
    earShape: "pointed",
    earScale: 1,
    palette: {
      fur: "#efe2cc",
      earOuter: "#5a4033",
      earInner: "#8a6a5c",
      muzzle: "#6b4a3a",
      nose: DARK_OUTLINE,
      pawColor: "#6b4a3a",
      padColor: "#3b2a2a",
      eyeColor: "#4aa8e0",
      whiskerColor: "#f5eee0",
    },
    markings: drawDarkMask("#6b4a3a", 38, 32),
  },
  {
    name: "Tuxedo cat",
    species: "cat",
    earShape: "pointed",
    earScale: 1,
    palette: {
      fur: "#2d2d35",
      earOuter: "#2d2d35",
      earInner: "#d99aa0",
      muzzle: "#ffffff",
      nose: "#e59aa0",
      pawColor: "#ffffff",
      padColor: "#e59aa0",
      eyeColor: "#8fc24a",
      whiskerColor: "#9a9aa5",
    },
    markings: drawWhiteBlaze("#ffffff"),
  },
];

export const DOG_BREEDS: PetBreed[] = [
  {
    name: "Beagle",
    species: "dog",
    earShape: "floppy",
    earScale: 1,
    palette: {
      fur: "#b9773a",
      earOuter: "#7a4a24",
      earInner: "#7a4a24",
      muzzle: "#f7efe2",
      nose: "#2b2020",
      pawColor: "#f7efe2",
      padColor: "#3b2a2a",
      eyeColor: "#5b3a1e",
      whiskerColor: DARK_OUTLINE,
    },
    markings: drawWhiteBlaze("#f7efe2"),
  },
  {
    name: "Husky",
    species: "dog",
    earShape: "erect",
    earScale: 1,
    palette: {
      fur: "#7f8996",
      earOuter: "#7f8996",
      earInner: "#f0d7d9",
      muzzle: "#ffffff",
      nose: "#2b2b2b",
      pawColor: "#ffffff",
      padColor: "#3b3b44",
      eyeColor: "#59b4ee",
      whiskerColor: DARK_OUTLINE,
    },
    markings: HUSKY_MASK,
  },
  {
    name: "Corgi",
    species: "dog",
    earShape: "erect",
    earScale: 1,
    palette: {
      fur: "#e39a4b",
      earOuter: "#e39a4b",
      earInner: "#f6cfa8",
      muzzle: "#fff6ea",
      nose: "#2b2020",
      pawColor: "#fff6ea",
      padColor: "#3b2a2a",
      eyeColor: "#4a2f1a",
      whiskerColor: DARK_OUTLINE,
    },
    markings: drawWhiteBlaze("#fff6ea"),
  },
  {
    name: "Dalmatian",
    species: "dog",
    earShape: "floppy",
    earScale: 1,
    palette: {
      fur: "#f6f4ee",
      earOuter: "#2d2d2d",
      earInner: "#2d2d2d",
      muzzle: "#fbfaf6",
      nose: "#2b2b2b",
      pawColor: "#f6f4ee",
      padColor: "#3b3b3b",
      eyeColor: "#6b4423",
      whiskerColor: DARK_OUTLINE,
    },
    markings: DALMATIAN_SPOTS,
  },
  {
    name: "Pug",
    species: "dog",
    earShape: "floppy",
    earScale: 0.7,
    palette: {
      fur: "#d9b88a",
      earOuter: "#3a2e2a",
      earInner: "#3a2e2a",
      muzzle: "#3a2e2a",
      nose: "#15110f",
      pawColor: "#d9b88a",
      padColor: "#3a2e2a",
      eyeColor: "#3a2418",
      whiskerColor: "#e8d9bd",
    },
    markings: drawDarkMask("#3a2e2a", 44, 40),
  },
  {
    name: "Golden retriever",
    species: "dog",
    earShape: "floppy",
    earScale: 1,
    palette: {
      fur: "#e0a944",
      earOuter: "#c98a2b",
      earInner: "#c98a2b",
      muzzle: "#f3d691",
      nose: "#2b2020",
      pawColor: "#e0a944",
      padColor: "#3b2a2a",
      eyeColor: "#5a3a1a",
      whiskerColor: DARK_OUTLINE,
    },
    markings: "",
  },
];

export const PET_BREEDS: PetBreed[] = [...CAT_BREEDS, ...DOG_BREEDS];
