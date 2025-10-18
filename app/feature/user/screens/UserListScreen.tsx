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
// import { useAuth } from "~/feature/auth/useAuth";
// import type { UserLoaderData } from "~/feature/user/user";
// import { FlashMessages } from "~/shared/ui/FlashMessages";

// export function UserListScreen() {
//   const { users, editingUser, flash } = useLoaderData<UserLoaderData>();
//   const actionData = useActionData() as
//     | { error?: string; source?: "client" | "server" }
//     | undefined;

//   const navigation = useNavigation();
//   const location = useLocation();
//   const fetcher = useFetcher();
//   const user = useAuth();

//   const isSubmitting = navigation.state === "submitting";
//   const isEditing = !!editingUser;
//   const deleting = fetcher.state !== "idle";

//   const [passwordInput, setPasswordInput] = useState(false);
//   const [username, setUsername] = useState(editingUser?.username ?? "");
//   const [role, setRole] = useState(editingUser?.role ?? "");

//   useEffect(() => {
//     if (isEditing) {
//       setUsername(editingUser?.username ?? "");
//       setRole(editingUser?.role ?? "");
//     } else if (
//       !isEditing &&
//       (flash.created || flash.updated || flash.deleted)
//     ) {
//       setUsername("");
//       setRole("");
//     }
//   }, [editingUser?.id, isEditing, flash, location.key]);

//   return (
//     <div>
//       <h1>
//         {user?.role === "ADMIN" ? "Usuarios" : `Usuario ${user?.username}`}
//       </h1>
//       <h2>{isEditing ? "Editar usuario" : "Crear nuevo usuario"}</h2>

//       {isEditing && (
//         <p className="muted">
//           Editando: <strong>{editingUser!.username}</strong>{" "}
//           <Link to="/user" replace className="btn">
//             Cancelar edicion
//           </Link>
//         </p>
//       )}

//       <FlashMessages
//         flash={flash}
//         successMessages={{
//           created: "Usuario creado con éxito.",
//           updated: "Usuario modificado con éxito.",
//           deleted: "Usuario eliminado con éxito.",
//         }}
//         actionError={actionData}
//       />

//       <Form
//         method="post"
//         action={isEditing ? `.${location.search}` : "."}
//         className="user-form"
//       >
//         <label htmlFor="username">Nombre de usuario *</label>
//         <input
//           id="username"
//           name="username"
//           type="text"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//           aria-required
//         />
//         <select
//           id="roles"
//           name="roles"
//           value={role}
//           onChange={(e) => setRole(e.target.value)}
//           required
//           aria-required
//         >
//           <option value="ADMIN">Administrador</option>
//           <option value="MANAGER">Editor</option>
//           <option value="CASHIER">Cajero/a</option>
//         </select>
//         {isEditing ? (
//           <button
//             type="button"
//             onClick={() => setPasswordInput(!passwordInput)}
//           >
//             Resetear contraseña
//           </button>
//         ) : null}
//         {!isEditing || passwordInput ? (
//           <>
//             <label htmlFor="password">Contraseña *</label>
//             <input id="password" name="password" type="text" />
//           </>
//         ) : null}
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

//       <h2>Lista de usuarios</h2>

//       <table>
//         <thead>
//           <tr>
//             <th>Nombre</th>
//             <th>Descripción</th>
//             <th style={{ width: 220 }}>Acciones</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user) => (
//             <tr
//               key={user.id}
//               className={
//                 editingUser?.id === user.id ? "row row--editing" : "row"
//               }
//             >
//               <td>{user.username}</td>
//               <td>{user.role}</td>
//               <td className="actions">
//                 <Link to={`?id=${user.id}`}>
//                   <button type="button">Modificar</button>
//                 </Link>
//                 <fetcher.Form
//                   method="post"
//                   action="."
//                   onSubmit={(e) => {
//                     if (!confirm("¿Seguro que desea eliminar este usuario?")) {
//                       e.preventDefault();
//                     }
//                   }}
//                   style={{ display: "inline-block", marginLeft: 8 }}
//                 >
//                   <input type="hidden" name="id" value={user.id} />
//                   <input type="hidden" name="_action" value="delete" />
//                   <button type="submit" disabled={deleting}>
//                     {deleting ? "Eliminando..." : "Eliminar"}
//                   </button>
//                 </fetcher.Form>

//                 {fetcher.data?.error && (
//                   <div className="inline-error" role="alert">
//                     {fetcher.data.error}
//                   </div>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export function UserListErrorBoundary({ error }: { error: unknown }) {
//   let message = "Ocurrió un error al cargar la lista de cuentas.";
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
import type { UserLoaderData } from "~/feature/user/user";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { UserForm } from "../ui/UserForm";
import { UserTable } from "../ui/UserTable";

useUrlSuccessFlash("user");

export function UserPanelScreen() {
  const { users, editingUser, flash } = useLoaderData<UserLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingUser;
  const deleting = fetcher.state !== "idle";

  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("user");
  const { prompt, dismiss } = useReactivateFlow("user");
  const { message } = useCrudSuccess("user", {
    "created-success": "Proveedor creado con éxito.",
    "updated-success": "Proveedor modificado con éxito.",
    "deleted-success": "Proveedor eliminado con éxito.",
    "reactivated-success": "Proveedor reactivado con éxito.",
  });

  return (
    <div>
      <h1>Proveedor</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="proveedor"
        name={editingUser?.username ?? null}
        cancelHref="/user"
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
            `Se ha detectado una cuenta inactiva con este nombre. 
            Â¿Desea reactivarla? Si reactiva la antigua cuenta, la cuenta actual se desactivarÃ¡. 
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una cuenta inactiva con este nombre. 
            Â¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingUser?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <UserForm
        isEditing={isEditing}
        editing={editingUser}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <UserTable users={users} editingId={editingUser?.id ?? null} />
    </div>
  );
}

export function UserPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de usuarios.";
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
