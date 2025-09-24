import { route } from "@react-router/dev/routes";

export default [
  route("payment/create", "routes/payment/create.tsx"),
  route("payment/create-success", "routes/payment/create-success.tsx"),
  route("payment/list", "routes/payment/list.tsx"),
  route("payment/:id/edit", "routes/payment/edit.tsx"),
  route("payment/edit-success", "routes/payment/edit-success.tsx"),
  route("payment/:id/deactivate", "routes/payment/deactivate.tsx"),
];
