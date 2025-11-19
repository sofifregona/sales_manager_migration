import express from "express";
import cors from "cors";
import session from "express-session";
import connectRedis from "connect-redis";
import { createClient } from "redis";
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
import RedisStore from "connect-redis";

export async function buildApp() {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";
  const FRONTEND_ORIGIN =
    process.env.FRONTEND_ORIGIN || "http://localhost:5173";

  app.set("trust proxy", 1);
  app.use(express.json());

  // CORS primero
  app.use(
    cors({
      origin: FRONTEND_ORIGIN,
      credentials: true,
    })
  );

  // Sesión: Redis si está definido REDIS_URL; si no, MemoryStore (dev)
  const REDIS_URL = process.env.REDIS_URL;
  if (REDIS_URL) {
    const redisClient = createClient({ url: REDIS_URL });
    await redisClient.connect();
    const sessionStore = new RedisStore({
      client: redisClient,
      prefix: "sess:",
    });
    app.use(
      session({
        name: "sid",
        store: sessionStore,
        secret: process.env.SESSION_SECRET || "dev-secret-change-me",
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
          httpOnly: true,
          sameSite: "lax",
          secure: isProd,
          maxAge: 1000 * 60 * 60 * 8,
        },
      })
    );
  } else {
    app.use(
      session({
        name: "sid",
        secret: process.env.SESSION_SECRET || "dev-secret-change-me",
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
          httpOnly: true,
          sameSite: "lax",
          secure: isProd,
          maxAge: 1000 * 60 * 60 * 8,
        },
      })
    );
  }

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
