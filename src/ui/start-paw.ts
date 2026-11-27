import { calculateArmPlacement } from "./arm-placement";

// Must match the proportions of cat-forearm.svg, which is 100 units wide: the solid back of the
// paw, below the grooves between the toes, is about 125 units behind the tip of the toes.
const ARM_WIDTH_PIXELS = 96;
const TIP_TO_PAW_CENTER_PIXELS = 120;
const WITHDRAWING_CLASS_NAME = "is-withdrawing";

// When the page opens, a cat's forearm reaches in from the right edge, covers the ⓘ button and
// opens it, so new players find the rules. The arm then withdraws behind the dialog.
// It ignores the mouse, goes away at the first click or key press without opening anything, and
// does not appear for players who asked their system for less motion.
export function showStartPawOpening(infoButton: HTMLElement): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    return;
  }

  const forearmElement = createForearmElement(infoButton);
  document.body.appendChild(forearmElement);

  const removeForearm = () => {
    forearmElement.remove();
    document.removeEventListener("pointerdown", removeForearm);
    document.removeEventListener("keydown", removeForearm);
  };

  const openInfoAndWithdraw = () => {
    infoButton.click();
    forearmElement.classList.add(WITHDRAWING_CLASS_NAME);
  };

  document.addEventListener("pointerdown", removeForearm);
  document.addEventListener("keydown", removeForearm);
  forearmElement.addEventListener("animationend", () => {
    const hasWithdrawn = forearmElement.classList.contains(
      WITHDRAWING_CLASS_NAME,
    );

    if (hasWithdrawn) {
      removeForearm();
    } else {
      openInfoAndWithdraw();
    }
  });
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
