import { useSetSort } from "../../hooks/useSetSort";
import { FaSort } from "react-icons/fa6";
import { FaSortDown } from "react-icons/fa6";
import { FaSortUp } from "react-icons/fa6";
import { HiChevronUpDown } from "react-icons/hi2";
import { IoIosArrowRoundUp } from "react-icons/io";
import { IoIosArrowRoundDown } from "react-icons/io";

export function SortToggle({
  currentSort,
  currentDir,
  name,
  label,
  className,
}: {
  currentSort: string;
  currentDir: string;
  name: string;
  label: string;
  className: string;
}) {
  const setSort = useSetSort(); // ? hook dentro del componente
  const active = currentSort === name;
  const ariaSort = active
    ? currentDir === "ASC"
      ? "ascending"
      : "descending"
    : "none";
  const arrow = active ? (
    currentDir === "ASC" ? (
      <IoIosArrowRoundUp className="sort-icon" />
    ) : (
      <IoIosArrowRoundDown className="sort-icon" />
    )
  ) : (
    <HiChevronUpDown className="sort-icon" />
  );
  return (
    <th aria-sort={ariaSort} className={`table__head-th th-${className}`}>
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
        className={`table__sort-btn btn-${className}`}
      >
        {label}
        {arrow}
      </button>
    </th>
  );
}
