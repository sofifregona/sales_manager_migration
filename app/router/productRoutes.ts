import { route } from "@react-router/dev/routes";

export default [
  route("product/create", "routes/product/create.tsx"),
  route("product/create-success", "routes/product/create-success.tsx"),
  route("product/list", "routes/product/list.tsx"),
  route("product/:id/edit", "routes/product/edit.tsx"),
  route("product/edit-success", "routes/product/edit-success.tsx"),
  route("product/:id/deactivate", "routes/product/deactivate.tsx"),
];
