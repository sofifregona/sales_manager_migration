const COOKIE_NAME = "__conflict_extras__";

type AnyRecord = Record<string, unknown>;

export function makeConflictCookie(payload: AnyRecord, maxAgeSeconds = 60): string {
  const value = encodeURIComponent(JSON.stringify(payload));
  // Not HttpOnly so client can consume and clear; path root; short-lived
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAgeSeconds}`;
}

export function readConflictCookie(): AnyRecord | undefined {
  if (typeof document === "undefined") return undefined;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const entry = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return undefined;
  const raw = entry.split("=")[1];
  try {
    return JSON.parse(decodeURIComponent(raw)) as AnyRecord;
  } catch {
    return undefined;
  }
}

export function consumeConflictCookie<T extends AnyRecord = AnyRecord>(): T | undefined {
  const data = readConflictCookie() as T | undefined;
  // Clear cookie
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`;
  }
  return data;
}

