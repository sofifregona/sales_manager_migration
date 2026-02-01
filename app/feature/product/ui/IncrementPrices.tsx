import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

export default function IncrementForm({
  selectedIds,
}: {
  selectedIds: Set<number>;
}) {
  const incrementFetcher = useFetcher();
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (selectedIds.size === 0) {
      setPercent(0);
    }
  }, [selectedIds]);

  return (
    <>
      <incrementFetcher.Form
        id="incrementForm"
        className="form-incrementPrice"
        method="post"
        action="."
      >
        <label htmlFor="percent" className="label-incrementPrice">
          % a aumentar:
          <input
            form="incrementForm"
            name="percent"
            className="input-incrementPrice"
            type="number"
            step={1}
            value={percent}
            inputMode="numeric"
            pattern="\d+"
            style={{ width: 80, marginLeft: 6 }}
            onChange={(e) => {
              const next = Number(e.target.value);
              setPercent(Number.isNaN(next) ? 0 : next);
            }}
            required
          />
          <input type="hidden" name="_action" value="increment" />
        </label>
        <button
          type="submit"
          form="incrementForm"
          name="intent"
          className="btn incrementPrice-btn"
          value="increase"
          disabled={selectedIds.size === 0}
          onClick={(e) => {
            const fd = new FormData(
              document.getElementById("incrementForm") as HTMLFormElement
            );
            const pct = (fd.get("percent") ?? "").toString().trim();
            if (
              !confirm(
                `¿Está seguro de que desea aplicar ${pct}% a los productos seleccionados?`
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          Aumentar
        </button>
      </incrementFetcher.Form>

      {incrementFetcher.data?.error && (
        <p style={{ color: "red" }}>{incrementFetcher.data.error}</p>
      )}
    </>
  );
}
