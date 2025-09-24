import { type RouteConfig, index, route } from "@react-router/dev/routes";
import bartableRoutes from "./router/bartableRoutes";
import brandRoutes from "./router/brandRoutes";
import categoryRoutes from "./router/categoryRoutes";
import employeeRoutes from "./router/employeeRoutes";
import paymentRoutes from "./router/paymentRoutes";
import providerRoutes from "./router/providerRoutes";
import productRoutes from "./router/productRoutes";
<<<<<<< HEAD
import saleRoutes from "./router/saleRoutes";
=======
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87

export default [
  index("routes/home.tsx"),
  ...bartableRoutes,
  ...brandRoutes,
  ...categoryRoutes,
  ...employeeRoutes,
  ...paymentRoutes,
  ...providerRoutes,
  ...productRoutes,
<<<<<<< HEAD
  ...saleRoutes,
=======
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
] satisfies RouteConfig;
