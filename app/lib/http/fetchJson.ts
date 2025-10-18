export async function fetchJson<T = unknown>(
  input: RequestInfo,
  init: RequestInit
): Promise<T> {
  let res: Response;
  try {
    const opts: RequestInit = { credentials: "include", ...init };
    if (typeof window === "undefined") {
      const headers = new Headers(opts.headers || {});
      if (!headers.has("cookie")) {
        try {
          const g: any = globalThis as any;
          const cookie: string | undefined = g.__SSR_COOKIE__;
          if (cookie) headers.set("cookie", cookie);
        } catch {}
      }
      opts.headers = headers;
    }
    res = await fetch(input, opts);
  } catch (error) {
    throw new Error(
      JSON.stringify({
        message: "No se pudo conectar al servidor. Verificá tu conexión.",
        status: 500,
      })
    );
  }

  const contentType = res.headers.get("content-type") || "";
  let resBody: any = {};

  if (contentType.includes("application/json")) {
    try {
      resBody = await res.json();
    } catch (error) {
      resBody = {};
    }
  } else {
    const text = await res.text();
    const match = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    const plain = match ? match[1].trim() : text.trim();
    resBody = { message: plain };
  }

  if (!res.ok) {
    const baseMessage =
      (resBody && resBody.message) ||
      `HTTP ${res.status} en ${typeof input === "string" ? input : "unknown"}`;
    const errPayload: any = {
      message: baseMessage,
      status: res.status,
    };
    if (resBody && typeof resBody === "object") {
      if (resBody.code) errPayload.code = resBody.code;
      if (resBody.details) errPayload.details = resBody.details;
    }
    throw new Error(JSON.stringify(errPayload));
  }

  return resBody as T;
}