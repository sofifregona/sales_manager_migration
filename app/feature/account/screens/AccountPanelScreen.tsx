import {
  Link,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { makeReactivableConflictBuilder } from "~/shared/conflict/builders";
import { renderAccountSwapOverlay } from "~/feature/account/conflict/renderAccountInUseOverlay";
import type { AccountLoaderData } from "~/feature/account/account";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { ErrorBanner } from "~/shared/ui/feedback/ErrorBanner";
import { useFloatingCrudSuccess } from "~/shared/hooks/useFloatingCrudSuccess";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/prompts/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { AccountForm } from "../ui/AccountForm";
import { AccountTable } from "../ui/AccountTable";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import { consumeConflictCookie } from "~/services/conflictCookie";
import { SettingsList } from "~/shared/ui/layout/SettingsList";
import { FaPlusCircle } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

import "./AccountPanelScreen.sass";

export function AccountPanelScreen() {
  const { accounts, editingAccount, flash } =
    useLoaderData<AccountLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const formError = actionData?.error;

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const include = searchParams.get("includeInactive");
  const includeInactive = include === "1";
  const editingIdParam = searchParams.get("id");
  const editingTargetId = editingIdParam ? Number(editingIdParam) : null;
  const cancelHref = `/settings/account${
    include ? `?includeInactive=${include}` : ""
  }`;

  useUrlConflictFlash(
    "account",
    makeReactivableConflictBuilder("account", ["ACCOUNT_EXISTS_INACTIVE"])
  );

  const { prompt, dismiss } = useReactivateFlow("account");
  const { toastMessage, visible: showSuccess } = useFloatingCrudSuccess({
    messageMap: {
      "created-success": "Cuenta creada con éxito.",
      "updated-success": "Cuenta modificada con éxito.",
      "deactivated-success": "Cuenta eliminada con éxito.",
      "reactivated-success": "Cuenta reactivada con éxito.",
    },
  });

  const currentEditingAccount =
    editingTargetId != null && editingAccount?.id === editingTargetId
      ? editingAccount
      : null;
  const isEditing = !!currentEditingAccount;

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const conflictActive = !!prompt;
  const overrideName = useMemo(() => {
    if (!conflictActive) return undefined;
    const extras = consumeConflictCookie<{ name?: string }>() || {};
    return extras.name ?? "";
  }, [conflictActive]);

  const { message: clientError } = useCrudError("account", {
    includeReactivable: true,
  });

  const [params] = useSearchParams();

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

  return (
    <div className="settings-panel">
      <SettingsList actual="account" />
      <section className="settings-panel__section settings-panel__account">
        <div className="settings-panel__header">
          <h2 className="settings-panel__subtitle table-section__subtitle">
            Lista de cuentas
          </h2>
          <div className="form-action-btns">
            <button
              type="button"
              className="btn btn--icon-gap"
              onClick={openCreate}
            >
              <FaPlusCircle className="action-icon" />
              {" Crear cuenta"}
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
                      {" Ocultar inactivas"}
                    </>
                  ) : (
                    <>
                      <FaEye className="action-icon" />
                      {" Ver inactivas"}
                    </>
                  )}
                </Link>
              );
            })()}
            {toastMessage && showSuccess && (
              <div className="toast-success-float" role="status">
                {toastMessage}
              </div>
            )}
          </div>
        </div>

        <FlashMessages flash={{ error: flash?.error, source: flash?.source }} />
        {!prompt && clientError && <ErrorBanner message={clientError} />}

        {prompt && (
          <ReactivatePromptBanner
            overlay
            renderConflictOverlay={renderAccountSwapOverlay}
            messageForUpdate={
              prompt.message ??
              `Se ha detectado una cuenta inactiva con este nombre.
            ¿Desea reactivarla? Si reactiva la antigua cuenta, la cuenta actual se desactivará.
            Si desea cambiar el nombre, haga clic en cancelar.`
            }
            messageForCreate={
              prompt.message ??
              `Se ha detectado una cuenta inactiva con este nombre.
            ¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
            }
            label="nombre"
            inactiveId={prompt.elementId}
            currentId={currentEditingAccount?.id ?? undefined}
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
                  {formMode === "edit" && currentEditingAccount ? (
                    <>
                      Editando:{" "}
                      <strong className="settings-panel__subtitle--editing">
                        [ {currentEditingAccount.name} ]
                      </strong>
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </h3>
              </div>
              <AccountForm
                key={
                  currentEditingAccount
                    ? `update-${currentEditingAccount.id}-account`
                    : "create-account"
                }
                isEditing={isEditing}
                editing={currentEditingAccount}
                formAction={`.${location.search}`}
                overrideName={overrideName}
                cancelHref={cancelHref}
                onCancel={closeForm}
                actionError={formError}
              />
            </div>
          </div>
        )}

        <AccountTable accounts={accounts} editingId={editingTargetId} />
      </section>
    </div>
  );
}

export function AccountPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de cuentas.";
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
