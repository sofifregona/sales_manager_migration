import {
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import type { ProductLoaderData } from "~/feature/product/product";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { ProductForm } from "../ui/ProductForm";
import { ProductTable } from "../ui/ProductTable";
import ListFilter from "../ui/ProductFilter";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import { useEffect, useRef, useState } from "react";
import {
  CRUD_SUCCESS_QUERY_FLAGS,
  useFloatingCrudSuccess,
} from "~/shared/hooks/useFloatingCrudSuccess";
import "./ProductPanelScreen.sass";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { FaFilter } from "react-icons/fa6";
import { MdPriceCheck } from "react-icons/md";

export function ProductPanelScreen() {
  const { products, editingProduct, brands, categories, providers, flash } =
    useLoaderData<ProductLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const formError = actionData?.error;

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const editingIdParam = searchParams.get("id");
  const editingTargetId = editingIdParam ? Number(editingIdParam) : null;
  const includeInactive = searchParams.get("includeInactive") === "1";
  const currentEditingProduct =
    editingTargetId != null && editingProduct?.id === editingTargetId
      ? editingProduct
      : null;
  const isEditing = !!currentEditingProduct;

  const cancelHref = (() => {
    const p = new URLSearchParams(location.search);
    p.delete("id");
    CRUD_SUCCESS_QUERY_FLAGS.forEach((flag) => p.delete(flag));
    const qs = p.toString();
    return `/settings/product${qs ? `?${qs}` : ""}`;
  })();

  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Producto creado con éxito.",
      "updated-success": "Producto modificado con éxito.",
      "deactivated-success": "Producto desactivado con éxito.",
      "reactivated-success": "Producto reactivado con éxito.",
      "incremented-success": "Precios aumentados con éxito.",
    },
  });

  const { message: clientError } = useCrudError("product", {
    includeReactivable: false,
  });

  const closedOnSuccessRef = useRef(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [openFilter, setOpenFilter] = useState(false);
  const [showIncrement, setShowIncrement] = useState(false);

  useEffect(() => {
    if (editingTargetId != null) {
      setShowForm(true);
      setFormMode("edit");
    } else {
      setFormMode("create");
    }
  }, [editingTargetId]);

  useEffect(() => {
    if (formError) {
      setShowForm(true);
    }
  }, [formError]);

  useEffect(() => {
    if (showSuccess && !closedOnSuccessRef.current) {
      setShowForm(false);
      closedOnSuccessRef.current = true;
      if (location.search.includes("id=")) {
        navigate(cancelHref, { replace: true });
      }
    }
    if (!showSuccess) {
      closedOnSuccessRef.current = false;
    }
  }, [showSuccess, cancelHref, location.search, navigate]);

  const openCreate = () => {
    setFormMode("create");
    setShowForm(true);
    navigate(cancelHref, { replace: true });
  };

  const closeForm = () => {
    setShowForm(false);
    if (location.search.includes("id=")) {
      navigate(cancelHref, { replace: true });
    }
  };

  const toggleIncludeHref = (() => {
    const p = new URLSearchParams(location.search);
    p.set("includeInactive", includeInactive ? "0" : "1");
    return `?${p.toString()}`;
  })();

  const clearFilters = () => {
    const current = new URLSearchParams(location.search);
    const includeParam = current.get("includeInactive");
    const next = new URLSearchParams();
    if (includeParam) {
      next.set("includeInactive", includeParam);
    }
    setOpenFilter(false);
    navigate(
      `/settings/product${next.toString() ? `?${next.toString()}` : ""}`,
      {
        replace: true,
      }
    );
  };

  return (
    <div className="settings-panel">
      <SettingsList actual="product" />
      <section className="settings-panel__section settings-panel__product">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de productos
          </h2>
          <div className="form-action-btns">
            <div className="filter-dropdown filter-dropdown--header">
              <button
                type="button"
                className="btn btn--icon-gap"
                onClick={() => setOpenFilter((prev) => !prev)}
                aria-expanded={openFilter}
              >
                <FaFilter className="action-icon" />
                {" Filtrar"}
              </button>
              {openFilter && (
                <div className="filter-dropdown__panel filter-dropdown__panel--above">
                  <div className="filter-dropdown__header">
                    <h3>Filtros</h3>
                    <div className="filter-dropdown__actions">
                      <button
                        type="button"
                        className="filter-dropdown__close"
                        onClick={() => setOpenFilter(false)}
                        aria-label="Cerrar filtros"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <ListFilter
                    brands={brands}
                    categories={categories}
                    providers={providers}
                    openFilter={openFilter}
                  />
                  <button
                    type="button"
                    className="secondary-btn clear-btn"
                    onClick={clearFilters}
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={() => setShowIncrement((prev) => !prev)}
            >
              <RiMoneyDollarCircleFill className="action-icon" />
              {" Incrementar precios"}
            </button>
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear producto"}
            </button>
            <Link
              replace
              to={toggleIncludeHref}
              className={
                includeInactive
                  ? "btn inactive-btn--active btn--icon-gap"
                  : "btn btn--icon-gap"
              }
            >
              {includeInactive ? (
                <>
                  <FaEyeSlash className="action-icon" />
                  {" Ocultar inactivos"}
                </>
              ) : (
                <>
                  <FaEye className="action-icon" />
                  {" Ver inactivos"}
                </>
              )}
            </Link>
          </div>
          {toastMessage && showSuccess && (
            <div className="toast-success-float" role="status">
              {toastMessage}
            </div>
          )}
        </div>

        <FlashMessages flash={{ error: flash?.error, source: flash?.source }} />

        {clientError && <ErrorBanner message={clientError} />}

        {showForm && (
          <div
            className="action-prompt-overlay"
            role="dialog"
            aria-modal="true"
            onClick={closeForm}
          >
            <div
              className="action-prompt form-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="form-modal__header">
                <h3 className="settings-panel__subtitle">
                  {formMode === "edit" && currentEditingProduct ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ {currentEditingProduct.name} ]
                      </strong>
                    </>
                  ) : (
                    "Crear producto"
                  )}
                </h3>
              </div>
              <ProductForm
                key={
                  isEditing
                    ? `update-${editingProduct?.id}-product`
                    : "create-product"
                }
                isEditing={isEditing}
                editing={editingProduct}
                brands={brands}
                categories={categories}
                providers={providers}
                formAction={`.${location.search}`}
                cancelHref={cancelHref}
                onCancel={closeForm}
                actionError={formError}
              />
            </div>
          </div>
        )}

        <ProductTable
          products={products}
          brands={brands}
          categories={categories}
          providers={providers}
          editingId={editingTargetId}
          showIncrement={showIncrement}
        />
      </section>
    </div>
  );
}

export function ProductPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de productos.";
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
