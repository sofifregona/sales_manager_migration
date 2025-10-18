import type { Flash } from "~/types/flash";

type Parsed = { message?: string; source?: Flash["source"] };

export function buildFlashError(parsed: Parsed): Pick<Flash, "error" | "source"> {
  return {
    error: parsed.message ?? "(Error) Ocurrió un error inesperado.",
    source: parsed.source ?? "server",
  };
}

