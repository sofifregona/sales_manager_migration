import { useSetSort } from "../../hooks/useSetSort";

export function SortToggle({
  currentSort,
  currentDir,
  name,
  label,
}: {
  currentSort: string;
  currentDir: string;
  name: string;
  label: string;
}) {
  const setSort = useSetSort(); // ? hook dentro del componente
  const active = currentSort === name;
  const ariaSort = active
    ? currentDir === "ASC"
      ? "ascending"
      : "descending"
    : "none";
  const arrow = active ? (currentDir === "ASC" ? " ?" : " ?") : " ?";
  return (
    <th aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => setSort(name, currentSort, currentDir)}
        style={{
          background: "none",
          border: 0,
          cursor: "pointer",
          font: "inherit",
        }}
        aria-label={`Ordenar por ${label}`}
      >
        {label}
        {arrow}
      </button>
    </th>
  );
}
