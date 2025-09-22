import { route } from "@react-router/dev/routes";

export default [
  route("brand/create", "routes/brand/create.tsx"),
  route("brand/create-success", "routes/brand/create-success.tsx"),
  route("brand/list", "routes/brand/list.tsx"),
  route("brand/:id/edit", "routes/brand/edit.tsx"),
  route("brand/edit-success", "routes/brand/edit-success.tsx"),
  route("brand/:id/deactivate", "routes/brand/deactivate.tsx"),
];
