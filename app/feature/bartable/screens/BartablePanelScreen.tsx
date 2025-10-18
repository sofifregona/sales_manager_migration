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
// import type { BartableLoaderData } from "../bartable";
// import { FlashMessages } from "~/shared/ui/FlashMessages";

// export function BartableListScreen() {
//   const { bartables, editingBartable, flash } =
//     useLoaderData<BartableLoaderData>();
//   const actionData = useActionData() as
//     | { error?: string; source?: "client" | "server" }
//     | undefined;
//   const navigation = useNavigation();
//   const location = useLocation();
//   const fetcher = useFetcher();

//   const isSubmitting = navigation.state === "submitting";
//   const isEditing = !!editingBartable;
//   const deleting = fetcher.state !== "idle";

//   const [number, setNumber] = useState(editingBartable?.number ?? "");

//   useEffect(() => {
//     if (isEditing) {
//       setNumber(editingBartable?.number ?? "");
//     } else if (
//       !isEditing &&
//       (flash.created || flash.updated || flash.deleted)
//     ) {
//       setNumber("");
//     }
//   }, [editingBartable?.id, isEditing, flash, location.key]);

//   return (
//     <div>
//       <h1>Mesas</h1>
//       <h2>{isEditing ? "Editar mesa" : "Crear nueva mesa"}</h2>

//       {isEditing && (
//         <p className="muted">
//           Editando: <strong>{editingBartable!.number}</strong>{" "}
//           <Link to="/bartable" replace className="btn">
//             Cancelar edicion
//           </Link>
//         </p>
//       )}

//       <FlashMessages
//         flash={flash}
//         successMessages={{
//           created: "Mesa creada con éxito.",
//           updated: "Mesa modificada con éxito.",
//           deleted: "Mesa eliminada con éxito.",
//         }}
//         actionError={actionData}
//       />

//       <Form
//         method="post"
//         action={isEditing ? `.${location.search}` : "."}
//         className="bartable-form"
//       >
//         <label htmlFor="name">Numero *</label>
//         <input
//           id="number"
//           name="number"
//           type="number"
//           value={number}
//           onChange={(e) => setNumber(e.target.value)}
//           min={0}
//           step={1}
//           required
//           aria-required
//         />
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

//       <h2>Lista de mesas</h2>
//       {bartables.length === 0 ? (
//         <p>No hay mesas activas.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Numero</th>
//               <th style={{ width: 220 }}>Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {bartables.map((bartable) => (
//               <tr
//                 key={bartable.id}
//                 className={
//                   editingBartable?.id === bartable.id
//                     ? "row row--editing"
//                     : "row"
//                 }
//               >
//                 <td>{bartable.number}</td>
//                 <td className="actions">
//                   <Link to={`?id=${bartable.id}`}>
//                     <button type="button">Modificar</button>
//                   </Link>
//                   <fetcher.Form
//                     method="post"
//                     action="."
//                     onSubmit={(e) => {
//                       if (!confirm("¿Seguro que desea eliminar esta mesa?")) {
//                         e.preventDefault();
//                       }
//                     }}
//                     style={{ display: "inline-block", marginLeft: 8 }}
//                   >
//                     <input type="hidden" name="id" value={bartable.id} />
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

// export function BartableListErrorBoundary({ error }: { error: unknown }) {
//   let message = "Ocurrió un error al cargar la lista de mesas.";
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
import type { BartableLoaderData } from "~/feature/bartable/bartable";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { BartableForm } from "../ui/BartableForm";
import { BartableTable } from "../ui/BartableTable";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";

export function BartablePanelScreen() {
  const { bartables, editingBartable, flash } =
    useLoaderData<BartableLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingBartable;
  const deleting = fetcher.state !== "idle";

  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("bartable");

  const { prompt, dismiss } = useReactivateFlow("bartable");
  const { message } = useCrudSuccess("bartable", {
    "created-success": "Mesa creada con éxito.",
    "updated-success": "Mesa modificada con éxito.",
    "deleted-success": "Mesa eliminada con éxito.",
    "reactivated-success": "Mesa reactivada con éxito.",
  });

  return (
    <div>
      <h1>Mesas</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="mesa"
        name={editingBartable?.number.toString() ?? null}
        cancelHref="/bartable"
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
            `Se ha detectado una mesa inactiva con este número. 
            ¿Desea reactivarla? Si reactiva la antigua mesa, la mesa actual se desactivará. 
            Si desea cambiar el número, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una mesa inactiva con este número. 
            ¿Desea reactivarla? Si desea cambiar el número, haga clic en cancelar.`
          }
          label="número"
          inactiveId={prompt.elementId}
          currentId={editingBartable?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <BartableForm
        isEditing={isEditing}
        editing={editingBartable}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <BartableTable
        bartables={bartables}
        editingId={editingBartable?.id ?? null}
      />
    </div>
  );
}

export function BartablePanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de mesas.";
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
