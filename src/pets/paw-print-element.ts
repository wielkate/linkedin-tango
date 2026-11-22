import { drawPawPrint } from "./paw-print-artwork";
import type { PawPrint, PawPrintTrail } from "./paw-print-trail-plan";

// Builds one page element holding every print of the walk. Each print waits for its turn, shows, then fades
// out, all in CSS (see pets.css), so the whole element only has to be removed when the walk is over.
export function createPawPrintTrailElement(trail: PawPrintTrail): HTMLElement {
  const trailElement = document.createElement("div");
  const printPicture = drawPawPrint(trail.species);

  trailElement.className = "paw-print-trail";
  trailElement.setAttribute("aria-hidden", "true");
  trailElement.style.setProperty("--paw-print-size", `${trail.sizePixels}px`);
  trailElement.style.setProperty(
    "--paw-print-lifetime",
    `${trail.printLifetimeMilliseconds}ms`,
  );

  for (const print of trail.prints) {
    trailElement.appendChild(createPrintElement(print, printPicture));
  }

  return trailElement;
}

function createPrintElement(print: PawPrint, printPicture: string): HTMLElement {
  const printElement = document.createElement("div");

  printElement.className = "paw-print";
  printElement.style.left = `${print.xPixels}px`;
  printElement.style.top = `${print.yPixels}px`;
  printElement.style.setProperty(
    "--paw-print-rotation",
    `${print.rotationDegrees}deg`,
  );
  printElement.style.setProperty(
    "--paw-print-delay",
    `${print.appearAfterMilliseconds}ms`,
  );
  printElement.innerHTML = printPicture;

  return printElement;
}
