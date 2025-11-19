import { Form } from "react-router-dom";
export type SaleGroupBy = "sale" | "product" | "category" | "brand" | "provider";

type Props = {
  startedDate: string;
  finalDate: string;
  groupBy: SaleGroupBy;
  onGroupChange: (value: SaleGroupBy) => void;
  onAutoSubmit: (form: HTMLFormElement) => void;
};

const GROUP_OPTIONS: { value: SaleGroupBy; label: string }[] = [
  { value: "sale", label: "Venta" },
  { value: "product", label: "Producto" },
  { value: "category", label: "Categoría" },
  { value: "brand", label: "Marca" },
  { value: "provider", label: "Proveedor" },
];

export function SaleRegisterFilter({
  startedDate,
  finalDate,
  groupBy,
  onGroupChange,
  onAutoSubmit,
}: Props) {
  return (
    <Form
      method="get"
      onChange={(event) => onAutoSubmit(event.currentTarget)}
      id="filter"
    >
      <label htmlFor="startedDate">Fecha inicial</label>
      <input
        id="startedDate"
        type="date"
        name="startedDate"
        defaultValue={startedDate}
      />

      <label htmlFor="finalDate">Fecha final</label>
      <input
        id="finalDate"
        type="date"
        name="finalDate"
        defaultValue={finalDate}
      />

      <h2>Agrupar</h2>
      <div className="group-by-buttons">
        {GROUP_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="submit"
            className={groupBy === option.value ? "btn btn--active" : "btn"}
            onClick={() => onGroupChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <input type="hidden" name="groupBy" value={groupBy} />
    </Form>
  );
}
