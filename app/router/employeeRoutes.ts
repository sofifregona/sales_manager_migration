import { route } from "@react-router/dev/routes";

export default [
  route("employee/create", "routes/employee/create.tsx"),
  route("employee/create-success", "routes/employee/create-success.tsx"),
  route("employee/list", "routes/employee/list.tsx"),
  route("employee/:id/edit", "routes/employee/edit.tsx"),
  route("employee/edit-success", "routes/employee/edit-success.tsx"),
  route("employee/:id/deactivate", "routes/employee/deactivate.tsx"),
];
