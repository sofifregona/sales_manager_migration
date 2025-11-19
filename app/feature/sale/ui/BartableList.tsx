import { Link, useFetcher } from "react-router-dom";
import type { SaleListLoaderData } from "~/feature/sale/types/sale";
import { FaUtensils } from "react-icons/fa6";
import { MdOutlineTableRestaurant } from "react-icons/md";

type Props = {
  sales: SaleListLoaderData["sales"];
  bartables: SaleListLoaderData["bartables"];
};

export function BartableList({ sales, bartables }: Props) {
  const sortedBartables = [...bartables].sort((a, b) => a.number - b.number);
  const bartableFetcher = useFetcher();

  return (
    <section className="order-panel__table-section">
      <h2 className="order-panel__title">Mesas</h2>
      {sortedBartables.length === 0 ? (
        <p>No hay mesas activas.</p>
      ) : (
        <ul className="order-panel__table-list">
          {sortedBartables.map((bartable) => {
            const sale = sales.find(
              (s) => s.open && s.bartable?.id === bartable.id
            );
            return (
              <li key={bartable.id} className="order-panel__table-element">
                {sale ? (
                  <Link
                    className="table-btn table-btn--open"
                    to={`/sale/${sale.id}/edit`}
                  >
                    <div className="btn__icon--open">
                      <FaUtensils className="table-icon table-icon--open" />
                    </div>
                    <div className="btn__inner">Mesa {bartable.number}</div>
                  </Link>
                ) : (
                  <bartableFetcher.Form method="post" action=".">
                    <input
                      type="hidden"
                      name="idBartable"
                      value={bartable.id}
                    />
                    <input type="hidden" name="prop" value="bartable" />
                    <button
                      type="submit"
                      className="table-btn table-btn--close"
                    >
                      <div className="btn__icon--open">
                        <MdOutlineTableRestaurant className="table-icon" />
                      </div>
                      <div className="btn__inner">Mesa {bartable.number}</div>
                    </button>
                  </bartableFetcher.Form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
