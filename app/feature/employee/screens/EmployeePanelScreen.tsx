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
// import type { EmployeeLoaderData } from "../employee";
// import { FlashMessages } from "~/shared/ui/FlashMessages";

// export function EmployeePanelScreen() {
//   const { employees, editingEmployee, flash } =
//     useLoaderData<EmployeeLoaderData>();
//   const actionData = useActionData() as
//     | { error?: string; source?: "client" | "server" }
//     | undefined;
//   const navigation = useNavigation();
//   const location = useLocation();
//   const fetcher = useFetcher();

//   const isSubmitting = navigation.state === "submitting";
//   const isEditing = !!editingEmployee;
//   const deleting = fetcher.state !== "idle";


  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("employee");
//   const [name, setName] = useState(editingEmployee?.name ?? "");
//   const [dni, setDni] = useState(editingEmployee?.dni ?? "");
//   const [telephone, setTelephone] = useState(editingEmployee?.telephone ?? "");
//   const [email, setEmail] = useState(editingEmployee?.email ?? "");
//   const [address, setAddress] = useState(editingEmployee?.address ?? "");

//   useEffect(() => {
//     if (isEditing) {
//       setName(editingEmployee?.name ?? "");
//       setDni(editingEmployee?.dni ?? "");
//       setTelephone(editingEmployee?.telephone ?? "");
//       setEmail(editingEmployee?.email ?? "");
//       setAddress(editingEmployee?.address ?? "");
//     } else if (!isEditing) {
//       setName("");
//       setDni("");
//       setTelephone("");
//       setEmail("");
//       setAddress("");
//     }
//   }, [editingEmployee?.id, isEditing, flash, location.key]);

//   return (
//     <div>
//       <h1>Empleados</h1>
//       <h2>{isEditing ? "Editar empleado" : "Crear nuevo empleado"}</h2>

//       {isEditing && (
//         <p className="muted">
//           Editando: <strong>{editingEmployee!.name}</strong>{" "}
//           <Link to="/employee" replace className="btn">
//             Cancelar edicion
//           </Link>
//         </p>
//       )}

//       <FlashMessages
//         flash={flash}
//         successMessages={{
//           created: "Empleado creado con Ã©xito.",
//           updated: "Empleado modificado con Ã©xito.",
//           deleted: "Empleado eliminado con Ã©xito.",
//         }}
//         actionError={actionData}
//       />

//       <Form
//         method="post"
//         action={isEditing ? `.${location.search}` : "."}
//         className="employee-form"
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
//           title="Campo obligatorio."
//         />
//         <label htmlFor="dni">DNI</label>
//         <input
//           id="dni"
//           name="dni"
//           type="number"
//           value={dni}
//           onChange={(e) => setDni(e.target.value)}
//           maxLength={8}
//         />
//         <label htmlFor="telephone">Telefono</label>
//         <input
//           id="telephone"
//           name="telephone"
//           type="tel"
//           value={telephone}
//           onChange={(e) => setTelephone(e.target.value)}
//           pattern="\d{6,13}"
//         />
//         <label htmlFor="email">E-mail</label>
//         <input
//           id="email"
//           name="email"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
//         />
//         <label htmlFor="address">Domicilio</label>
//         <input
//           id="address"
//           name="address"
//           value={address}
//           onChange={(e) => setAddress(e.target.value)}
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

//       <h2>Lista de empleados</h2>
//       {employees.length === 0 ? (
//         <p>No hay empleados activos.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Nombre</th>
//               <th>DNI</th>
//               <th>Telefono</th>
//               <th>E-mail</th>
//               <th>Domicilio</th>
//               <th style={{ width: 220 }}>Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {employees.map((employee) => (
//               <tr
//                 key={employee.id}
//                 className={
//                   editingEmployee?.id === employee.id
//                     ? "row row--editing"
//                     : "row"
//                 }
//               >
//                 <td>{employee.name}</td>
//                 <td>{employee.dni}</td>
//                 <td>{employee.telephone}</td>
//                 <td>{employee.email}</td>
//                 <td>{employee.address}</td>
//                 <td className="actions">
//                   <Link to={`?id=${employee.id}`}>
//                     <button type="button">Modificar</button>
//                   </Link>
//                   <fetcher.Form
//                     method="post"
//                     action="."
//                     onSubmit={(e) => {
//                       if (
//                         !confirm("Â¿Seguro que desea eliminar este empleado?")
//                       ) {
//                         e.preventDefault();
//                       }
//                     }}
//                     style={{ display: "inline-block", marginLeft: 8 }}
//                   >
//                     <input type="hidden" name="id" value={employee.id} />
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

// export function EmployeePanelErrorBoundary({ error }: { error: unknown }) {
//   let message = "OcurriÃ³ un error al cargar la lista de empleados.";
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
import type { EmployeeLoaderData } from "~/feature/employee/employee";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { EmployeeForm } from "../ui/EmployeeForm";
import { EmployeeTable } from "../ui/EmployeeTable";

export function EmployeePanelScreen() {
  const { employees, editingEmployee, flash } =
    useLoaderData<EmployeeLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingEmployee;
  const deleting = fetcher.state !== "idle";

  
  // Convierte flags de éxito en client flash y limpia la URL
  useUrlSuccessFlash("employee");
const { prompt, dismiss } = useReactivateFlow("employee");
  const { message } = useCrudSuccess("employee", {
    "created-success": "Empleado creado con Ã©xito.",
    "updated-success": "Empleado modificado con Ã©xito.",
    "deleted-success": "Empleado eliminado con Ã©xito.",
    "reactivated-success": "Empleado reactivado con Ã©xito.",
  });

  return (
    <div>
      <h1>Empleados</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="empleado"
        name={editingEmployee?.name ?? null}
        cancelHref="/employee"
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
            `Se ha detectado un empleado inactivo con este nombre. 
            Â¿Desea reactivarlo? Si reactiva el antiguo empleado, el empleado actual se desactivarÃ¡. 
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado un empleado inactivo con este nombre. 
            Â¿Desea reactivarlo? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="name"
          inactiveId={prompt.elementId}
          currentId={editingEmployee?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <EmployeeForm
        isEditing={isEditing}
        editing={editingEmployee}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <EmployeeTable
        employees={employees}
        editingId={editingEmployee?.id ?? null}
      />
    </div>
  );
}

export function EmployeePanelErrorBoundary({ error }: { error: unknown }) {
  let message = "OcurriÃ³ un error al cargar la lista de empleados.";
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


