import type { BuildResult } from "~/shared/hooks/useUrlConflictFlash";

type ConflictKind = "create-conflict" | "update-conflict";

export function makeReactivableConflictBuilder(
  scope: string,
  reactivableCodes: string[],
  // Estándar: limpiar solo claves mínimas de conflicto; el resto viaja por cookie
  cleanupKeys: string[] = ["conflict", "message", "code", "elementId"]
) {
  return function build(p: URLSearchParams): BuildResult<{
    scope: string;
    kind: ConflictKind;
    message?: string;
    elementId?: number;
    reactivable?: boolean;
  }> {
    const conflict = p.get("conflict");
    if (conflict !== "create" && conflict !== "update") return null;

    const kind: ConflictKind = conflict === "create" ? "create-conflict" : "update-conflict";
    const code = (p.get("code") || "").toUpperCase();
    const reactivable = reactivableCodes.includes(code);

    const elementIdParam = p.get("elementId");
    const elementId = reactivable && elementIdParam != null ? Number(elementIdParam) : undefined;

    const payload = {
      scope,
      kind,
      message: p.get("message") ?? undefined,
      elementId,
      reactivable,
    };

    return { payload, cleanupKeys } as BuildResult<any>;
  };
}
