import express from "express";
import cors from "cors";
import session from "express-session";
import morgan from "morgan";
import accountRoutes from "./modules/account/account.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import bartableRoutes from "./modules/bartable/bartable.routes.js";
import brandRoutes from "./modules/brand/brand.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import employeeRoutes from "./modules/employee/employee.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import providerRoutes from "./modules/provider/provider.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import saleRoutes from "./modules/sale/sale.routes.js";
import transactionRoutes from "./modules/transaction/transaction.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import { requireAuth } from "./shared/guards/auth.guard.js";

import {
  errorMiddleware,
  notFoundMiddleware,
} from "./shared/http/error-middleware.js";
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());
  app.set("trust proxy", 1);
  app.use(
    session({
      name: "sid",
      secret: process.env.SESSION_SECRET || "dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 8,
      },
    })
  );

  app.use(morgan("dev"));
  // API version header
  app.use((_, res, next) => {
    res.setHeader("API-Version", "v1");
    next();
  });
  // v1 routes
  app.use("/api/v1", authRoutes);
  app.use("/api/v1", requireAuth);
  app.use("/api/v1", accountRoutes);
  app.use("/api/v1", bartableRoutes);
  app.use("/api/v1", brandRoutes);
  app.use("/api/v1", categoryRoutes);
  app.use("/api/v1", employeeRoutes);
  app.use("/api/v1", paymentRoutes);
  app.use("/api/v1", providerRoutes);
  app.use("/api/v1", productRoutes);
  app.use("/api/v1", saleRoutes);
  app.use("/api/v1", transactionRoutes);
  app.use("/api/v1", userRoutes);

  // Not found + error handlers
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
}
