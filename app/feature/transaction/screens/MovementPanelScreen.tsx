import {
  useActionData,
  useFetcher,
  useNavigation,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import type { TransactionLoaderData } from "~/feature/transaction/transaction";
import { FlashMessages } from "~/shared/ui/feedback/FlashMessages";
import { SuccessBanner } from "~/shared/ui/feedback/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { CrudHeader } from "~/shared/ui/layout/CrudHeader";
import { MovementForm } from "../ui/MovementForm";
import { MovementTable } from "../ui/MovementTable";
import { formatDateTime } from "~/utils/formatters/formatDateTime";
import TransactionFilter from "../ui/TransactionFilter";

export function MovementPanelScreen() {
  const { transactions, accounts, editingTransaction, flash } =
    useLoaderData<TransactionLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingTransaction;
  const deleting = fetcher.state !== "idle";

  const { message } = useCrudSuccess("transaction", {
    "created-success": "Transacción creada con éxito.",
    "updated-success": "Transacción modificada con éxito.",
    "deleted-success": "Transacción eliminada con éxito.",
    "reactivated-success": "Transacción reactivada con éxito.",
  });

  const today = formatDateTime(new Date(), "yyyy-mm-dd");
  const dateTime = editingTransaction
    ? formatDateTime(editingTransaction?.dateTime, "dd-mm-yyyy hh:mm:ss").split(
        " "
      )
    : today;

  return (
    <div>
      <h1>Transacciones</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="transacción"
        name={isEditing ? `del día ${dateTime[0]}, hora ${dateTime[1]}` : null}
        cancelHref="/transaction"
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

      <MovementForm
        isEditing={isEditing}
        editing={editingTransaction}
        accounts={accounts}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <TransactionFilter />

      <MovementTable
        transactions={transactions}
        editingId={editingTransaction?.id ?? null}
      />
    </div>
  );
}

export function MovementPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de cuentas.";
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
