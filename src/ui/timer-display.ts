import { formatDuration } from "../utils/format-duration";
import type { Stopwatch } from "./stopwatch";

const CLOCK_EMOJI = "🕒";

// Shows the time of a stopwatch. Call render() whenever the display should refresh.
export class TimerDisplay {
  constructor(
    private readonly timerElement: HTMLElement,
    private readonly stopwatch: Stopwatch,
  ) {}

  render(): void {
    this.timerElement.textContent = `${CLOCK_EMOJI} ${formatDuration(this.stopwatch.getElapsedSeconds())}`;
  }
}
