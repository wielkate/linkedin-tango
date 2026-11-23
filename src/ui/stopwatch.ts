const MILLISECONDS_PER_SECOND = 1000;

// Counts the time that passed while running. It can be paused and resumed
export class Stopwatch {
  private accumulatedMilliseconds = 0;
  private runningSinceMilliseconds: number | null = Date.now();
  private hasStopped = false;

  restart(): void {
    this.accumulatedMilliseconds = 0;
    this.runningSinceMilliseconds = Date.now();
    this.hasStopped = false;
  }

  // Shows a time that was measured earlier, frozen like after stop().
  freezeAt(seconds: number): void {
    this.accumulatedMilliseconds = seconds * MILLISECONDS_PER_SECOND;
    this.runningSinceMilliseconds = null;
    this.hasStopped = true;
  }

  pause(): void {
    if (this.runningSinceMilliseconds === null) {
      return;
    }

    this.accumulatedMilliseconds += Date.now() - this.runningSinceMilliseconds;
    this.runningSinceMilliseconds = null;
  }

  resume(): void {
    const canResume =
      !this.hasStopped && this.runningSinceMilliseconds === null;

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

  isRunning(): boolean {
    return this.runningSinceMilliseconds !== null;
  }

  isPaused(): boolean {
    return !this.hasStopped && this.runningSinceMilliseconds === null;
  }

  getElapsedSeconds(): number {
    const currentRunMilliseconds =
      this.runningSinceMilliseconds === null
        ? 0
        : Date.now() - this.runningSinceMilliseconds;
    return Math.floor(
      (this.accumulatedMilliseconds + currentRunMilliseconds) /
        MILLISECONDS_PER_SECOND,
    );
  }
}
