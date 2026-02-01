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
  const [version, setVersion] = useState(0);
  const { read, clear } = useClientFlash(scope);
  const location = useLocation();

  useEffect(() => {
    const flash = read() as ClientFlash | undefined;
    if (!flash || flash.scope !== scope) return;
    switch (flash.kind) {
      case "created-success":
      case "updated-success":
      case "deactivated-success":
      case "deleted-success":
      case "incremented-success":
      case "reactivated-success": {
        const k = flash.kind as SuccessKind;
        setKind(k);
        setMessage(flash.message || map?.[k] || defaultMsg(k));
        setVersion((prev) => prev + 1);
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
  const fallbackMessage = message ?? (kind ? defaultMsg(kind) : null);
  return { message: fallbackMessage, kind, isSuccess, version };
}

function defaultMsg(kind: SuccessKind): string {
  switch (kind) {
    case "created-success":
      return "Creado con éxito.";
    case "updated-success":
      return "Modificado con éxito.";
    case "deactivated-success":
      return "Desactivado con éxito.";
    case "deleted-success":
      return "Eliminado con éxito.";
    case "reactivated-success":
      return "Reactivado con éxito.";
    case "incremented-success":
      return "Incrementados con éxito.";
    case "reseted-password-success":
      return "Contraseña reseteada con éxito";
  }
}
