import { route } from "@react-router/dev/routes";

export default [
  route("category/create", "routes/category/create.tsx"),
  route("category/create-success", "routes/category/create-success.tsx"),
  route("category/list", "routes/category/list.tsx"),
  route("category/:id/edit", "routes/category/edit.tsx"),
  route("category/edit-success", "routes/category/edit-success.tsx"),
  route("category/:id/deactivate", "routes/category/deactivate.tsx"),
];
