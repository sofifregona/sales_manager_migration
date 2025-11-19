import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Public login route
  route("login", "routes/login.tsx"),

  // Private area: everything nested requires session
  route("", "routes/_private.tsx", [
    // If authenticated, land on Orders via redirect
    index("routes/index-landing.tsx"),
    route("account", "routes/account.tsx"),
    route("bartable", "routes/bartable.tsx"),
    route("brand", "routes/brand.tsx"),
    route("category", "routes/category.tsx"),
    route("employee", "routes/employee.tsx"),
    route("payment", "routes/payment.tsx"),
    route("provider", "routes/provider.tsx"),
    route("product", "routes/product.tsx"),
    route("sale", "routes/sale/sale.tsx"),
    route("sale/order", "routes/sale/order.tsx"),
    route("sale/:id/edit", "routes/sale/edit.tsx"),
    route("transaction", "routes/transaction.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
