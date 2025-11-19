import type { FetcherWithComponents } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa";
import type { ProductSoldDTO } from "~/feature/sale/types/productSold";

type Props = {
  items: ProductSoldDTO[];
  total: number;
  productFetcher: FetcherWithComponents<any>;
};

export function SaleAddedProductsList({ items, total, productFetcher }: Props) {
  return (
    <>
      <h2 className="added-products__title">Productos agregados</h2>
      <div className="added-products">
        {items.length === 0 ? (
          <p>No hay productos agregados.</p>
        ) : (
          <>
            <table className="added-products-table">
              <thead>
                <tr className="added-products-table__header-row">
                  <th className="added-products-table__header added-products-table__header--left">
                    Producto
                  </th>
                  <th className="added-products-table__header added-products-table__header--center">
                    Und.
                  </th>
                  <th className="added-products-table__header added-products-table__header--right">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((ps) => (
                  <tr
                    key={`tr_product_${ps.id}`}
                    className="added-products-table__row"
                  >
                    <td className="added-products-table__cell added-products-table__cell--left">
                      {ps.product.name}
                    </td>
                    <td className="added-products-table__cell added-products-table__cell--center">
                      <productFetcher.Form
                        method="post"
                        action="."
                        className="added-products-fetcher"
                      >
                        <input type="hidden" name="_action" value="update" />
                        <button
                          type="submit"
                          name="op"
                          value="subtract"
                          className="added-btn added-btn--subtract"
                        >
                          <FaMinus className="added-btn__icon" />
                        </button>
                        <span className="order-table__quantity">
                          {ps.quantity}
                        </span>
                        <button
                          type="submit"
                          name="op"
                          value="add"
                          className="added-btn added-btn--add"
                        >
                          <FaPlus className="added-btn__icon" />
                        </button>
                        <input
                          type="hidden"
                          value={ps.product.id}
                          name="idProduct"
                        />
                      </productFetcher.Form>
                    </td>
                    <td className="added-products-table__cell added-products-table__cell--right">
                      {ps.subtotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="added-products-total">
              <strong>Total:</strong>{" "}
              <span className="added-products-total__span">
                $ {total.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
