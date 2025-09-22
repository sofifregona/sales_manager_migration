export async function fetchJson<T = unknown>(
  input: RequestInfo,
  init: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (error) {
    throw new Error(
      JSON.stringify({
        message: "No se pudo conectar al servidor. Verificá tu conexión.",
        status: 500,
      })
    );
  }

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
}
