import { drawPetHead, drawReachingPaw } from "./pet-artwork";
import { ROTATION_DEGREES_BY_EDGE, type PeekPlan } from "./pet-peek-plan";

// Builds the page element for one visit. It starts hidden behind its screen edge.
// The position, size and rotation come from CSS variables, and pets.css does the rest.
export function createPetElement(plan: PeekPlan): HTMLElement {
  const element = document.createElement("div");
  const isPaw = plan.appearance === "paw";

  element.className = `pet pet--${plan.edge} pet--${plan.appearance}`;
  element.setAttribute("aria-hidden", "true");
  element.dataset.breed = plan.breed.name;
  element.style.setProperty("--pet-size", `${plan.sizePixels}px`);
  element.style.setProperty("--pet-position", `${plan.edgePositionFraction}`);
  element.style.setProperty("--pet-shown", `${plan.shownFraction}`);
  element.style.setProperty(
    "--pet-rotation",
    `${ROTATION_DEGREES_BY_EDGE[plan.edge]}deg`,
  );
  element.innerHTML = isPaw
    ? drawReachingPaw(plan.breed)
    : drawPetHead(plan.breed);

  return element;
}

export function pointPupilsAt(
  element: HTMLElement,
  horizontal: number,
  vertical: number,
): void {
  element.style.setProperty("--pet-look-x", `${horizontal}`);
  element.style.setProperty("--pet-look-y", `${vertical}`);
}
