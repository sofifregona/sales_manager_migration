import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Public login route
  route("login", "routes/login.tsx"),

  // Private area: everything nested requires session
  route("", "routes/_private.tsx", [
    // If authenticated, land on Orders via redirect
    index("routes/index-landing.tsx"),
    route("settings/account", "routes/account.tsx"),
    route("settings/bartable", "routes/bartable.tsx"),
    route("settings/brand", "routes/brand.tsx"),
    route("settings/category", "routes/category.tsx"),
    route("settings/employee", "routes/employee.tsx"),
    route("settings/payment-method", "routes/payment-method.tsx"),
    route("settings/provider", "routes/provider.tsx"),
    route("settings/product", "routes/product.tsx"),
    route("sale", "routes/sale/sale.tsx"),
    route("sale/order", "routes/sale/order.tsx"),
    route("sale/:id/edit", "routes/sale/edit.tsx"),
    route("transaction", "routes/transaction.tsx"),
    route("settings/user", "routes/user.tsx"),
  ]),
] satisfies RouteConfig;
