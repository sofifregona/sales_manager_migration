import {
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import type { PaymentMethodLoaderData } from "~/feature/paymentMethod/payment-method";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { useFloatingCrudSuccess } from "~/shared/hooks/useFloatingCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { consumeConflictCookie } from "~/services/conflictCookie";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { PaymentMethodForm } from "../ui/PaymentMethodForm";
import { PaymentMethodTable } from "../ui/PaymentMethodTable";
import { renderPaymentMethodAccountInactiveOverlay } from "~/feature/paymentMethod/conflict/renderPaymentMethodAccountInactiveOverlay";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import "./PaymentMethodPanelScreen.sass";

export function PaymentMethodPanelScreen() {
  const { paymentMethods, accounts, editingPaymentMethod, flash } =
    useLoaderData<PaymentMethodLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const include = searchParams.get("includeInactive");
  const includeInactive = include === "1";
  const editingIdParam = searchParams.get("id");
  const editingTargetId = editingIdParam ? Number(editingIdParam) : null;
  const cancelHref = `/settings/payment-method${
    include ? `?includeInactive=${include}` : ""
  }`;

  useUrlConflictFlash(
    "payment-method",
    makeReactivableConflictBuilder("payment-method", [
      "PAYMENT_METHOD_EXISTS_INACTIVE",
    ])
  );

  const { prompt, dismiss } = useReactivateFlow("payment-method");
  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Método de pago creado con éxito.",
      "updated-success": "Método de pago modificado con éxito.",
      "deactivated-success": "Método de pago eliminado con éxito.",
      "reactivated-success": "Método de pago reactivado con éxito.",
    },
  });

  const conflictActive = !!prompt;
  const extras = conflictActive
    ? consumeConflictCookie<{ name?: string; idAccount?: number }>() || {}
    : {};
  const overrideName = conflictActive ? extras.name ?? "" : undefined;
  const overrideAccountId = conflictActive ? extras.idAccount : undefined;

  const currentEditingPaymentMethod =
    editingTargetId != null && editingPaymentMethod?.id === editingTargetId
      ? editingPaymentMethod
      : null;
  const isEditing = !!currentEditingPaymentMethod;

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    if (editingTargetId != null) {
      setShowForm(true);
      setFormMode("edit");
    } else {
      setFormMode("create");
    }
  }, [editingTargetId]);

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

  const { message: clientError } = useCrudError("payment-method", {
    includeReactivable: true,
  });

  return (
    <div className="settings-panel">
      <SettingsList actual="payment-method" />
      <section className="settings-panel__section settings-panel__payment-method">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de métodos de pago
          </h2>
          <div className="form-action-btns">
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear método"}
            </button>
            {(() => {
              const p = new URLSearchParams(location.search);
              p.set("includeInactive", includeInactive ? "0" : "1");
              const toggleIncludeHref = `?${p.toString()}`;
              return (
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
              );
            })()}
          </div>
          {toastMessage && showSuccess && (
            <div className="toast-success-float" role="status">
              {toastMessage}
            </div>
          )}
        </div>

        <FlashMessages
          flash={{ error: flash?.error, source: flash?.source }}
          actionError={actionData}
        />
        {!prompt && clientError && <ErrorBanner message={clientError} />}

        {prompt && (
          <ReactivatePromptBanner
            overlay
            renderConflictOverlay={renderPaymentMethodAccountInactiveOverlay}
            messageForUpdate={
              prompt.message ??
              `Se ha detectado un método de pago inactivo con este nombre.
            ¿Desea reactivarlo? Si reactiva el antiguo método de pago, el método de pago actual se desactivará.
            Si desea cambiar el nombre, haga clic en cancelar.`
            }
            messageForCreate={
              prompt.message ??
              `Se ha detectado un método de pago inactivo con este nombre.
            ¿Desea reactivarlo? Si desea cambiar el nombre, haga clic en cancelar.`
            }
            label="nombre"
            inactiveId={prompt.elementId}
            currentId={currentEditingPaymentMethod?.id}
            onDismiss={dismiss}
          />
        )}

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
                  {formMode === "edit" && currentEditingPaymentMethod ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ {currentEditingPaymentMethod.name} ]
                      </strong>
                    </>
                  ) : (
                    "Crear método de pago"
                  )}
                </h3>
              </div>
              <PaymentMethodForm
                key={
                  currentEditingPaymentMethod
                    ? `update-${currentEditingPaymentMethod.id}-payment-method`
                    : "create-payment-method"
                }
                isEditing={isEditing}
                editing={currentEditingPaymentMethod ?? undefined}
                accounts={accounts}
                formAction={`.${location.search}`}
                overrideName={overrideName}
                overrideAccountId={overrideAccountId}
                onSubmitClose={closeForm}
                onCancel={closeForm}
              />
            </div>
          </div>
        )}

        <PaymentMethodTable
          paymentMethods={paymentMethods}
          editingId={editingTargetId}
        />
      </section>
    </div>
  );
}

export function PaymentMethodPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de métodos de pago.";
  if (error instanceof Error) {
    message = error.message;
  }
  return (
    <div className="panel-error">
      <h2 style={{ color: "red" }}>Error</h2>
      <p>{message}</p>
    </div>
  );
}
