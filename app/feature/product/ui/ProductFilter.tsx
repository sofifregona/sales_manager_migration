import { Form, useSubmit, useSearchParams } from "react-router";
import type { BrandDTO } from "~/feature/brand/brand";
import type { CategoryDTO } from "~/feature/category/category";
import type { ProviderDTO } from "~/feature/provider/provider";
import sortAlphabetically from "~/utils/sorting/sortAlphabetically";

export default function ListFilter({
  brands,
  categories,
  providers,
  openFilter,
}: {
  brands: BrandDTO[];
  categories: CategoryDTO[];
  providers: ProviderDTO[];
  openFilter: boolean;
}) {
  const submit = useSubmit();
  const [sp] = useSearchParams();
  const includeInactive = sp.get("includeInactive") ?? "";
  return (
    <>
      <Form
        method="get"
        onChange={(e) => submit(e.currentTarget, { replace: true })}
        id="filters"
        className="form-filter"
      >
        {includeInactive && (
          <input type="hidden" name="includeInactive" value={includeInactive} />
        )}
        <input
          name="name"
          className={
            openFilter
              ? "form-pill__input form-pill__input--active filter-input-name"
              : "form-pill__input filter-input-name"
          }
          defaultValue={sp.get("name") ?? ""}
          placeholder="Nombre..."
        />

        <input
          name="code"
          className={
            openFilter
              ? "form-pill__input form-pill__input--active filter-input-code"
              : "form-pill__input filter-input-code"
          }
          defaultValue={sp.get("code") ?? ""}
          placeholder="Código..."
        />

        <input
          name="minPrice"
          className={
            openFilter
              ? "form-pill__input form-pill__input--active filter-input-minPrice"
              : "form-pill__input filter-input-minPrice"
          }
          type="number"
          step="0.01"
          min="0"
          defaultValue={sp.get("minPrice") ?? ""}
          placeholder="Precio mín..."
        />

        <input
          name="maxPrice"
          className={
            openFilter
              ? "form-pill__input form-pill__input--active filter-input-maxPrice"
              : "form-pill__input filter-input-maxPrice"
          }
          type="number"
          step="0.01"
          min="0"
          defaultValue={sp.get("maxPrice") ?? ""}
          placeholder="Precio máx..."
        />

        <select
          name="idProvider"
          className={
            openFilter
              ? "form-pill__input form-pill__input--active form-pill__select filter-input__idProvider"
              : "form-pill__input form-pill__select filter-input__idProvider"
          }
          defaultValue={sp.get("idProvider") ?? ""}
        >
          <option className="form-filter__option all-option" value="">
            Todos los proveedores
          </option>
          <option className="form-filter__option empty-option" value="null">
            — Sin proveedor —
          </option>
          {sortAlphabetically(providers).map((p) => (
            <option
              className="form-filter__option provider-option"
              key={p.id}
              value={p.id}
            >
              {p.name}
            </option>
          ))}
        </select>

        <select
          name="idBrand"
          className={
            openFilter
              ? "form-pill__input form-pill__input--active form-pill__select filter-input__idBrand"
              : "form-pill__input form-pill__select filter-input__idBrand"
          }
          defaultValue={sp.get("idBrand") ?? ""}
        >
          <option className="form-filter__option all-option" value="">
            Todas las marcas
          </option>
          <option className="form-filter__option empty-option" value="null">
            — Sin marca —
          </option>
          {sortAlphabetically(brands).map((b) => (
            <option
              className="form-filter__option brand-option"
              key={b.id}
              value={b.id}
            >
              {b.name}
            </option>
          ))}
        </select>

        <select
          className={
            openFilter
              ? "form-pill__input form-pill__input--active form-pill__select filter-input__idCategory"
              : "form-pill__input form-pill__select filter-input__idCategory"
          }
          name="idCategory"
          defaultValue={sp.get("idCategory") ?? ""}
        >
          <option className="form-filter__option all-option" value="">
            Todas las categorías
          </option>
          <option className="form-filter__option empty-option" value="null">
            — Sin categoría —
          </option>
          {sortAlphabetically(categories).map((c) => (
            <option
              className="form-filter__option category-option"
              key={c.id}
              value={c.id}
            >
              {c.name}
            </option>
          ))}
        </select>
      </Form>
    </>
  );
}
