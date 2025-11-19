import { Form, useSubmit, useSearchParams } from "react-router";
import type { BrandDTO } from "~/feature/brand/brand";
import type { CategoryDTO } from "~/feature/category/category";
import type { ProductDTO } from "~/feature/product/product";
import type { ProviderDTO } from "~/feature/provider/provider";

export default function StockEntryListFilter({
  brands,
  categories,
  providers,
}: {
  brands: BrandDTO[];
  categories: CategoryDTO[];
  providers: ProviderDTO[];
}) {
  const submit = useSubmit();
  const [sp] = useSearchParams();
  return (
    <Form
      method="get"
      onChange={(e) => submit(e.currentTarget, { replace: true })}
      id="filters"
    >
      <label>Filtrar por nombre</label>
      <input name="name" defaultValue={sp.get("name") ?? ""} />

      <label>Filtrar por código</label>
      <input name="code" defaultValue={sp.get("code") ?? ""} />

      <label>Seleccionar proveedor</label>
      <select name="idProvider" defaultValue={sp.get("idProvider") ?? ""}>
        <option value="">Todos los proveedores</option>
        <option value="null">— Sin proveedor —</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <label>Seleccionar marca</label>
      <select name="idBrand" defaultValue={sp.get("idBrand") ?? ""}>
        <option value="">Todas las marcas</option>
        <option value="null">— Sin marca —</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <label>Seleccionar categoría</label>
      <select name="idCategory" defaultValue={sp.get("idCategory") ?? ""}>
        <option value="">Todas las categorías</option>
        <option value="null">— Sin categoría —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </Form>
  );
}
