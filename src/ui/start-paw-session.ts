const PLAYED_KEY = "tango-start-paw-played";

// The part of sessionStorage that is needed here, so tests can pass in a fake.
export interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// The start animation plays once per browser session (tab), not on every page load.
// Returns true the first time it is asked in a session and remembers that it was.
// When the browser blocks sessionStorage (private window, blocked site data) it cannot
// remember, so the animation plays.
export function claimStartPawPlay(storage: SessionStorageLike): boolean {
  try {
    const hasAlreadyPlayed = storage.getItem(PLAYED_KEY) !== null;

    if (hasAlreadyPlayed) {
      return false;
    }

    storage.setItem(PLAYED_KEY, "true");
  } catch {
    // Nothing can be remembered, so play.
  }

  return true;
}
