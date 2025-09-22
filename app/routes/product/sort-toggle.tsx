import { useSubmit, useSearchParams } from "react-router";

export function SortToggle({
  field,
  label,
}: {
  field: string;
  label?: string;
}) {
  const submit = useSubmit();
  const [sp] = useSearchParams();
  const currField = sp.get("sortField") ?? "name";
  const currDir = (sp.get("sortDirection") ?? "ASC").toUpperCase();
  const isActive = currField === field;
  const nextDir = isActive && currDir === "ASC" ? "DESC" : "ASC";
  const icon = isActive ? (currDir === "ASC" ? "▲" : "▼") : "↕";

  return (
    <button
      type="button" // no envía el form por sí solo
      onClick={() => {
        // al click:
        const form = document.getElementById("filters") as HTMLFormElement;
        (form.elements.namedItem("sortField") as HTMLInputElement).value =
          field;
        (form.elements.namedItem("sortDirection") as HTMLInputElement).value =
          nextDir;
        submit(form, { replace: true });
      }}
      style={{ marginLeft: 8 }}
      title={`Ordenar por ${field} (${nextDir})`}
    >
      {label ?? "Ordenar"} {icon}
    </button>
  );
}
