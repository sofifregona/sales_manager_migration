import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useClientFlash } from "~/shared/hooks/useClientFlash";
import type { ClientFlash, SuccessKind } from "~/types/clientFlash";

export function useCrudSuccess(
  scope: string,
  map?: Partial<Record<SuccessKind, string>>
) {
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<SuccessKind | null>(null);
  const { read, clear } = useClientFlash(scope);
  const location = useLocation();

  useEffect(() => {
    const f = read() as ClientFlash | undefined;
    if (!f || f.scope !== scope) return;
    switch (f.kind) {
      case "created-success":
      case "updated-success":
      case "deactivated-success":
      case "reactivated-success": {
        const k = f.kind as SuccessKind;
        setKind(k);
        setMessage(f.message || map?.[k] || defaultMsg(k));
        // consume only when it's a success to avoid interfering with other consumers
        clear();
        break;
      }
      default:
        // no-op for other flash kinds
        break;
    }
  }, [scope, read, clear, map, location.key]);

  const isSuccess = !!kind;
  return { message, kind, isSuccess };
}

function defaultMsg(kind: SuccessKind): string {
  switch (kind) {
    case "created-success":
      return "Creado con éxito.";
    case "updated-success":
      return "Modificado con éxito.";
    case "deactivated-success":
      return "Desactivado con éxito.";
    case "reactivated-success":
      return "Reactivado con éxito.";
  }
}
