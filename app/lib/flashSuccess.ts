import type { SuccessFlash, SuccessKind } from "~/types/clientFlash";

export function consumeSuccessFlash(
  flash: Partial<SuccessFlash> | undefined,
  map?: Partial<Record<SuccessKind, string>>
): string | null {
  if (!flash || !flash.kind) return null;
  const k = flash.kind as SuccessKind;
  switch (k) {
    case "created-success":
    case "updated-success":
    case "deleted-success":
    case "reactivated-success":
      return flash.message || map?.[k] || defaultMessage(k);
    default:
      return null;
  }
}

function defaultMessage(kind: SuccessKind): string {
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

