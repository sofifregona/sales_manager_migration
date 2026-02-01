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
            <div className="added-products__list-wrapper">
              <ul className="added-products__list-ul">
                {items.map((ps) => (
                  <li className="added-products__list-item">
                    <strong
                      className="added-products__name"
                      title={ps.product.name}
                    >
                      {ps.product.name}
                    </strong>
                    <p className="added-products__subtotal">$ {ps.subtotal}</p>
                    <productFetcher.Form
                      method="post"
                      action="."
                      className="added-products__form"
                    >
                      <input type="hidden" name="_action" value="update" />
                      <button
                        type="submit"
                        name="op"
                        value="subtract"
                        className="added-products__btn added-products__btn--subtract"
                      >
                        <FaMinus className="added-products__btn-icon" />
                      </button>
                      <span className="added-products__quantity">
                        {ps.quantity}
                      </span>
                      <button
                        type="submit"
                        name="op"
                        value="add"
                        className="added-products__btn added-products__btn--add"
                      >
                        <FaPlus className="added-products__btn-icon" />
                      </button>
                      <input
                        type="hidden"
                        value={ps.product.id}
                        name="idProduct"
                      />
                    </productFetcher.Form>
                  </li>
                ))}
              </ul>
            </div>
            <div className="added-products__total">
              <strong>Total:</strong>{" "}
              <span className="added-products__total-span">
                $ {total.toFixed(2)}
              </span>
            </div>
          </>
          // <>
          //   <table className="added-products__table">
          //     <thead className="added-products__thead">
          //       <tr className="added-products__header-row">
          //         <th className="added-products__header added-products__header--left">
          //           Producto
          //         </th>
          //         <th className="added-products__header added-products__header--center">
          //           Und.
          //         </th>
          //         <th className="added-products__header added-products__header--right">
          //           Precio
          //         </th>
          //       </tr>
          //     </thead>
          //     <tbody className="added-products__tbody">
          //       {items.map((ps) => (
          //         <tr
          //           key={`tr_product_${ps.id}`}
          //           className="added-products__row"
          //         >
          //           <td
          //             className="added-products__cell added-products__cell--left"
          //             title={ps.product.name}
          //           >
          //             {ps.product.name}
          //           </td>
          //           <td
          //             className="added-products__cell added-products__cell--center"
          //             title={`Cantidad: ${ps.quantity}`}
          //           >
          //             <productFetcher.Form
          //               method="post"
          //               action="."
          //               className="added-products__form"
          //             >
          //               <input type="hidden" name="_action" value="update" />
          //               <button
          //                 type="submit"
          //                 name="op"
          //                 value="subtract"
          //                 className="added-products__btn added-products__btn--subtract"
          //               >
          //                 <FaMinus className="added-products__btn-icon" />
          //               </button>
          //               <span className="added-products__quantity">
          //                 {ps.quantity}
          //               </span>
          //               <button
          //                 type="submit"
          //                 name="op"
          //                 value="add"
          //                 className="added-products__btn added-products__btn--add"
          //               >
          //                 <FaPlus className="added-products__btn-icon" />
          //               </button>
          //               <input
          //                 type="hidden"
          //                 value={ps.product.id}
          //                 name="idProduct"
          //               />
          //             </productFetcher.Form>
          //           </td>
          //           <td className="added-products__cell added-products__cell--right">
          //             <span title={`$ ${ps.subtotal}`}>$ {ps.subtotal}</span>
          //           </td>
          //         </tr>
          //       ))}
          //     </tbody>
          //   </table>
          //   <div className="added-products__total">
          //     <strong>Total:</strong>{" "}
          //     <span className="added-products__total-span">
          //       $ {total.toFixed(2)}
          //     </span>
          //   </div>
          // </>
        )}
      </div>
    </>
  );
}
