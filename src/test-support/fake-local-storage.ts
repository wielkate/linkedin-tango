// An in-memory stand-in for localStorage, so tests run without a browser.
export class FakeLocalStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

// A localStorage whose every call throws, like a private window with blocked site data.
export class BlockedLocalStorage {
  getItem(): string | null {
    throw new Error("Storage is blocked.");
  }

  setItem(): void {
    throw new Error("Storage is blocked.");
  }
}

export function installLocalStorage(storage: object): void {
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
}
