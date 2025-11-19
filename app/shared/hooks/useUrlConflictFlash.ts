import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useClientFlash } from "~/shared/hooks/useClientFlash";

// Builder genérico: decide si hay conflicto, crea el payload y define qué keys limpiar.
export type BuildResult<T> = { payload: T; cleanupKeys: string[] } | null;

export function useUrlConflictFlash<T>(
  scope: string,
  build: (params: URLSearchParams) => BuildResult<T>
) {
  const location = useLocation();
  const navigate = useNavigate();
  const { set } = useClientFlash(scope);
  const lastProcessedSearch = useRef<string | null>(null);
  const lastProcessedSignature = useRef<string | null>(null);

  useEffect(() => {
    if (!location.search) {
      lastProcessedSearch.current = null;
      lastProcessedSignature.current = null;
      return;
    }

    // Evitar reprocesar exactamente la misma query
    if (lastProcessedSearch.current === location.search) return;
    const params = new URLSearchParams(location.search);

    const result = build(params);
    if (!result) return;

    const { payload, cleanupKeys } = result;

    // Construye una firma del conflicto actual (si existe)
    const signature = ["conflict", "code", "elementId"]
      .map((k) => params.get(k) ?? "")
      .join("|");

    // Si ya procesamos esta firma, no repetir
    if (signature && lastProcessedSignature.current === signature) return;
    set(payload as any);

    // Limpia solo las claves indicadas por el builder
    const before = params.toString();
    cleanupKeys.forEach((k) => params.delete(k));
    const after = params.toString();
    if (after !== before) {
      const nextSearch = after ? `?${after}` : "";
      lastProcessedSearch.current = nextSearch;
      lastProcessedSignature.current = signature || null;
      navigate(
        { pathname: location.pathname, search: nextSearch },
        { replace: true }
      );
    } else {
      lastProcessedSearch.current = location.search;
      lastProcessedSignature.current = signature || null;
    }
  }, [location.pathname, location.search, build, navigate, set]);
}
