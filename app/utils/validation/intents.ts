import { jsonResponse } from "~/lib/http/jsonResponse";

export const CRUD_INTENTS = [
  "create",
  "update",
  "pay",
  "delete",
  "deactivate",
  "reactivate",
  "reactivate-swap",
  "increment",
  "reset-password",
  "close",
] as const;
export type CRUDIntent = (typeof CRUD_INTENTS)[number];

type ParseResult =
  | { ok: true; intent: CRUDIntent }
  | { ok: false; response: Response };

/**
 * Parses and validates an action intent from form data.
 * - Ensures a non-empty string value (422 on missing/type error)
 * - Verifies membership in CRUD_INTENTS (400 on unsupported)
 */
export function parseCRUDIntent(
  value: FormDataEntryValue | null,
  label = "Acción"
): ParseResult {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      ok: false,
      response: jsonResponse(422, {
        error: `(${label}) es requerido y debe ser texto.`,
        source: "client",
      }),
    };
  }

  let normalized = value.trim();

  if (!CRUD_INTENTS.includes(normalized as CRUDIntent)) {
    return {
      ok: false,
      response: jsonResponse(400, {
        error: `(Error) ${label} no soportada.`,
        source: "client",
      }),
    };
  }

  return { ok: true, intent: normalized as CRUDIntent };
}
