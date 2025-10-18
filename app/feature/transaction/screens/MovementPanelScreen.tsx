// import {
//   Link,
//   Form,
//   useActionData,
//   useFetcher,
//   useNavigation,
//   useLoaderData,
//   useLocation,
//   useSubmit,
//   useSearchParams,
// } from "react-router-dom";
// import { useEffect, useState } from "react";
// import type { TransactionLoaderData } from "../transaction";
// import { FlashMessages } from "~/shared/ui/FlashMessages";
// import { formatDateTime } from "~/utils/formatters/formatDateTime";

// export function MovementListPanelScreen() {
//   const { accounts, transactions, editingTransaction, flash } =
//     useLoaderData<TransactionLoaderData>();

//   const actionData = useActionData() as
//     | { error?: string; source?: "client" | "server" }
//     | undefined;

//   const navigation = useNavigation();
//   const location = useLocation();
//   const fetcher = useFetcher();

//   const isSubmitting = navigation.state === "submitting";
//   const isEditing = !!editingTransaction;
//   const deleting = fetcher.state !== "idle";

//   const today = formatDateTime(new Date(), "yyyy-mm-dd");
//   const [idAccount, setIdAccount] = useState(
//     editingTransaction?.account.id ?? ""
//   );
//   const [type, setType] = useState(editingTransaction?.type ?? "income");
//   const [amount, setAmount] = useState(editingTransaction?.amount ?? "");
//   const [description, setDescription] = useState(
//     editingTransaction?.description ?? ""
//   );

//   const typeOptionBaseClasses =
//     "px-4 py-2 text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500";
//   const activeTypeOptionClasses = "bg-blue-600 text-white border-blue-600";
//   const inactiveTypeOptionClasses =
//     "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800";
//   const fieldWrapperClasses = "flex items-center gap-3";
//   const labelClasses =
//     "text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap";
//   const inputClasses =
//     "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";
//   const typeLabelId = "transaction-type-label";

//   useEffect(() => {
//     if (isEditing) {
//       setIdAccount(editingTransaction?.account.id ?? "");
//       setType(editingTransaction?.type ?? "income");
//       setAmount(editingTransaction?.amount ?? "");
//       setDescription(editingTransaction?.description ?? "");
//     } else {
//       setIdAccount("");
//       setType("income");
//       setAmount("");
//       setDescription("");
//     }
//   }, [editingTransaction?.id, isEditing, location.key]);

//   const submit = useSubmit();
//   const [sp] = useSearchParams();

//   return (
//     <div>
//       <h1>Transacciones</h1>
//       <h2>{isEditing ? "Editar transaccion" : "Crear nueva transaccion"}</h2>

//       {isEditing && (
//         <p className="muted">
//           {(() => {
//             const dateTime = formatDateTime(
//               editingTransaction?.dateTime,
//               "dd-mm-yyyy hh:mm:ss"
//             ).split(" ");
//             return (
//               <strong>{`Editando transaccin del da ${dateTime[0]}, hora ${dateTime[1]}`}</strong>
//             );
//           })()}{" "}
//           <Link to="/transaction" replace className="btn">
//             Cancelar edición
//           </Link>
//         </p>
//       )}

//       <FlashMessages
//         flash={flash}
//         successMessages={{
//           created: "Transaccion creada con éxito.",
//           updated: "Transaccion modificada con éxito.",
//           deleted: "Transaccion eliminada con éxito.",
//         }}
//         actionError={actionData}
//       />

//       <Form
//         method="post"
//         action={isEditing ? `.${location.search}` : "."}
//         className="transaction-form flex flex-wrap items-center gap-4"
//       >
//         <div className={fieldWrapperClasses}>
//           <label htmlFor="idAccount" className={labelClasses}>
//             Cuenta *
//           </label>
//           <select
//             id="idAccount"
//             name="idAccount"
//             value={idAccount}
//             onChange={(e) => setIdAccount(e.target.value)}
//             required
//             title="Campo obligatorio"
//             className={inputClasses}
//           >
//             <option value="" disabled>
//               -- Selecciona una cuenta --
//             </option>
//             {accounts.map((account) => (
//               <option key={account.id} value={account.id}>
//                 {account.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className={fieldWrapperClasses}>
//           <span id={typeLabelId} className={labelClasses}>
//             Tipo de operacion *
//           </span>
//           <div
//             role="radiogroup"
//             aria-required="true"
//             aria-labelledby={typeLabelId}
//             className="inline-flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
//           >
//             <button
//               type="button"
//               role="radio"
//               aria-checked={type === "income"}
//               className={`${typeOptionBaseClasses} ${
//                 type === "income"
//                   ? activeTypeOptionClasses
//                   : inactiveTypeOptionClasses
//               }`}
//               onClick={() => setType("income")}
//             >
//               Ingreso
//             </button>
//             <button
//               type="button"
//               role="radio"
//               aria-checked={type === "expense"}
//               className={`${typeOptionBaseClasses} ${
//                 type === "expense"
//                   ? activeTypeOptionClasses
//                   : inactiveTypeOptionClasses
//               }`}
//               onClick={() => setType("expense")}
//             >
//               Extraccion
//             </button>
//           </div>
//           <input name="type" type="hidden" value={type} required />
//         </div>

//         <div className={fieldWrapperClasses}>
//           <label htmlFor="amount" className={labelClasses}>
//             Monto
//           </label>
//           <input
//             id="amount"
//             name="amount"
//             type="number"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             step="0.01"
//             min="0"
//             required
//             title="Campo obligatorio"
//             className={inputClasses}
//           />
//         </div>

//         <div className={fieldWrapperClasses}>
//           <label htmlFor="description" className={labelClasses}>
//             Descripcion
//           </label>
//           <input
//             id="description"
//             name="description"
//             type="text"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className={inputClasses}
//           />
//         </div>

//         <input
//           type="hidden"
//           name="_action"
//           value={isEditing ? "update" : "create"}
//         />
//         <div className="flex justify-end">
//           <button type="submit" disabled={isSubmitting}>
//             {isSubmitting ? "Guardando..." : "Guardar"}
//           </button>
//         </div>
//         <p className="hint">(*) Campos obligatorios</p>
//       </Form>

//       <Form
//         method="get"
//         onChange={(e) => submit(e.currentTarget, { replace: true })}
//         id="filter"
//       >
//         <label htmlFor="startedDate">Fecha inicial</label>
//         <input
//           id="startedDate"
//           type="date"
//           name="startedDate"
//           defaultValue={sp.get("startedDate") ?? today}
//         />
//         <label htmlFor="finalDate">Fecha final</label>
//         <input
//           id="finalDate"
//           type="date"
//           name="finalDate"
//           defaultValue={sp.get("finalDate") ?? today}
//         />
//       </Form>
//       <h2>Lista de transacciones</h2>
//       {transactions.length === 0 ? (
//         <p>No hay transacciones registradas.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Dia y hora</th>
//               <th>Cuenta</th>
//               <th>Tipo de operación</th>
//               <th>Monto</th>
//               <th>Descripción</th>
//               <th style={{ width: 220 }}>Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {transactions.map((transaction) => (
//               <tr
//                 key={transaction.id}
//                 className={
//                   editingTransaction?.id === transaction.id
//                     ? "row row--editing"
//                     : "row"
//                 }
//               >
//                 <td>
//                   {formatDateTime(transaction.dateTime, "dd-mm-yyyy hh:mm:ss")}
//                 </td>
//                 <td>{transaction.account.name}</td>
//                 <td>
//                   {transaction.type === "income" ? "Ingreso" : "Extraccion"}
//                 </td>
//                 <td>
//                   {transaction.type === "income"
//                     ? transaction.amount
//                     : transaction.amount * -1}
//                 </td>
//                 <td>{transaction.description}</td>
//                 <td className="actions">
//                   <Link to={`?id=${transaction.id}`}>
//                     <button type="button">Modificar</button>
//                   </Link>
//                   <fetcher.Form
//                     method="post"
//                     action="."
//                     onSubmit={(event) => {
//                       if (
//                         !confirm(
//                           "¿Seguro que deseas eliminar esta transaccion?"
//                         )
//                       ) {
//                         event.preventDefault();
//                       }
//                     }}
//                     style={{ display: "inline-block", marginLeft: 8 }}
//                   >
//                     <input type="hidden" name="id" value={transaction.id} />
//                     <input type="hidden" name="_action" value="delete" />
//                     <button type="submit" disabled={deleting}>
//                       {deleting ? "Eliminando..." : "Eliminar"}
//                     </button>
//                   </fetcher.Form>

//                   {fetcher.data?.error && (
//                     <div className="inline-error" role="alert">
//                       {fetcher.data.error}
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// export function MovementListPanelErrorBoundary({ error }: { error: unknown }) {
//   let message = "Ocurrió un error al cargar la lista de transacciones.";
//   if (error instanceof Error) {
//     message = error.message;
//   }
//   return (
//     <div>
//       <h2 style={{ color: "red" }}>Error</h2>
//       <p>{message}</p>
//     </div>
//   );
// }

import {
  Link,
  useActionData,
  useFetcher,
  useNavigation,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import type { TransactionLoaderData } from "~/feature/transaction/transaction";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { MovementForm } from "../ui/MovementForm";
import { MovementTable } from "../ui/MovementTable";
import { formatDateTime } from "~/utils/formatters/formatDateTime";
import MovementFilter from "../ui/MovementFilter";

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

      <MovementFilter />

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
