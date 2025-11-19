import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type SortDirection = "ASC" | "DESC";

export interface SortKeyConfig<T> {
  key: string;
  getValue(item: T): string | number | boolean | Date | null | undefined;
}

export interface UseQuerySortingConfig<T> {
  keys: readonly SortKeyConfig<T>[];
  defaultKey: SortKeyConfig<T>["key"];
}

function normalizeDirection(raw: string | null): SortDirection {
  return raw?.toUpperCase() === "DESC" ? "DESC" : "ASC";
}

export function useQuerySorting<T>(
  items: readonly T[],
  config: UseQuerySortingConfig<T>
) {
  const [params] = useSearchParams();

  const sortField = params.get("sortField") ?? config.defaultKey;
  const sortKeyConfig =
    config.keys.find((candidate) => candidate.key === sortField) ??
    config.keys.find((candidate) => candidate.key === config.defaultKey) ??
    config.keys[0];

  const sortBy = sortKeyConfig?.key ?? config.defaultKey;
  const sortDir = normalizeDirection(params.get("sortDirection"));

  const sortedItems = useMemo(() => {
    const accessor = sortKeyConfig?.getValue ?? (() => "");
    const safeItems = Array.isArray(items) ? items : [];
    const entries = [...safeItems];

    entries.sort((a, b) => {
      const rawA = accessor(a);
      const rawB = accessor(b);

      if (typeof rawA === "number" && typeof rawB === "number") {
        const cmp = rawA - rawB;
        return sortDir === "ASC" ? cmp : -cmp;
      }

      const valueA = `${rawA ?? ""}`.toLocaleLowerCase();
      const valueB = `${rawB ?? ""}`.toLocaleLowerCase();
      const cmp = valueA.localeCompare(valueB);
      return sortDir === "ASC" ? cmp : -cmp;
    });

    return entries;
  }, [items, sortDir, sortKeyConfig]);

  return {
    sortBy,
    sortDir,
    sortedItems,
  };
}
