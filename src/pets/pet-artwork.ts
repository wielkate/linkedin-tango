import type { PetBreed } from "./pet-breed";

const OUTLINE_COLOR = "#3b2a2a";
const TONGUE_COLOR = "#ef7f8f";
const SVG_OPENING_TAG =
  '<svg class="pet-art" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">';

interface EyeCenter {
  x: number;
  y: number;
}

// The animals are drawn in a 200 x 200 box with the bottom of the picture at the screen edge.
// Anything below y = 200 is hidden behind the edge, so the neck and arms are drawn longer.

// A head with a neck and two paws holding on to the screen edge.
// CSS moves the group "pet-paws" up or down, so the paws stay at the edge however much of the head shows.
export function drawPetHead(breed: PetBreed): string {
  return [
    SVG_OPENING_TAG,
    drawNeck(breed),
    drawEarsBehindHead(breed),
    drawHeadShape(breed),
    drawFloppyEars(breed),
    breed.markings,
    drawMuzzle(breed),
    drawEyes(breed),
    drawNoseAndMouth(breed),
    drawWhiskers(breed),
    drawGrippingPaws(breed),
    "</svg>",
  ].join("");
}

// An arm with an open paw that reaches into the screen and waves.
export function drawReachingPaw(breed: PetBreed): string {
  const { pawColor, padColor } = breed.palette;
  const padScale = breed.species === "dog" ? 1.15 : 1;

  return [
    SVG_OPENING_TAG,
    '<g class="pet-arm">',
    `<path d="M62 260 L62 108 Q62 68 100 68 Q138 68 138 108 L138 260 Z" fill="${pawColor}"/>`,
    `<g fill="${padColor}" transform="translate(100 110) scale(${padScale}) translate(-100 -110)">`,
    '<ellipse cx="100" cy="124" rx="21" ry="17"/>',
    '<ellipse cx="73" cy="101" rx="8" ry="11" transform="rotate(-22 73 101)"/>',
    '<ellipse cx="91" cy="87" rx="8" ry="11"/>',
    '<ellipse cx="109" cy="87" rx="8" ry="11"/>',
    '<ellipse cx="127" cy="101" rx="8" ry="11" transform="rotate(22 127 101)"/>',
    "</g>",
    "</g>",
    "</svg>",
  ].join("");
}

function drawNeck(breed: PetBreed): string {
  return `<path d="M50 130 Q46 260 30 260 L170 260 Q154 260 150 130 Z" fill="${breed.palette.fur}"/>`;
}

function drawEarsBehindHead(breed: PetBreed): string {
  const { earOuter, earInner } = breed.palette;

  if (breed.earShape === "pointed") {
    return [
      `<path d="M36 70 L40 8 L88 40 Z" fill="${earOuter}" stroke="${earOuter}" stroke-width="8" stroke-linejoin="round"/>`,
      `<path d="M164 70 L160 8 L112 40 Z" fill="${earOuter}" stroke="${earOuter}" stroke-width="8" stroke-linejoin="round"/>`,
      `<path d="M48 54 L50 24 L74 42 Z" fill="${earInner}"/>`,
      `<path d="M152 54 L150 24 L126 42 Z" fill="${earInner}"/>`,
    ].join("");
  }

  if (breed.earShape === "erect") {
    return [
      `<path d="M28 80 L36 6 L94 42 Z" fill="${earOuter}" stroke="${earOuter}" stroke-width="8" stroke-linejoin="round"/>`,
      `<path d="M172 80 L164 6 L106 42 Z" fill="${earOuter}" stroke="${earOuter}" stroke-width="8" stroke-linejoin="round"/>`,
      `<path d="M44 62 L46 26 L76 44 Z" fill="${earInner}"/>`,
      `<path d="M156 62 L154 26 L124 44 Z" fill="${earInner}"/>`,
    ].join("");
  }

  return "";
}

function drawHeadShape(breed: PetBreed): string {
  const headIsDog = breed.species === "dog";
  const centerY = headIsDog ? 82 : 86;
  const radiusX = headIsDog ? 58 : 70;
  const radiusY = headIsDog ? 54 : 56;

  return `<ellipse cx="100" cy="${centerY}" rx="${radiusX}" ry="${radiusY}" fill="${breed.palette.fur}"/>`;
}

function drawFloppyEars(breed: PetBreed): string {
  if (breed.earShape !== "floppy") {
    return "";
  }

  const radiusX = 20 * breed.earScale;
  const radiusY = 42 * breed.earScale;
  const centerY = 62 + 22 * breed.earScale;
  const { earOuter } = breed.palette;

  return [
    `<ellipse cx="40" cy="${centerY}" rx="${radiusX}" ry="${radiusY}" transform="rotate(14 40 ${centerY})" fill="${earOuter}"/>`,
    `<ellipse cx="160" cy="${centerY}" rx="${radiusX}" ry="${radiusY}" transform="rotate(-14 160 ${centerY})" fill="${earOuter}"/>`,
  ].join("");
}

function drawMuzzle(breed: PetBreed): string {
  const radiusX = breed.species === "dog" ? 34 : 24;
  const radiusY = breed.species === "dog" ? 27 : 17;

  return `<ellipse cx="100" cy="108" rx="${radiusX}" ry="${radiusY}" fill="${breed.palette.muzzle}"/>`;
}

function getEyeCenters(breed: PetBreed): EyeCenter[] {
  return breed.species === "dog"
    ? [
        { x: 74, y: 76 },
        { x: 126, y: 76 },
      ]
    : [
        { x: 70, y: 80 },
        { x: 130, y: 80 },
      ];
}

// The group "pet-pupils" holds the irises and pupils, so CSS can move them together to look around.
function drawEyes(breed: PetBreed): string {
  const eyeCenters = getEyeCenters(breed);
  const eyeWhites = eyeCenters.map(
    ({ x, y }) =>
      `<ellipse cx="${x}" cy="${y}" rx="15" ry="17" fill="#ffffff" stroke="${OUTLINE_COLOR}" stroke-width="1.5"/>`,
  );
  const irises = eyeCenters.map(({ x, y }) => drawIris(breed, x, y));

  return `<g class="pet-eyes">${eyeWhites.join("")}<g class="pet-pupils">${irises.join("")}</g></g>`;
}

function drawIris(breed: PetBreed, x: number, y: number): string {
  const iris = `<circle cx="${x}" cy="${y}" r="10.5" fill="${breed.palette.eyeColor}"/>`;
  const pupil =
    breed.species === "cat"
      ? `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="9" fill="${OUTLINE_COLOR}"/>`
      : `<circle cx="${x}" cy="${y}" r="5.5" fill="${OUTLINE_COLOR}"/>`;
  const sparkle = `<circle cx="${x + 3}" cy="${y - 3.5}" r="2.2" fill="#ffffff"/>`;

  return iris + pupil + sparkle;
}

function drawNoseAndMouth(breed: PetBreed): string {
  const { nose } = breed.palette;

  if (breed.species === "cat") {
    return [
      `<path d="M92 98 L108 98 L100 108 Z" fill="${nose}" stroke="${nose}" stroke-width="3" stroke-linejoin="round"/>`,
      `<path d="M100 108 L100 114 M100 114 Q92 122 84 114 M100 114 Q108 122 116 114" fill="none" stroke="${OUTLINE_COLOR}" stroke-width="2.5" stroke-linecap="round"/>`,
    ].join("");
  }

  return [
    `<path d="M92 120 Q100 150 108 120 Z" fill="${TONGUE_COLOR}"/>`,
    `<path d="M100 106 L100 116 M100 116 Q90 126 80 118 M100 116 Q110 126 120 118" fill="none" stroke="${OUTLINE_COLOR}" stroke-width="2.5" stroke-linecap="round"/>`,
    `<ellipse cx="100" cy="96" rx="14" ry="10" fill="${nose}"/>`,
    '<ellipse cx="95" cy="92.5" rx="4.5" ry="2.2" fill="#ffffff" opacity="0.45"/>',
  ].join("");
}

function drawWhiskers(breed: PetBreed): string {
  if (breed.species !== "cat") {
    return "";
  }

  return `<g stroke="${breed.palette.whiskerColor}" stroke-width="2" stroke-linecap="round" opacity="0.8" fill="none">
    <path d="M76 106 L36 98"/><path d="M76 111 L34 111"/><path d="M76 116 L38 124"/>
    <path d="M124 106 L164 98"/><path d="M124 111 L166 111"/><path d="M124 116 L162 124"/>
  </g>`;
}

function drawGrippingPaws(breed: PetBreed): string {
  const { pawColor } = breed.palette;
  const pawShape = `<path d="M22 260 L22 146 Q22 126 38 126 Q54 126 54 146 L54 260 Z" fill="${pawColor}"/>
    <path d="M30 132 L30 146 M38 130 L38 146 M46 132 L46 146" stroke="${OUTLINE_COLOR}" stroke-opacity="0.35" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;

  return `<g class="pet-paws">${pawShape}<g transform="translate(124 0)">${pawShape}</g></g>`;
}
