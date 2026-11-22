import type { PetSpecies } from "./pet-breed";

const PAW_PRINT_COLOR = "currentColor";
const SVG_OPENING_TAG =
  '<svg class="paw-print-art" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">';

// One paw print, with the toes at the top of the picture. The page turns it to point where the animal walks.
// A cat leaves round toes and a small pad. A dog leaves longer toes, claw dents and a wider pad.
export function drawPawPrint(species: PetSpecies): string {
  const printParts =
    species === "cat" ? drawCatPawPrint() : drawDogPawPrint();

  return `${SVG_OPENING_TAG}<g fill="${PAW_PRINT_COLOR}">${printParts}</g></svg>`;
}

function drawCatPawPrint(): string {
  return [
    '<ellipse cx="50" cy="68" rx="21" ry="16"/>',
    '<ellipse cx="24" cy="47" rx="9" ry="12" transform="rotate(-20 24 47)"/>',
    '<ellipse cx="40" cy="31" rx="9" ry="12" transform="rotate(-6 40 31)"/>',
    '<ellipse cx="60" cy="31" rx="9" ry="12" transform="rotate(6 60 31)"/>',
    '<ellipse cx="76" cy="47" rx="9" ry="12" transform="rotate(20 76 47)"/>',
  ].join("");
}

function drawDogPawPrint(): string {
  return [
    '<path d="M50 50 Q80 56 76 80 Q50 94 24 80 Q20 56 50 50 Z"/>',
    '<ellipse cx="20" cy="44" rx="10" ry="14" transform="rotate(-20 20 44)"/>',
    '<ellipse cx="38" cy="26" rx="10" ry="14" transform="rotate(-6 38 26)"/>',
    '<ellipse cx="62" cy="26" rx="10" ry="14" transform="rotate(6 62 26)"/>',
    '<ellipse cx="80" cy="44" rx="10" ry="14" transform="rotate(20 80 44)"/>',
    '<ellipse cx="38" cy="10" rx="2.5" ry="4"/>',
    '<ellipse cx="62" cy="10" rx="2.5" ry="4"/>',
  ].join("");
}
