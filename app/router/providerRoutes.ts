import { route } from "@react-router/dev/routes";

export default [
  route("provider/create", "routes/provider/create.tsx"),
  route("provider/create-success", "routes/provider/create-success.tsx"),
  route("provider/list", "routes/provider/list.tsx"),
  route("provider/:id/edit", "routes/provider/edit.tsx"),
  route("provider/edit-success", "routes/provider/edit-success.tsx"),
  route("provider/:id/deactivate", "routes/provider/deactivate.tsx"),
];
