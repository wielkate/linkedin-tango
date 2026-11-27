import { calculateArmPlacement } from "./arm-placement";
import catForearmMarkup from "./cat-forearm.svg?raw";
import { claimStartPawPlay } from "./start-paw-session";

// Must match the proportions of cat-forearm.svg, which is 260 units wide: the solid white back of
// the paw is about 150 units behind the tip of the toes.
const ARM_WIDTH_PIXELS = 110;
const TIP_TO_PAW_CENTER_PIXELS = 65;

// When a session starts, a cat's forearm reaches down from the top edge of the screen, covers the
// ⓘ button for a moment and withdraws, so new players notice the button. It plays once per
// session, ignores the mouse, goes away at the first click or key press, and does not appear for
// players who asked their system for less motion.
export function showStartPawOverInfoButton(infoButton: HTMLElement): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || !claimStartPawPlay(sessionStorage)) {
    return;
  }

  const forearmElement = createForearmElement(infoButton);
  document.body.appendChild(forearmElement);

  const removeForearm = () => {
    forearmElement.remove();
    document.removeEventListener("pointerdown", removeForearm);
    document.removeEventListener("keydown", removeForearm);
  };

  document.addEventListener("pointerdown", removeForearm);
  document.addEventListener("keydown", removeForearm);
  forearmElement.addEventListener("animationend", removeForearm);
}

function createForearmElement(infoButton: HTMLElement): HTMLElement {
  const buttonBounds = infoButton.getBoundingClientRect();
  const placement = calculateArmPlacement({
    buttonCenter: {
      x: buttonBounds.left + buttonBounds.width / 2,
      y: buttonBounds.top + buttonBounds.height / 2,
    },
    viewportWidthPixels: document.documentElement.clientWidth,
    armWidthPixels: ARM_WIDTH_PIXELS,
    tipToPawCenterPixels: TIP_TO_PAW_CENTER_PIXELS,
  });

  const forearmElement = document.createElement("div");
  forearmElement.className = "start-paw";
  forearmElement.setAttribute("aria-hidden", "true");
  forearmElement.innerHTML = catForearmMarkup;
  forearmElement.style.width = `${ARM_WIDTH_PIXELS}px`;
  forearmElement.style.height = `${placement.boxHeightPixels}px`;
  forearmElement.style.left = `${placement.boxLeftPixels}px`;
  forearmElement.style.top = `${placement.boxTopPixels}px`;
  forearmElement.style.setProperty(
    "--start-paw-hidden-distance",
    `${placement.hiddenDistancePixels}px`,
  );
  return forearmElement;
}
