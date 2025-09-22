import { route } from "@react-router/dev/routes";

export default [
  route("bartable/create", "routes/bartable/create.tsx"),
  route("bartable/create-success", "routes/bartable/create-success.tsx"),
  route("bartable/list", "routes/bartable/list.tsx"),
  route("bartable/:id/edit", "routes/bartable/edit.tsx"),
  route("bartable/edit-success", "routes/bartable/edit-success.tsx"),
  route("bartable/:id/deactivate", "routes/bartable/deactivate.tsx"),
];
