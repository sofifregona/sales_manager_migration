import { getRequestCookie } from "~/lib/http/requestContext.server";

export async function fetchJson<T = unknown>(
  input: RequestInfo,
  init: RequestInit
): Promise<T> {
  let res: Response;
  try {
    const opts: RequestInit = { credentials: "include", ...init };
    const headers = new Headers(opts.headers || {});
    if (!headers.has("cookie")) {
      const cookie = getRequestCookie();
      if (cookie) headers.set("cookie", cookie);
    }
    opts.headers = headers;
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
      (resBody && (resBody as any).message) ||
      `HTTP ${res.status} en ${typeof input === "string" ? input : "unknown"}`;
    const errPayload: any = {
      message: baseMessage,
      status: res.status,
    };
    if (resBody && typeof resBody === "object") {
      if ((resBody as any).code) errPayload.code = (resBody as any).code;
      if ((resBody as any).details) errPayload.details = (resBody as any).details;
    }
    throw new Error(JSON.stringify(errPayload));
  }

  return resBody as T;
}
