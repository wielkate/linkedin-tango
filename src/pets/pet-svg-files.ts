import { drawPawPrint } from "./paw-print-artwork";
import { drawPetHead, drawReachingPaw } from "./pet-artwork";
import type { PetBreed, PetSpecies } from "./pet-breed";
import { PET_BREEDS } from "./pet-breeds";

export interface PetSvgFile {
  // The path inside the output folder, for example "heads/tabby-cat.svg".
  filePath: string;
  content: string;
}

const VIEWED_SIZE_PIXELS = 400;
const PAW_PRINT_COLOR = "#8b7a68";
// How far the paws of a head move down to sit at the bottom of the picture. The page does this in CSS.
const GRIPPING_PAWS_SHIFT = 22;

// Every animal picture as a file that opens on its own in a browser or an image viewer.
export function createPetSvgFiles(): PetSvgFile[] {
  const breedFiles = PET_BREEDS.flatMap((breed) => [
    {
      filePath: `heads/${toFileName(breed)}.svg`,
      content: makeStandalone(drawPetHead(breed)).replace(
        'class="pet-paws"',
        `class="pet-paws" transform="translate(0 ${GRIPPING_PAWS_SHIFT})"`,
      ),
    },
    {
      filePath: `paws/${toFileName(breed)}.svg`,
      content: makeStandalone(drawReachingPaw(breed)),
    },
  ]);
  const speciesList: PetSpecies[] = ["cat", "dog"];
  const pawPrintFiles = speciesList.map((species) => ({
    filePath: `paw-prints/${species}.svg`,
    content: makeStandalone(drawPawPrint(species)).replaceAll(
      "currentColor",
      PAW_PRINT_COLOR,
    ),
  }));

  return [...breedFiles, ...pawPrintFiles];
}

function toFileName(breed: PetBreed): string {
  return breed.name.toLowerCase().replaceAll(" ", "-");
}

// The pictures have no size of their own, so a viewer would stretch them over the whole window.
function makeStandalone(svg: string): string {
  return `${svg.replace("<svg ", `<svg width="${VIEWED_SIZE_PIXELS}" height="${VIEWED_SIZE_PIXELS}" `)}\n`;
}
