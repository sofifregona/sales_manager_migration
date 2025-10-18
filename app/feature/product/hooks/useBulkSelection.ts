import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useBulkSelection(visibleIds: number[], resetKey?: number | null) {
  const masterRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const previousResetKey = useRef<number | null>(resetKey ?? null);

  useEffect(() => {
    setSelectedIds((prev) => {
      const visible = new Set(visibleIds);
      const filtered = new Set([...prev].filter((id) => visible.has(id)));

      if (previousResetKey.current !== (resetKey ?? null)) {
        previousResetKey.current = resetKey ?? null;
        return new Set();
      }

      return filtered;
    });

    if (masterRef.current) {
      masterRef.current.indeterminate = false;
    }
  }, [visibleIds, resetKey]);

  const toggleAllVisible = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          visibleIds.forEach((id) => next.add(id));
        } else {
          visibleIds.forEach((id) => next.delete(id));
        }
        return next;
      });
    },
    [visibleIds]
  );

  const toggleOne = useCallback((id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const allVisibleSelected = useMemo(
    () => visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id)),
    [selectedIds, visibleIds]
  );

  const someVisibleSelected = useMemo(
    () => !allVisibleSelected && visibleIds.some((id) => selectedIds.has(id)),
    [allVisibleSelected, selectedIds, visibleIds]
  );

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  return {
    masterRef,
    selectedIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleAllVisible,
    toggleOne,
  };
}
