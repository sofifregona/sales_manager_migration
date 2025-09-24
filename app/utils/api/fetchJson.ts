export async function fetchJson<T = unknown>(
  input: RequestInfo,
  init: RequestInit
): Promise<T> {
<<<<<<< HEAD
  let res: Response;
  try {
    res = await fetch(input, init);
=======
  let response: Response;
  try {
    response = await fetch(input, init);
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
  } catch (error) {
    throw new Error(
      JSON.stringify({
        message: "No se pudo conectar al servidor. Verificá tu conexión.",
        status: 500,
      })
    );
  }

<<<<<<< HEAD
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
=======
  let responseBody: any = {};
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      responseBody = await response.json();
    } catch {}
  }

  if (!response.ok) {
    throw new Error(
      JSON.stringify({
        message: responseBody.message || "Error desconocido",
        status: response.status,
      })
    );
  }
  return responseBody;
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
}
