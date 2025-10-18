import { Form, useSubmit, useSearchParams } from "react-router";
import { formatDateTime } from "~/utils/formatters/formatDateTime";

export default function MovementFilter() {
  const submit = useSubmit();
  const [sp] = useSearchParams();

  const today = formatDateTime(new Date(), "yyyy-mm-dd");
  return (
    <Form
      method="get"
      onChange={(e) => submit(e.currentTarget, { replace: true })}
      id="filter"
    >
      <label htmlFor="startedDate">Fecha inicial</label>
      <input
        id="startedDate"
        type="date"
        name="startedDate"
        defaultValue={sp.get("startedDate") ?? today}
      />
      <label htmlFor="finalDate">Fecha final</label>
      <input
        id="finalDate"
        type="date"
        name="finalDate"
        defaultValue={sp.get("finalDate") ?? today}
      />
    </Form>
  );
}
