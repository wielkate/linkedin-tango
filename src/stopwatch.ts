const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

// Counts the time since start(); freezes at stop(). Reading the time costs nothing,
// the caller decides how often to refresh the display.
export class Stopwatch {
  private startedAtMilliseconds = Date.now();
  private stoppedAtMilliseconds: number | null = null;

  restart(): void {
    this.startedAtMilliseconds = Date.now();
    this.stoppedAtMilliseconds = null;
  }

  stop(): void {
    if (this.stoppedAtMilliseconds === null) {
      this.stoppedAtMilliseconds = Date.now();
    }
  }

  isRunning(): boolean {
    return this.stoppedAtMilliseconds === null;
  }

  getElapsedSeconds(): number {
    const endMilliseconds = this.stoppedAtMilliseconds ?? Date.now();
    return Math.floor((endMilliseconds - this.startedAtMilliseconds) / MILLISECONDS_PER_SECOND);
  }
}

// 45 -> "45 sec", 83 -> "1 min 23 sec".
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  if (minutes === 0) {
    return `${seconds} sec`;
  }

  return `${minutes} min ${seconds} sec`;
}
