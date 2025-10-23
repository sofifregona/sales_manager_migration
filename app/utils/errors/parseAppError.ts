export type AppError = {
  message: string;
  status?: number;
  source?: "client" | "server";
  code?: string;
  details?: unknown;
};

export function parseAppError(
  error: unknown,
  fallback = "Error desconocido"
): AppError {
  if (error instanceof Error) {
    try {
      console.log("DENTRO DEL PARSE");
      console.log(error.toString());
      const parsed = JSON.parse(error.message) as Partial<AppError>;
      return {
        message: parsed.message ?? fallback,
        status: parsed.status,
        source: parsed.source ?? "server",
        code: parsed.code,
        details: parsed.details,
      };
    } catch {
      return { message: error.message || fallback, source: "server" };
    }
  }
  return { message: fallback, source: "server" };
}
