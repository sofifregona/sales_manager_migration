import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function useSetSort() {
  const [params, setParams] = useSearchParams();

  return useCallback(
    (sortBy: string, defaultValue: string, defaultDirection: string) => {
      const actualField = params.get("sortField") ?? defaultValue;
      const actualDirection = params.get("sortDirection") ?? defaultDirection;
      const same = actualField === sortBy;
      const nextDir = same && actualDirection === "ASC" ? "DESC" : "ASC";

      const next = new URLSearchParams(params);
      next.set("sortField", sortBy);
      next.set("sortDirection", nextDir);

      setParams(next, { replace: true });
    },
    [params, setParams]
  );
}
