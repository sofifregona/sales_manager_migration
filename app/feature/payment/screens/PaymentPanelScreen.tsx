import {
  useActionData,
  useLoaderData,
  useLocation,
  useNavigation,
} from "react-router-dom";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import { useUrlConflictFlash } from "~/shared/hooks/useUrlConflictFlash";
import type { PaymentLoaderData } from "~/feature/payment/payment";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { PaymentForm } from "../ui/PaymentForm";
import { PaymentTable } from "../ui/PaymentTable";
import { useCrudError } from "~/shared/hooks/useCrudError";
import { ErrorBanner } from "~/shared/ui/ErrorBanner";
import { useCallback } from "react";

export function PaymentPanelScreen() {
  const { payments, accounts, editingPayment, flash } =
    useLoaderData<PaymentLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;

  const location = useLocation();
  const p = new URLSearchParams(location.search);
  const include = p.get("includeInactive");
  const isEditing = !!editingPayment;

  // Éxitos (?created|updated|deactivated|reactivated=1) → client-flash y limpieza de URL
  useUrlSuccessFlash("payment");
  // Conflictos (?conflict=...&code=...&elementId=...) → client-flash y limpieza
  const buildConflict = useCallback((p: URLSearchParams) => {
    const conflict = p.get("conflict"); // "create" | "update" | null
    if (conflict !== "create" && conflict !== "update") return null;

    const kind = conflict === "create" ? "create-conflict" : "update-conflict";
    const elementId = p.get("elementId");
    const code = (p.get("code") || "").toUpperCase();

    const payload = {
      scope: "payment",
      kind,
      message: p.get("message") ?? undefined,
      name: p.get("name") ?? undefined,
      elementId: elementId != null ? Number(elementId) : undefined,
      reactivable: code === "PAYMENT_EXISTS_INACTIVE",
    };
    const cleanupKeys = [
      "conflict",
      "message",
      "name",
      "code",
      "description",
      "elementId",
    ];

    return { payload, cleanupKeys };
  }, []);
  useUrlConflictFlash("payment", buildConflict);

  const { prompt, dismiss } = useReactivateFlow("payment");
  const { message } = useCrudSuccess("payment", {
    "created-success": "Método de pago creado con éxito.",
    "updated-success": "Método de pago modificado con éxito.",
    "deactivated-success": "Método de pago eliminado con éxito.",
    "reactivated-success": "Método de pago reactivado con éxito.",
  });

  const conflictActive = !!prompt;
  const overrideName = conflictActive
    ? prompt?.name ?? new URLSearchParams(location.search).get("name") ?? ""
    : undefined;

  const { message: clientError } = useCrudError("payment", {
    includeReactivable: true,
  });

  return (
    <div>
      <h1>Métodos de pago</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="método de pago"
        name={editingPayment?.name ?? null}
        cancelHref={`/payment${include ? `?includeInactive=${include}` : ""}`}
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}
      {!prompt && clientError && <ErrorBanner message={clientError} />}

      {prompt && (
        <ReactivatePromptBanner
          overlay
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
          currentId={editingPayment?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <PaymentForm
        key={
          isEditing ? `update-${editingPayment.id}-payment` : "create-payment"
        }
        isEditing={isEditing}
        editing={editingPayment}
        accounts={accounts}
        formAction={`.${location.search}`}
        overrideName={overrideName}
      />

      <PaymentTable
        payments={payments}
        editingId={editingPayment?.id ?? null}
      />
    </div>
  );
}

export function PaymentPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de métodos de pago.";
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
