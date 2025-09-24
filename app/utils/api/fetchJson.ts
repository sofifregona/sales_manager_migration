export async function fetchJson<T = unknown>(
  input: RequestInfo,
  init: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (error) {
    throw new Error(
      JSON.stringify({
        message: "No se pudo conectar al servidor. Verificá tu conexión.",
        status: 500,
      })
    );
  }

  const raw = await res.text();

  let resBody: any = {};
  if (raw) {
    try {
      resBody = JSON.parse(raw);
    } catch {
      /* no era JSON, mantenemos raw */
    }
  }
  if (!res.ok) {
    const message =
      resBody?.message ||
      raw?.trim() || // ej. "Cannot GET /api/sales"
      `${res.status} ${res.statusText}` ||
      "Error desconocido";

    throw new Error(
      JSON.stringify({
        message,
        status: res.status,
      })
    );
  }

  // 204/empty → {}
  return raw ? (resBody as T) : ({} as T);
}
