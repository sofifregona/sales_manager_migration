// Universal flash helpers: work in browser and are safe on SSR.
// On the client, they use sessionStorage; on the server, they are no-ops.

type FlashPayload = object;

const KEY = "__flash__";

export function setFlash<T extends FlashPayload = FlashPayload>(
  value: T
): void {
  if (typeof window === "undefined") return; // no-op on server
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

export function readFlash<T extends FlashPayload = FlashPayload>():
  | T
  | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function consumeFlash<T extends FlashPayload = FlashPayload>():
  | T
  | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return undefined;
    window.sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function clearFlash(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
