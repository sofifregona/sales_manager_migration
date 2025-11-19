import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setSuccessFlash } from "~/shared/flash/actions";
import type { SuccessKind } from "~/types/clientFlash";

/**
 * Reads success flags from URL (?created=1|updated=1|deleted=1|reactivated=1),
 * converts them into a client flash (sessionStorage) and cleans the URL.
 */
export function useUrlSuccessFlash(scope: string) {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location.search) return;
    const params = new URLSearchParams(location.search);

    const mapping: Array<{ key: string; kind: SuccessKind }> = [
      { key: "created", kind: "created-success" },
      { key: "updated", kind: "updated-success" },
      { key: "deactivated", kind: "deactivated-success" },
      { key: "reactivated", kind: "reactivated-success" },      { key: "reseted-password", kind: "reseted-password-success" },
    ];

    const found = mapping.find(({ key }) => params.get(key) === "1");
    if (!found) return;

    setSuccessFlash(scope, found.kind);

    // Clean only our flags, preserve other params (e.g., filters/sorting)
    mapping.forEach(({ key }) => params.delete(key));
    const qs = params.toString();
    navigate(
      { pathname: location.pathname, search: qs ? `?${qs}` : "" },
      {
        replace: true,
      }
    );
  }, [location.pathname, location.search, navigate, scope]);
}


