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
// import type { CategoryLoaderData } from "../category";
// import { FlashMessages } from "~/shared/ui/FlashMessages";

// export function CategoryPanelScreen() {
//   const { categories, editingCategory, flash } =
//     useLoaderData<CategoryLoaderData>();
//   const actionData = useActionData() as
//     | { error?: string; source?: "client" | "server" }
//     | undefined;
//   const navigation = useNavigation();
//   const location = useLocation();
//   const fetcher = useFetcher();

//   const isSubmitting = navigation.state === "submitting";
//   const isEditing = !!editingCategory;
//   const deleting = fetcher.state !== "idle";

//   const [name, setName] = useState(editingCategory?.name ?? "");

//   useEffect(() => {
//     if (isEditing) {
//       setName(editingCategory?.name ?? "");
//     } else if (!isEditing) {
//       setName("");
//     }
//   }, [editingCategory?.id, isEditing, flash, location.key]);

//   return (
//     <div>
//       <h1>Categorias</h1>
//       <h2>{isEditing ? "Editar categoría" : "Crear nueva categoría"}</h2>

//       {isEditing && (
//         <p className="muted">
//           Editando: <strong>{editingCategory!.name}</strong>{" "}
//           <Link to="/category" replace className="btn">
//             Cancelar edicion
//           </Link>
//         </p>
//       )}

//       <FlashMessages
//         flash={flash}
//         successMessages={{
//           created: "Categoria creada con éxito.",
//           updated: "Categoria modificada con éxito.",
//           deleted: "Categoria eliminada con éxito.",
//         }}
//         actionError={actionData}
//       />

//       <Form
//         method="post"
//         action={isEditing ? `.${location.search}` : "."}
//         className="category-form"
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

//       <h2>Lista de categorias</h2>
//       {categories.length === 0 ? (
//         <p>No hay categorias activas.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Nombre</th>
//               <th style={{ width: 220 }}>Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {categories.map((category) => (
//               <tr
//                 key={category.id}
//                 className={
//                   editingCategory?.id === category.id
//                     ? "row row--editing"
//                     : "row"
//                 }
//               >
//                 <td>{category.name}</td>
//                 <td className="actions">
//                   <Link to={`?id=${category.id}`}>
//                     <button type="button">Modificar</button>
//                   </Link>
//                   <fetcher.Form
//                     method="post"
//                     action="."
//                     onSubmit={(e) => {
//                       if (
//                         !confirm("¿Seguro que desea eliminar esta categoria?")
//                       ) {
//                         e.preventDefault();
//                       }
//                     }}
//                     style={{ display: "inline-block", marginLeft: 8 }}
//                   >
//                     <input type="hidden" name="id" value={category.id} />
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

// export function CategoryPanelErrorBoundary({ error }: { error: unknown }) {
//   let message = "Ocurrió un error al cargar la lista de categorias.";
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
import type { CategoryLoaderData } from "~/feature/category/category";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { useUrlSuccessFlash } from "~/shared/hooks/useUrlSuccessFlash";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { CategoryForm } from "../ui/CategoryForm";
import { CategoryTable } from "../ui/CategoryTable";

export function CategoryPanelScreen() {
  const { categories, editingCategory, flash } =
    useLoaderData<CategoryLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingCategory;
  const deleting = fetcher.state !== "idle";

  // Convert URL success flags to client flash and clean the URL
  useUrlSuccessFlash("category");

  const { prompt, dismiss } = useReactivateFlow("category");
  const { message } = useCrudSuccess("category", {
    "created-success": "Categoría creada con éxito.",
    "updated-success": "Categoría modificada con éxito.",
    "deleted-success": "Categoría eliminada con éxito.",
    "reactivated-success": "Categoría reactivada con éxito.",
  });

  return (
    <div>
      <h1>Categorías</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="categoría"
        name={editingCategory?.name ?? null}
        cancelHref="/category"
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
            `Se ha detectado una categoría inactiva con este nombre. 
            ¿Desea reactivarla? Si reactiva la antigua categoría, la categoría actual se desactivará. 
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una categoría inactiva con este nombre. 
            ¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingCategory?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <CategoryForm
        isEditing={isEditing}
        editing={editingCategory}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <CategoryTable
        categories={categories}
        editingId={editingCategory?.id ?? null}
      />
    </div>
  );
}

export function CategoryPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de categorías.";
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
