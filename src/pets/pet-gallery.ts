import "./pets.css";
import "./pet-gallery.css";
import { drawPawPrint } from "./paw-print-artwork";
import { createPetElement, pointPupilsAt } from "./pet-element";
import type { PetAppearance } from "./pet-peek-plan";
import type { PetBreed, PetSpecies } from "./pet-breed";
import { PET_BREEDS } from "./pet-breeds";
import { getRequiredElement } from "../ui/required-element";

const PICTURE_SIZE_PIXELS = 240;
const SHOWN_FRACTION_BY_APPEARANCE: Record<PetAppearance, number> = {
  head: 0.85,
  paw: 0.8,
};

// A page for looking at every animal picture, big and in one place. It is not part of the game:
// open /pets-gallery.html while `npm run dev` is running. Move the mouse over a head to make it look around.
const galleryElement = getRequiredElement("gallery");

galleryElement.appendChild(createHeading("Cats and dogs"));
galleryElement.appendChild(createBreedGrid("head"));
galleryElement.appendChild(createHeading("Reaching paws"));
galleryElement.appendChild(createBreedGrid("paw"));
galleryElement.appendChild(createHeading("Paw prints"));
galleryElement.appendChild(createPawPrintRow());

function createHeading(text: string): HTMLElement {
  const heading = document.createElement("h2");
  heading.textContent = text;
  return heading;
}

function createBreedGrid(appearance: PetAppearance): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "gallery-grid";

  for (const breed of PET_BREEDS) {
    grid.appendChild(createBreedCard(breed, appearance));
  }

  return grid;
}

function createBreedCard(
  breed: PetBreed,
  appearance: PetAppearance,
): HTMLElement {
  const card = document.createElement("figure");
  const stage = document.createElement("div");
  const caption = document.createElement("figcaption");
  const petElement = createPetElement({
    breed,
    appearance,
    edge: "bottom",
    sizePixels: PICTURE_SIZE_PIXELS,
    edgePositionFraction: 0.5,
    shownFraction: SHOWN_FRACTION_BY_APPEARANCE[appearance],
    lookTargets: [],
  });

  card.className = "gallery-card";
  stage.className = "gallery-stage";
  caption.textContent = breed.name;
  petElement.classList.add("pet--peeking");
  stage.appendChild(petElement);
  card.append(stage, caption);
  makePupilsFollowPointer(stage, petElement);

  return card;
}

function makePupilsFollowPointer(
  stage: HTMLElement,
  petElement: HTMLElement,
): void {
  stage.addEventListener("pointermove", (event) => {
    const stageBounds = stage.getBoundingClientRect();
    const horizontal = ((event.clientX - stageBounds.left) / stageBounds.width) * 2 - 1;
    const vertical = ((event.clientY - stageBounds.top) / stageBounds.height) * 2 - 1;

    pointPupilsAt(petElement, horizontal, vertical);
  });
}

function createPawPrintRow(): HTMLElement {
  const row = document.createElement("div");
  const speciesList: PetSpecies[] = ["cat", "dog"];

  row.className = "gallery-grid";

  for (const species of speciesList) {
    const card = document.createElement("figure");
    const picture = document.createElement("div");
    const caption = document.createElement("figcaption");

    card.className = "gallery-card";
    picture.className = "gallery-paw-print";
    picture.innerHTML = drawPawPrint(species);
    caption.textContent = `${species === "cat" ? "Cat" : "Dog"} paw print`;
    card.append(picture, caption);
    row.appendChild(card);
  }

  return row;
}
