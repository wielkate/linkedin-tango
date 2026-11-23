import { createPawPrintTrailElement } from "./paw-print-element";
import { planPawPrintTrail } from "./paw-print-trail-plan";
import type { RandomNumberGenerator } from "./pet-peek-plan";
import { wait } from "./wait";

// One visit: an invisible cat or dog walks across the screen and leaves a trail of paw prints
// that appear one after another and fade away. The prints are drawn behind everything,
// so they never cover the text, the buttons or the board.
export async function walkPawPrints(
  random: RandomNumberGenerator,
): Promise<void> {
  const trail = planPawPrintTrail(random, {
    widthPixels: window.innerWidth,
    heightPixels: window.innerHeight,
  });
  const trailElement = createPawPrintTrailElement(trail);
  document.body.appendChild(trailElement);

  try {
    await wait(trail.totalMilliseconds);
  } finally {
    trailElement.remove();
  }
}
