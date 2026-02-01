import { useMemo } from "react";
import type { FetcherWithComponents } from "react-router-dom";
import type { CategoryDTO } from "~/feature/category/category";
import type { ProductDTO } from "~/feature/product/product";
import { normalizeText } from "~/utils/strings/normalizeText";

type Props = {
  products: ProductDTO[];
  categories: CategoryDTO[];
  nameFilter: string;
  code: string;
  selectedCategoryId: number | null | undefined;
  onNameFilterChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSelectCategory: (value: number | null | undefined) => void;
  productFetcher: FetcherWithComponents<any>;
};

export function SaleAddProductFilter({
  products,
  categories,
  nameFilter,
  code,
  selectedCategoryId,
  onNameFilterChange,
  onCodeChange,
  onSelectCategory,
  productFetcher,
}: Props) {
  const normalizedFilter = normalizeText(nameFilter);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        selectedCategoryId === undefined
          ? true
          : selectedCategoryId === null
          ? p.category == null || p.category?.id == null
          : p.category?.id === selectedCategoryId
      )
      .filter((p) => {
        if (normalizedFilter.trim() === "") return true;
        const words = p.normalizedName.split(/[\s-]+/);
        return words.some((w) => w.startsWith(normalizedFilter));
      })
      .filter((p) => {
        if (!code) return true;
        return p.code.toString().startsWith(code.replace(/^0+/, ""));
      });
  }, [products, selectedCategoryId, normalizedFilter, code]);

  return (
    <>
      <div className="filter-products">
        <h2 className="filter-products__title">Buscar producto</h2>
        <div className="filter-products__fields">
          <input
            id="filterName"
            type="text"
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
            placeholder="Buscar por nombre…"
            autoComplete="off"
            className="filter-products__input"
          />

          <input
            id="filterCode"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="Buscar por código..."
            autoComplete="off"
            className="filter-products__input"
          />
        </div>
      </div>

      <div className="search-list">
        <div className="search-list__category">
          <h3 className="search-list__title">Categorías</h3>
          <ul className="search-list__category-ul">
            <li
              key="all"
              onMouseDown={() => onSelectCategory(undefined)}
              className={
                selectedCategoryId === undefined
                  ? "search-list__category-item search-list__category-item--selected"
                  : "search-list__category-item"
              }
            >
              Todos
            </li>
            {categories.map((category) => (
              <li
                key={category.id}
                onMouseDown={() => onSelectCategory(category.id)}
                className={
                  selectedCategoryId === category.id
                    ? "search-list__category-item search-list__category-item--selected"
                    : "search-list__category-item"
                }
              >
                {category.name}
              </li>
            ))}
            <li
              key="other"
              onMouseDown={() => onSelectCategory(null)}
              className={
                selectedCategoryId === null
                  ? "search-list__category-item search-list__category-item--selected"
                  : "search-list__category-item"
              }
            >
              Otros
            </li>
          </ul>
          <input
            name="category"
            type="hidden"
            value={
              selectedCategoryId === undefined || selectedCategoryId === null
                ? ""
                : selectedCategoryId
            }
          />
        </div>
        <div className="search-list__product">
          <h3 className="search-list__title">Productos</h3>
          <div className="search-list__product-wrapper">
            <ul className="search-list__product-ul">
              {filteredProducts.map((p) => (
                <li
                  key={`search-list__product-li-${p.id}`}
                  className="search-list__product-item"
                >
                  <productFetcher.Form method="post" action=".">
                    <input type="hidden" name="_action" value="update" />
                    <button
                      type="submit"
                      name="idProduct"
                      value={String(p.id)}
                      className="search-list__product-btn"
                    >
                      <img
                        className="search-list__product-img"
                        src={p.imageUrl ?? undefined}
                        alt="Sin imagen"
                      />
                      <p className="search-list__product-name">{p.name}</p>
                      <div className="search-list__product-info">
                        <span className="search-list__product-price">
                          $ {p.price.toFixed(2)}
                        </span>
                        <span className="search-list__product-code">
                          ({String(p.code ?? "").padStart(3, "0")})
                        </span>
                      </div>

                      <input type="hidden" name="op" value="add" />
                    </button>
                  </productFetcher.Form>
                </li>
              ))}
              {filteredProducts.length === 0 && (
                <li className="search-list__empty">
                  No hay productos que coincidan.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
