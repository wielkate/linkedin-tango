const ATTENTION_CLASS_NAME = 'draws-attention';

// Scrolls the element into view when it is off screen, then makes it pulse.
// Players who asked their system for less motion get no scrolling animation and no pulse.
export function drawAttentionTo(element: HTMLElement): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });

  if (prefersReducedMotion) {
    return;
  }

  restartPulse(element);
}

// Removing the class and reading the layout makes the browser start the animation again.
function restartPulse(element: HTMLElement): void {
  element.classList.remove(ATTENTION_CLASS_NAME);
  void element.offsetWidth;
  element.classList.add(ATTENTION_CLASS_NAME);
  element.addEventListener('animationend', () => element.classList.remove(ATTENTION_CLASS_NAME), { once: true });
}
