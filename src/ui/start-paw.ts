import { drawAttentionTo } from "./draw-attention";
import { calculatePawPath } from "./paw-path";

// Must match --start-paw-size in start-paw.css.
const PAW_SIZE_PIXELS = 56;

// When the page opens, a paw walks in and taps the ⓘ button, so new players find the rules.
// It ignores the mouse, goes away at the first click or key press, and does not appear for
// players who asked their system for less motion.
export function showStartPawPointingAt(infoButton: HTMLElement): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    return;
  }

  const pawElement = createPawElement(infoButton);
  document.body.appendChild(pawElement);

  const removePaw = () => {
    pawElement.remove();
    document.removeEventListener("pointerdown", removePaw);
    document.removeEventListener("keydown", removePaw);
  };

  document.addEventListener("pointerdown", removePaw);
  document.addEventListener("keydown", removePaw);
  pawElement.addEventListener("animationend", () => {
    removePaw();
    drawAttentionTo(infoButton);
  });
}

function createPawElement(infoButton: HTMLElement): HTMLElement {
  const buttonBounds = infoButton.getBoundingClientRect();
  const path = calculatePawPath({
    start: { x: window.innerWidth / 2, y: window.innerHeight * 0.75 },
    targetCenter: {
      x: buttonBounds.left + buttonBounds.width / 2,
      y: buttonBounds.top + buttonBounds.height / 2,
    },
    targetRadiusPixels: Math.max(buttonBounds.width, buttonBounds.height) / 2,
    pawSizePixels: PAW_SIZE_PIXELS,
  });

  const pawElement = document.createElement("div");
  pawElement.className = "start-paw";
  pawElement.setAttribute("aria-hidden", "true");
  pawElement.style.left = `${path.stopCenter.x - PAW_SIZE_PIXELS / 2}px`;
  pawElement.style.top = `${path.stopCenter.y - PAW_SIZE_PIXELS / 2}px`;
  pawElement.style.setProperty("--start-paw-from-x", `${path.startOffset.x}px`);
  pawElement.style.setProperty("--start-paw-from-y", `${path.startOffset.y}px`);
  pawElement.style.setProperty(
    "--start-paw-rotation",
    `${path.rotationDegrees}deg`,
  );
  return pawElement;
}
