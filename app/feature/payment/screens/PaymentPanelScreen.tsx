// import {
//   Link,
//   Form,
//   useActionData,
//   useFetcher,
//   useNavigation,
//   useLoaderData,
//   useLocation,
// } from "react-router-dom";
// import { useEffect, useState } from "react";
// import type { PaymentLoaderData } from "../payment";
// import { FlashMessages } from "~/shared/ui/FlashMessages";

// export function PaymentPanelScreen() {
//   const { payments, payments, editingPayment, flash } =
//     useLoaderData<PaymentLoaderData>();

//   const actionData = useActionData() as
//     | { error?: string; source?: "client" | "server" }
//     | undefined;
//   const navigation = useNavigation();
//   const location = useLocation();
//   const fetcher = useFetcher();

//   const isSubmitting = navigation.state === "submitting";
//   const isEditing = !!editingPayment;
//   const deleting = fetcher.state !== "idle";


  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("payment");
//   const [name, setName] = useState(editingPayment?.name ?? "");
//   const [idPayment, setIdPayment] = useState(editingPayment?.payment.id ?? "");

//   useEffect(() => {
//     if (isEditing) {
//       setName(editingPayment?.name ?? "");
//       setIdPayment(editingPayment?.payment.id ?? "");
//     } else {
//       setName("");
//       setIdPayment("");
//     }
//   }, [editingPayment?.id, isEditing, location.key]);

//   return (
//     <div>
//       <h1>Metodos de pago</h1>
//       <h2>
//         {isEditing ? "Editar mÃ©todo de pago" : "Crear nuevo mÃ©todo de pago"}
//       </h2>

//       {isEditing && (
//         <p className="muted">
//           Editando: <strong>{editingPayment!.name}</strong>{" "}
//           <Link to="/payment" replace className="btn">
//             Cancelar edicion
//           </Link>
//         </p>
//       )}

//       <FlashMessages
//         flash={flash}
//         successMessages={{
//           created: "MÃ©todo de pago creado con Ã©xito.",
//           updated: "MÃ©todo de pago modificado con Ã©xito.",
//           deleted: "MÃ©todo de pago eliminado con Ã©xito.",
//         }}
//         actionError={actionData}
//       />

//       <Form
//         method="post"
//         action={isEditing ? `.${location.search}` : "."}
//         className="payment-form"
//       >
//         <label htmlFor="name">Nombre *</label>
//         <input
//           id="name"
//           name="name"
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//           aria-required
//         />
//         <label htmlFor="idPayment">Cuenta *</label>
//         <select
//           id="idPayment"
//           name="idPayment"
//           value={idPayment}
//           onChange={(e) => setIdPayment(e.target.value)}
//           required
//         >
//           <option value="" disabled>
//             - Seleccion una cuenta -
//           </option>
//           {payments.map((a) => (
//             <option key={a.id} value={a.id}>
//               {a.name}
//             </option>
//           ))}
//         </select>
//         <input
//           type="hidden"
//           name="_action"
//           value={isEditing ? "update" : "create"}
//         />
//         <button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? "Guardando..." : "Guardar"}
//         </button>

//         <p className="hint">(*) Campos obligatorios.</p>
//       </Form>

//       <h2>Lista de metodos de pago</h2>
//       {payments.length === 0 ? (
//         <p>No hay metodos de pago activos.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Nombre</th>
//               <th>Cuenta asociada</th>
//               <th style={{ width: 220 }}>Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {payments.map((payment) => (
//               <tr
//                 key={payment.id}
//                 className={
//                   editingPayment?.id === payment.id ? "row row--editing" : "row"
//                 }
//               >
//                 <td>{payment.name}</td>
//                 <td>{payment.payment.name}</td>
//                 <td className="actions">
//                   <Link to={`?id=${payment.id}`}>
//                     <button type="button">Modificar</button>
//                   </Link>
//                   <fetcher.Form
//                     method="post"
//                     action="."
//                     onSubmit={(e) => {
//                       if (
//                         !confirm(
//                           "Â¿Seguro que desea eliminar este metodo de pago?"
//                         )
//                       ) {
//                         e.preventDefault();
//                       }
//                     }}
//                     style={{ display: "inline-block", marginLeft: 8 }}
//                   >
//                     <input type="hidden" name="id" value={payment.id} />
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

// export function PaymentPanelErrorBoundary({ error }: { error: unknown }) {
//   let message = "OcurriÃ³ un error al cargar la lista de metodos de pago.";
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
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import type { PaymentLoaderData } from "~/feature/payment/payment";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { PaymentForm } from "../ui/PaymentForm";
import { PaymentTable } from "../ui/PaymentTable";

export function PaymentPanelScreen() {
  const { payments, accounts, editingPayment, flash } =
    useLoaderData<PaymentLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingPayment;
  const deleting = fetcher.state !== "idle";

  
  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("payment");
const { prompt, dismiss } = useReactivateFlow("payment");
  const { message } = useCrudSuccess("payment", {
    "created-success": "MÃ©todo de pago creado con Ã©xito.",
    "updated-success": "MÃ©todo de pago modificado con Ã©xito.",
    "deleted-success": "MÃ©todo de pago eliminado con Ã©xito.",
    "reactivated-success": "MÃ©todo de pago reactivado con Ã©xito.",
  });

  return (
    <div>
      <h1>MÃ©todos de pago</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="mÃ©todo de pago"
        name={editingPayment?.name ?? null}
        cancelHref="/payment"
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

      {prompt && (
        <ReactivatePromptBanner
          messageForUpdate={
            prompt.message ??
            `Se ha detectado un mÃ©todo de pago inactivo con este nombre. 
            Â¿Desea reactivarlo? Si reactiva el antiguo mÃ©todo de pago, el mÃ©todo de pago actual se desactivarÃ¡. 
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado un mÃ©todo de pago inactivo con este nombre. 
            Â¿Desea reactivarlo? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingPayment?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <PaymentForm
        isEditing={isEditing}
        editing={editingPayment}
        accounts={accounts}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <PaymentTable
        payments={payments}
        editingId={editingPayment?.id ?? null}
      />
    </div>
  );
}

export function PaymentPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "OcurriÃ³ un error al cargar la lista de mÃ©todos de pago.";
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


