import { route } from "@react-router/dev/routes";

export default [
  route("sale/create", "routes/sale/create.tsx"),
  //   route("sale/create-success", "routes/sale/create-success.tsx"),
  route("sale/list", "routes/sale/list.tsx"),
  route("sale/:id/edit", "routes/sale/edit.tsx"),
  // route("sale/edit-success", "routes/sale/edit-success.tsx"),
  // route("sale/:id/deactivate", "routes/sale/deactivate.tsx"),
];
