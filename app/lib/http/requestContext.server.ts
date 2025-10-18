import { AsyncLocalStorage } from "node:async_hooks";

type Store = {
  cookie?: string;
};

const als = new AsyncLocalStorage<Store>();

export function runWithRequest<T>(request: Request, fn: () => T | Promise<T>) {
  const cookie = request.headers.get("cookie") || undefined;
  const store: Store = { cookie };
  return als.run(store, fn);
}

export function getRequestCookie(): string | undefined {
  const store = als.getStore();
  return store?.cookie;
}

