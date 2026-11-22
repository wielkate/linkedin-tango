import { createPetElement, pointPupilsAt } from "./pet-element";
import { PET_BREEDS } from "./pet-breeds";
import {
  pickBetween,
  planPeek,
  type PeekPlan,
  type RandomNumberGenerator,
} from "./pet-peek-plan";

const FIRST_VISIT_DELAY_MILLISECONDS: [number, number] = [3000, 8000];
const DELAY_BETWEEN_VISITS_MILLISECONDS: [number, number] = [5000, 18000];
const RETRY_WHILE_TAB_HIDDEN_MILLISECONDS = 2000;
// Must match the transition time of .pet in pets.css.
const SLIDE_MILLISECONDS = 700;

// Now and then a cat or a dog peeks in from a random edge of the screen, looks around and leaves.
// They sit behind the game and ignore the mouse, so they never get in the way.
export class PetPeeker {
  private isRunning = false;
  private nextVisitTimer: number | undefined;

  constructor(private readonly random: RandomNumberGenerator = Math.random) {}

  start(): void {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.scheduleNextVisit(FIRST_VISIT_DELAY_MILLISECONDS);
  }

  stop(): void {
    this.isRunning = false;
    window.clearTimeout(this.nextVisitTimer);
  }

  private scheduleNextVisit(delayRange: [number, number]): void {
    const delayMilliseconds = pickBetween(this.random, ...delayRange);

    this.nextVisitTimer = window.setTimeout(
      () => void this.visit(),
      delayMilliseconds,
    );
  }

  private async visit(): Promise<void> {
    if (document.hidden) {
      this.nextVisitTimer = window.setTimeout(
        () => void this.visit(),
        RETRY_WHILE_TAB_HIDDEN_MILLISECONDS,
      );
      return;
    }

    const plan = planPeek(
      this.random,
      { widthPixels: window.innerWidth, heightPixels: window.innerHeight },
      PET_BREEDS,
    );
    const element = createPetElement(plan);
    document.body.appendChild(element);

    try {
      await this.peekAndLookAround(element, plan);
    } finally {
      element.remove();
    }

    if (this.isRunning) {
      this.scheduleNextVisit(DELAY_BETWEEN_VISITS_MILLISECONDS);
    }
  }

  private async peekAndLookAround(
    element: HTMLElement,
    plan: PeekPlan,
  ): Promise<void> {
    // Reading the layout lets the browser draw the hidden start before the slide begins.
    void element.offsetWidth;
    element.classList.add("pet--peeking");
    await wait(SLIDE_MILLISECONDS);

    for (const lookTarget of plan.lookTargets) {
      if (!this.isRunning) {
        break;
      }

      pointPupilsAt(element, lookTarget.horizontal, lookTarget.vertical);
      await wait(lookTarget.pauseMilliseconds);
    }

    element.classList.remove("pet--peeking");
    await wait(SLIDE_MILLISECONDS);
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
