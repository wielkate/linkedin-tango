const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

// Counts the time that passed while running. It can be paused and resumed, and is
// frozen for good by stop(). Reading the time costs nothing, the caller decides how
// often to refresh the display.
export class Stopwatch {
  private accumulatedMilliseconds = 0;
  private runningSinceMilliseconds: number | null = Date.now();
  private hasStopped = false;

  restart(): void {
    this.accumulatedMilliseconds = 0;
    this.runningSinceMilliseconds = Date.now();
    this.hasStopped = false;
  }

  pause(): void {
    if (this.runningSinceMilliseconds === null) {
      return;
    }

    this.accumulatedMilliseconds += Date.now() - this.runningSinceMilliseconds;
    this.runningSinceMilliseconds = null;
  }

  resume(): void {
    const canResume = !this.hasStopped && this.runningSinceMilliseconds === null;

    if (canResume) {
      this.runningSinceMilliseconds = Date.now();
    }
  }

  stop(): void {
    this.pause();
    this.hasStopped = true;
  }

  isStopped(): boolean {
    return this.hasStopped;
  }

  isPaused(): boolean {
    return !this.hasStopped && this.runningSinceMilliseconds === null;
  }

  getElapsedSeconds(): number {
    const currentRunMilliseconds =
      this.runningSinceMilliseconds === null ? 0 : Date.now() - this.runningSinceMilliseconds;
    return Math.floor((this.accumulatedMilliseconds + currentRunMilliseconds) / MILLISECONDS_PER_SECOND);
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
