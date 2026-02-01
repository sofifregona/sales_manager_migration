// **IMPORTS**
import { useLoaderData, useFetcher, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConfirmPrompt } from "~/shared/ui/prompts/ConfirmPrompt";
import type { BartableDTO } from "~/feature/bartable/bartable";
import type { EmployeeDTO } from "~/feature/employee/employee";
import type { SaleLoaderData } from "~/feature/sale/types/sale";
import { SaleAddProductFilter } from "../ui/SaleAddProductFilter";
import { SaleAddedProductsList } from "../ui/SaleAddedProductsList";
import { SalePaymentMethodForm } from "../ui/SalePaymentMethodForm";
import "./OpenSalePanelScreen.sass";

export function OpenSalePanelScreen() {
  const { sale, products, categories, paymentMethods, prop, propType } =
    useLoaderData<SaleLoaderData>();

  const productFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const payFetcher = useFetcher();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [idPaymentMethod, setIdPaymentMethod] = useState("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>();
  const [showBackPrompt, setShowBackPrompt] = useState(false);
  const [showPayPrompt, setShowPayPrompt] = useState(false);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if ((sale.products ?? []).length > 0) {
      navigate("../../sale/order");
      return;
    }
    setShowBackPrompt(true);
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const result = digits.replace(/^0+(?=[1-9])/, "").slice(0, 3);
    if (!digits) {
      setCode("");
    } else {
      setCode(result.padStart(3, "0"));
    }
  };

  return (
    <>
      {/* <div style={{ marginTop: 12, marginBottom: 12 }}>
        <button type="button" className="btn" onClick={handleBackClick}>
          Volver atrás
        </button>
      </div> */}
      <div className="open-sale">
        {/* <h1>
        Venta abierta para{" "}
        {propType === "bartable" ? "la mesa: " : "el empleado: "}
      </h1> */}
        <div className="open-sale__added">
          <SaleAddedProductsList
            items={sale.products ?? []}
            total={sale.total}
            productFetcher={productFetcher}
          />
          <button
            type="button"
            className="btn"
            onClick={() => setShowPaymentOverlay(true)}
          >
            Pagar
          </button>
        </div>

        <div className="open-sale__search">
          <SaleAddProductFilter
            products={products}
            categories={categories}
            nameFilter={nameFilter}
            code={code}
            selectedCategoryId={selectedCategoryId}
            onNameFilterChange={setNameFilter}
            onCodeChange={handleCodeChange}
            onSelectCategory={setSelectedCategoryId}
            productFetcher={productFetcher}
          />
        </div>

        {showBackPrompt && (
          <div className="overlay" role="dialog" aria-modal="true">
            <div className="overlay__content">
              <p>
                No hay productos cargados en la venta. Si regresás al panel de
                órdenes, la venta se eliminará. ¿Deseás continuar?
              </p>
              <div className="overlay__actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowBackPrompt(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => {
                    deleteFetcher.submit(
                      { id: String(sale.id), source: "open" },
                      { method: "post", action: "/sale" }
                    );
                  }}
                >
                  Eliminar y volver
                </button>
              </div>
            </div>
          </div>
        )}

        {showPaymentOverlay && (
          <div className="overlay" role="dialog" aria-modal="true">
            <div
              className="overlay__content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overlay__header">
                <h3>Pago</h3>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowPaymentOverlay(false)}
                >
                  Cerrar
                </button>
              </div>
              <SalePaymentMethodForm
                paymentMethods={paymentMethods}
                idPaymentMethod={idPaymentMethod}
                onPaymentMethodChange={setIdPaymentMethod}
                onRequestClose={() => {
                  if (!idPaymentMethod) return;
                  setShowPayPrompt(true);
                }}
                disabled={payFetcher.state !== "idle"}
              />
              {payFetcher.data?.error && (
                <div className="inline-error" role="alert">
                  {String(payFetcher.data.error)}
                </div>
              )}
            </div>
            <ConfirmPrompt
              open={showPayPrompt}
              message="Se cerrará la venta y no podrás modificarla luego. ¿Deseás continuar?"
              busy={payFetcher.state !== "idle"}
              onCancel={() => setShowPayPrompt(false)}
              onConfirm={() => {
                setShowPayPrompt(false);
                setShowPaymentOverlay(false);
                payFetcher.submit(
                  { idPaymentMethod, _action: "pay" },
                  { method: "post", action: "." }
                );
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export function SaleEditErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la venta";
  if (error instanceof Error) {
    message = error.message;
  }
  return (
    <div>
      <h2 style={{ color: "red" }}>Error</h2>
      <p>{message}</p>
    </div>
  );
}
