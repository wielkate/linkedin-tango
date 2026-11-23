import { pickBetween, type RandomNumberGenerator } from "./pet-peek-plan";
import { pickWeightedItem } from "./weighted-choice";

export interface WeightedVisit {
  // A visit with a bigger weight comes more often.
  weight: number;
  // Resolves when the visitor has left and nothing of it is left on the page.
  perform: () => Promise<void>;
}

const FIRST_VISIT_DELAY_MILLISECONDS: [number, number] = [10000, 25000];
// Counted from the moment the previous visitor has left.
const DELAY_BETWEEN_VISITS_MILLISECONDS: [number, number] = [45000, 100000];
const RETRY_WHILE_TAB_HIDDEN_MILLISECONDS = 2000;

// Decides when the next visit happens and who comes. There is one visitor at a time:
// the next delay starts only after the previous visitor has left, so animals and paw prints never mix.
export class VisitScheduler {
  private isRunning = false;
  private nextVisitTimer: number | undefined;

  constructor(
    private readonly random: RandomNumberGenerator,
    private readonly visits: readonly WeightedVisit[],
  ) {}

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
      () => void this.runVisit(),
      delayMilliseconds,
    );
  }

  private async runVisit(): Promise<void> {
    if (document.hidden) {
      this.nextVisitTimer = window.setTimeout(
        () => void this.runVisit(),
        RETRY_WHILE_TAB_HIDDEN_MILLISECONDS,
      );
      return;
    }

    const visit = pickWeightedItem(
      this.random,
      this.visits,
      (candidate) => candidate.weight,
    );

    try {
      await visit.perform();
    } finally {
      if (this.isRunning) {
        this.scheduleNextVisit(DELAY_BETWEEN_VISITS_MILLISECONDS);
      }
    }
  }
}
