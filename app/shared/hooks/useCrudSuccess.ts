import { useEffect, useState } from "react";
import { useClientFlash } from "~/shared/hooks/useClientFlash";
import type { ClientFlash, SuccessKind } from "~/types/clientFlash";

export function useCrudSuccess(
  scope: string,
  map?: Partial<Record<SuccessKind, string>>
) {
  const [message, setMessage] = useState<string | null>(null);
  const { consume } = useClientFlash(scope);

  useEffect(() => {
    const f = consume() as ClientFlash | undefined;
    if (!f || f.scope !== scope) return;
    switch (f.kind) {
      case "created-success":
      case "updated-success":
      case "deleted-success":
      case "reactivated-success": {
        const kind = f.kind as SuccessKind;
        setMessage(f.message || map?.[kind] || defaultMsg(kind));
        break;
      }
    }
  }, [scope, consume, map]);

  return { message };
}

function defaultMsg(kind: SuccessKind): string {
  switch (kind) {
    case "created-success":
      return "Creado con éxito.";
    case "updated-success":
      return "Modificado con éxito.";
    case "deleted-success":
      return "Eliminado con éxito.";
    case "reactivated-success":
      return "Reactivado con éxito.";
  }
}

