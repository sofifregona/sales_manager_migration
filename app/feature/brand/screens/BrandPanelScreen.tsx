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
// import type { BrandLoaderData } from "../brand";
// import { FlashMessages } from "~/shared/ui/FlashMessages";

// export function BrandPanelScreen() {
//   const { brands, editingBrand, flash } = useLoaderData<BrandLoaderData>();
//   const actionData = useActionData() as
//     | { error?: string; source?: "client" | "server" }
//     | undefined;
//   const navigation = useNavigation();
//   const location = useLocation();
//   const fetcher = useFetcher();

//   const isSubmitting = navigation.state === "submitting";
//   const isEditing = !!editingBrand;
//   const deleting = fetcher.state !== "idle";

// Convierte flags de éxito en client flash y limpia la URL
useUrlSuccessFlash("brand");
//   const [name, setName] = useState(editingBrand?.name ?? "");

//   useEffect(() => {
//     if (isEditing) {
//       setName(editingBrand?.name ?? "");
//     } else if (!isEditing) {
//       setName("");
//     }
//   }, [editingBrand?.id, isEditing, flash, location.key]);

//   return (
//     <div>
//       <h1>Marcas</h1>
//       <h2>{isEditing ? "Editar marca" : "Crear nueva marca"}</h2>

//       {isEditing && (
//         <p className="muted">
//           Editando: <strong>{editingBrand!.name}</strong>{" "}
//           <Link to="/brand" replace className="btn">
//             Cancelar edicion
//           </Link>
//         </p>
//       )}

//       <FlashMessages
//         flash={flash}
//         successMessages={{
//           created: "Marca creada con Ã©xito.",
//           updated: "Marca modificada con Ã©xito.",
//           deleted: "Marca eliminada con Ã©xito.",
//         }}
//         actionError={actionData}
//       />

//       <Form
//         method="post"
//         action={isEditing ? `.${location.search}` : "."}
//         className="brand-form"
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

//       <h2>Lista de marcas</h2>
//       {brands.length === 0 ? (
//         <p>No hay marcas activas.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Nombre</th>
//               <th style={{ width: 220 }}>Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {brands.map((brand) => (
//               <tr
//                 key={brand.id}
//                 className={
//                   editingBrand?.id === brand.id ? "row row--editing" : "row"
//                 }
//               >
//                 <td>{brand.name}</td>
//                 <td className="actions">
//                   <Link to={`?id=${brand.id}`}>
//                     <button type="button">Modificar</button>
//                   </Link>
//                   <fetcher.Form
//                     method="post"
//                     action="."
//                     onSubmit={(e) => {
//                       if (!confirm("Â¿Seguro que desea eliminar esta marca?")) {
//                         e.preventDefault();
//                       }
//                     }}
//                     style={{ display: "inline-block", marginLeft: 8 }}
//                   >
//                     <input type="hidden" name="id" value={brand.id} />
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

// export function BrandPanelErrorBoundary({ error }: { error: unknown }) {
//   let message = "OcurriÃ³ un error al cargar la lista de marcas.";
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
import type { BrandLoaderData } from "~/feature/brand/brand";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { BrandForm } from "../ui/BrandForm";
import { BrandTable } from "../ui/BrandTable";

export function BrandPanelScreen() {
  const { brands, editingBrand, flash } = useLoaderData<BrandLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingBrand;
  const deleting = fetcher.state !== "idle";

  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("brand");
  const { prompt, dismiss } = useReactivateFlow("brand");
  const { message } = useCrudSuccess("brand", {
    "created-success": "Marca creada con Ã©xito.",
    "updated-success": "Marca modificada con Ã©xito.",
    "deleted-success": "Marca eliminada con Ã©xito.",
    "reactivated-success": "Marca reactivada con Ã©xito.",
  });

  return (
    <div>
      <h1>Marcas</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="marca"
        name={editingBrand?.name ?? null}
        cancelHref="/brand"
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
            `Se ha detectado una marca inactiva con este nombre. 
            Â¿Desea reactivarla? Si reactiva la antigua marca, la marca actual se desactivarÃ¡. 
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una marca inactiva con este nombre. 
            Â¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingBrand?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <BrandForm
        isEditing={isEditing}
        editing={editingBrand}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <BrandTable brands={brands} editingId={editingBrand?.id ?? null} />
    </div>
  );
}

export function BrandPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "OcurriÃ³ un error al cargar la lista de marcas.";
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
